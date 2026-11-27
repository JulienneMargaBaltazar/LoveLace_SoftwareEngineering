import crypto from 'crypto';
import express from 'express';
import bcrypt from 'bcryptjs';
import authMiddleware from '../middleware/authMiddleware.js';
import { supabase } from '../config/supabaseClient.js';
import {
  issueVerificationToken,
  checkResendRateLimit,
  consumeAndVerifyToken
} from '../services/emailVerificationService.js';
import nodemailer from 'nodemailer';

const mailer = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
});

const router = express.Router();

// ==========================================
// PASSWORD COMPLEXITY VALIDATOR HELPER
// ==========================================
const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/\d/.test(password)) {
    return 'Password must contain at least one number.';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
};

// ==========================================
// 1. SIGNUP ROUTE
// ==========================================
router.post('/signup', async (req, res) => {
  try {
    const firstName = typeof req.body.first_name === 'string' ? req.body.first_name.trim() : '';
    const lastName = typeof req.body.last_name === 'string' ? req.body.last_name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    // Enforce required fields with uniform casing variables
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        error: 'First name, last name, email, and password are required.'
      });
    }

    // Enforce strong password complexity rules
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { data: insertData, error } = await supabase
      .from('app_user')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        password_hash: passwordHash,
        role_id: 3,
        status: 'pending',
        is_blocked: false,
        is_first_login: true
      })
      .select();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }
      return res.status(400).json({ error: error.message });
    }

    const newUser = insertData[0];
    if (newUser) {
      delete newUser.password_hash;
      try {
        await issueVerificationToken({
          userId: newUser.user_id,
          email: newUser.email,
          firstName: newUser.first_name,
          purpose: 'email_verification',
          invalidateExisting: false
        });
      } catch (verifyErr) {
        console.error('Failed to dispatch verification email on signup:', verifyErr.message);
      }
    }

    return res.status(201).json({
      message: 'Registration successful! Your account is currently pending administrative approval.',
      user: newUser
    });

  } catch (err) {
    console.error('Unexpected server error during registration:', err.message);
    return res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
});

// ==========================================
// 2. LOGIN ROUTE (Unified Database & GoTrue Session Backing)
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Try primary application user authentication
    const { data: user, error: fetchError } = await supabase
      .from('app_user')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    // Fallback: If local record isn't present, check GoTrue instances
    if (fetchError || !user) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      req.session.userId = data.user.id;
      req.session.accessToken = data.session.access_token;
      req.session.roleId = data.user.user_metadata?.roleId || 3;

      return res.status(200).json({ 
        message: 'Login successful.',
        user: data.user
      });
    }

    // Security validation checks
    if (user.is_blocked || user.status === 'blocked') {
      return res.status(403).json({ error: 'Access denied. This account has been blocked.' });
    }

    if (user.status !== 'active' && user.status !== 'Active') {
      return res.status(403).json({ error: 'Account is pending approval.' });
    }

    // Hash integrity verification
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Save mapping structures inside server-side memory layouts
    req.session.userId = user.user_id;
    req.session.email = user.email;
    req.session.roleId = Number(user.role_id);
    req.session.firstName = user.first_name;
    req.session.lastName = user.last_name;

    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Internal server error during login.' });
      }

      if (user.is_first_login) {
        return res.status(200).json({
          requiresPasswordReset: true,
          message: 'First-time login detected. Please update your password.'
        });
      }

      let redirectUrl = '/dashboard.html';
      const roleId = Number(user.role_id);
      if (roleId === 1) {
        redirectUrl = '/dashboard.html';
      } else if (roleId === 2) {
        redirectUrl = '/dashboard.html';
      }

      return res.status(200).json({ 
        message: 'Login successful!',
        redirectUrl,
        user: {
          id: user.user_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          status: user.status,
          roleId: user.role_id
        }
      });
    });

  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// ==========================================
