import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { supabase } from '../config/supabaseClient.js';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const COOLDOWN_SECONDS = 60;
const MAX_PER_HOUR = 5;

const mailer = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export function hashVerificationToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export function generateVerificationTokenPair() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashVerificationToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();
  return { rawToken, tokenHash, expiresAt };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function dispatchVerificationEmailAsync({
  toEmail,
  firstName = '',
  rawToken,
  purpose = 'email_verification',
  maxRetries = 3
}) {
  const baseUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(rawToken)}`;
  const subject =
    purpose === 'email_change'
      ? 'Confirm Your New Email Address'
      : 'Verify Your Email Address';
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';

  const text = [
    greeting,
    '',
    purpose === 'email_change'
      ? 'Please confirm your updated email address by clicking the link below:'
      : 'Please verify your email address to activate your account by clicking the link below:',
    verifyUrl,
    '',
    'This link is single-use and expires in 24 hours.',
    'If you did not request this, you can safely ignore this email.'
  ].join('\n');

  const html = `
    <p>${greeting}</p>
    <p>${
      purpose === 'email_change'
        ? 'Please confirm your updated email address by clicking the link below:'
        : 'Please verify your email address to activate your account by clicking the link below:'
    }</p>
    <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    <p>This link is single-use and expires in 24 hours.</p>
    <p>If you did not request this, you can safely ignore this email.</p>
  `;

  setImmediate(async () => {
    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      try {
        await mailer.sendMail({
          from: process.env.MAIL_FROM || process.env.MAIL_USER,
          to: toEmail,
          subject,
          text,
          html
        });
        return;
      } catch (err) {
        console.error(`[EmailVerification] Dispatch attempt ${attempt}/${maxRetries} failed for ${toEmail}:`, err.message);
        if (attempt < maxRetries) {
          await sleep(500 * Math.pow(2, attempt - 1));
        }
      }
    }
    console.error(`[EmailVerification] Exhausted retries for ${toEmail}`);
  });
}

export async function issueVerificationToken({
  userId,
  email,
  firstName = '',
  purpose = 'email_verification',
  invalidateExisting = false
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const nowIso = new Date().toISOString();

  if (invalidateExisting) {
    await supabase
      .from('email_verification_tokens')
      .update({ consumed_at: nowIso })
      .eq('user_id', userId)
      .is('consumed_at', null);
  }

  const { rawToken, tokenHash, expiresAt } = generateVerificationTokenPair();

  const { error } = await supabase
    .from('email_verification_tokens')
    .insert({
      user_id: userId,
      email: normalizedEmail,
      token_hash: tokenHash,
      purpose,
      expires_at: expiresAt
    });

  if (error) {
    throw error;
  }

  dispatchVerificationEmailAsync({
    toEmail: normalizedEmail,
    firstName,
    rawToken,
    purpose
  });

  return { expiresAt };
}

export async function checkResendRateLimit(userId) {
  const oneHourAgoIso = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: recentTokens, error } = await supabase
    .from('email_verification_tokens')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', oneHourAgoIso)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const list = recentTokens || [];
  if (list.length >= MAX_PER_HOUR) {
    return { allowed: false, reason: 'hourly_limit' };
  }

  if (list.length > 0) {
    const latestMs = new Date(list[0].created_at).getTime();
    const elapsedSeconds = (Date.now() - latestMs) / 1000;
    if (elapsedSeconds < COOLDOWN_SECONDS) {
      return {
        allowed: false,
        reason: 'cooldown',
        retryAfterSeconds: Math.ceil(COOLDOWN_SECONDS - elapsedSeconds)
      };
    }
  }

  return { allowed: true };
}

export async function consumeAndVerifyToken(rawToken) {
  if (typeof rawToken !== 'string' || !/^[a-f0-9]{64}$/i.test(rawToken.trim())) {
    return { status: 400, error: 'Malformed verification token.', canResend: true };
  }

  const tokenHash = hashVerificationToken(rawToken.trim().toLowerCase());

  const { data: record, error: lookupError } = await supabase
    .from('email_verification_tokens')
    .select('id, user_id, email, purpose, expires_at, consumed_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (!record) {
    return { status: 400, error: 'Invalid verification token.', canResend: true };
  }

  if (record.consumed_at) {
    return {
      status: 410,
      error: 'This verification link has already been used.',
      canResend: true,
      email: record.email
    };
  }

  if (new Date(record.expires_at).getTime() <= Date.now()) {
    return {
      status: 410,
      error: 'This verification link has expired.',
      canResend: true,
      email: record.email
    };
  }

  const nowIso = new Date().toISOString();

  const { data: claimed, error: claimError } = await supabase
    .from('email_verification_tokens')
    .update({ consumed_at: nowIso })
    .eq('id', record.id)
    .is('consumed_at', null)
    .select('id, user_id, email, purpose')
    .maybeSingle();

  if (claimError) {
    throw claimError;
  }

  if (!claimed) {
    return {
      status: 410,
      error: 'This verification link has already been used.',
      canResend: true,
      email: record.email
    };
  }

  const userUpdatePayload = {
    is_verified: true,
    email_verified_at: nowIso,
    ...(claimed.purpose === 'email_change' ? { email: claimed.email } : {})
  };

  const { error: userUpdateError } = await supabase
    .from('app_user')
    .update(userUpdatePayload)
    .eq('user_id', claimed.user_id);

  if (userUpdateError) {
    throw userUpdateError;
  }

  return {
    status: 200,
    userId: claimed.user_id,
    email: claimed.email,
    purpose: claimed.purpose,
    emailVerifiedAt: nowIso
  };
}