// 3. SET-PASSWORD ON FIRST LOGIN
// ==========================================
router.post('/set-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }

    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);

    const { data, error } = await supabase
      .from('app_user')
      .update({
        password_hash,
        is_first_login: false,
        status: 'active'
      })
      .eq('email', email)
      .select()
      .single();

    if (error || !data) {
      return res.status(400).json({ error: 'Failed to update password.' });
    }

    return res.status(200).json({ message: 'Password updated successfully! You may now proceed.' });

  } catch (err) {
    console.error('Set-password error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ==========================================
// 4. REQUEST PASSWORD RESET
// ==========================================
router.post('/forgotpassword', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const { data: user, error } = await supabase
      .from('app_user')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('Supabase query error during forgotpassword:', error);
      return res.status(500).json({ error: 'Internal server error.' });
    }

    if (!user) {
      return res.status(200).json({ 
        message: 'If that email address is registered, a password reset link has been dispatched.' 
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    const { error: updateError } = await supabase
      .from('app_user')
      .update({
        reset_token: resetToken,
        reset_token_expires: tokenExpires.toISOString()
      })
      .eq('user_id', user.user_id);

    if (updateError) {
      console.error('Database update error during password reset request:', updateError);
      return res.status(500).json({ error: 'Internal server error.' });
    }

    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
const resetLink = `${baseUrl}/passwordreset.html?token=${resetToken}`;

try {
  await mailer.sendMail({
    from: `"Love Lace ERP" <${process.env.MAIL_USER}>`,
    to: user.email,
    subject: 'Reset your Love Lace ERP password',
    html: `
      <p>Hello,</p>
      <p>We received a request to reset your password. Click the link below (valid for 15 minutes):</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `
  });
  console.log(`✅ Reset email sent to ${user.email}`);
} catch (mailErr) {
  console.error('❌ Failed to send reset email:', mailErr.message);
}

    return res.status(200).json({ 
      message: 'If that email address is registered, a password reset link has been dispatched.' 
    });

  } catch (err) {
    console.error('Forgot password fatal error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});
// ==========================================
// 5. RESET PASSWORD WITH TOKEN
// ==========================================
router.post('/passwordreset', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // 1. Enforce payload parameter presence
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }

    // 2. Run password validation check rules
    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // 3. Locate matching user by token signature
    const { data: user, error } = await supabase
      .from('app_user')
      .select('*')
      .eq('reset_token', token)
      .maybeSingle();

    if (error || !user) {
      return res.status(400).json({ error: 'Invalid or already used password reset token.' });
    }

    // 4. Verify token age expiration validation rules
    const now = new Date();
    const expiresAt = new Date(user.reset_token_expires);

    if (now > expiresAt) {
      return res.status(400).json({ error: 'Password reset token has expired. Please request a new one.' });
    }

    // 5. Generate secure hash signature mutations
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 6. Save update mutations and invalidate token signatures instantly
    const { error: mutationError } = await supabase
      .from('app_user')
      .update({
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
        is_first_login: false
      })
      .eq('user_id', user.user_id);

    if (mutationError) {
      console.error('Failed to commit password mutation:', mutationError);
      return res.status(500).json({ error: 'Failed to update password.' });
    }

    return res.status(200).json({ 
      message: 'Password successfully updated! You can now log in with your new credentials.' 
    });

  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

import { createClient } from "@supabase/supabase-js";

const opts = { auth: { autoRefreshToken: false, persistSession: false } };
const authClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY,
  opts
);
const admin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  opts
);

// Step 1: request a password reset code
router.post("/request-password-reset", async (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }

  try {
    const { error } = await authClient.auth.resetPasswordForEmail(email);
    if (error) {
      console.error("Password reset email error:", error);
      return res.status(error.status === 429 ? 429 : 502).json({
        error: "Unable to send a reset code. Please try again later."
      });
    }
    res.json({ message: "If an account exists for this email, a verification code has been sent." });
  } catch (err) {
    console.error("Password reset email error:", err);
    res.status(500).json({ error: "Unable to send a reset code. Please try again later." });
  }
});

// Step 2: verify the 8-digit code using a fresh client
router.post("/verify-password-reset", async (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
  const code = typeof req.body.code === "string" ? req.body.code.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{8}$/.test(code)) {
    return res.status(400).json({ error: "Enter a valid email address and eight-digit code." });
  }

  try {
    const recoveryClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY,
      opts
    );
    const { data, error } = await recoveryClient.auth.verifyOtp({
      email,
      token: code,
      type: "recovery"
    });
    if (error || !data.session) {
      return res.status(400).json({ error: "The verification code is invalid or expired." });
    }
    res.json({ access_token: data.session.access_token });
  } catch (err) {
    console.error("Password reset verification error:", err);
    res.status(500).json({ error: "Unable to verify the reset code. Please try again." });
  }
});

// Step 3: set the new password using the recovery token from step 2
router.post("/reset-password", async (req, res) => {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const { newPassword } = req.body;
  if (!token) return res.status(401).json({ error: "Password reset verification is required." });
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  try {
    const { data, error: tokenError } = await admin.auth.getUser(token);
    if (tokenError || !data.user) {
      return res.status(401).json({ error: "The reset session is invalid or expired. Request a new code." });
    }

    const { error } = await admin.auth.admin.updateUserById(data.user.id, { password: newPassword });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Password reset successfully." });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ error: "Unable to reset the password. Please try again." });
  }
});


// ==========================================
// EMAIL VERIFICATION ROUTES (S1-DBA-07)
// ==========================================
const handleVerifyEmail = async (req, res) => {
  try {
    const rawToken =
      typeof req.query.token === 'string'
        ? req.query.token
        : typeof req.body?.token === 'string'
        ? req.body.token
        : '';

    const result = await consumeAndVerifyToken(rawToken);
    if (result.status !== 200) {
      return res.status(result.status).json({
        error: result.error,
        can_resend: Boolean(result.canResend),
        ...(result.email ? { email: result.email } : {})
      });
    }

    return res.status(200).json({
      message: result.purpose === 'email_change'
        ? 'New email address verified and updated successfully.'
        : 'Email address verified successfully.',
      verified: true,
      email: result.email,
      email_verified_at: result.emailVerifiedAt
    });
  } catch (err) {
    console.error('Email verification error:', err);
    return res.status(500).json({ error: 'Unable to verify email right now. Please try again later.' });
  }
};

router.get('/verify-email', handleVerifyEmail);
router.post('/verify-email', handleVerifyEmail);

router.post('/resend-verification', async (req, res) => {
  const genericResponse = {
    message: 'If an unverified account exists for this email, a new verification link has been sent.'
  };

  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }

    const { data: user, error: userError } = await supabase
      .from('app_user')
      .select('user_id, email, first_name, is_verified, email_verified_at')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      console.error('Resend verification user lookup error:', userError);
      return res.status(200).json(genericResponse);
    }

    // Enumeration protection: return generic 200 if user does not exist or is already verified
    if (!user || Boolean(user.is_verified || user.email_verified_at)) {
      return res.status(200).json(genericResponse);
    }

    const rateCheck = await checkResendRateLimit(user.user_id);
    if (!rateCheck.allowed) {
      if (rateCheck.reason === 'cooldown') {
        return res.status(429).json({
          error: `Please wait ${rateCheck.retryAfterSeconds} seconds before requesting another verification email.`,
          retry_after_seconds: rateCheck.retryAfterSeconds
        });
      }
      return res.status(429).json({
        error: 'Too many verification emails requested. Please try again later.'
      });
    }

    await issueVerificationToken({
      userId: user.user_id,
      email: user.email,
      firstName: user.first_name,
      purpose: 'email_verification',
      invalidateExisting: true
    });

    return res.status(200).json(genericResponse);
  } catch (err) {
    console.error('Resend verification error:', err);
    return res.status(500).json({ error: 'Unable to process verification request right now.' });
  }
});

export default router;