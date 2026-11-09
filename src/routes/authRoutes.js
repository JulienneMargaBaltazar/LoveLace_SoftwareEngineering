import crypto from 'crypto';
import express from 'express';
import bcrypt from 'bcryptjs';
import authMiddleware from '../middleware/authMiddleware.js';
import { supabase } from '../config/supabaseClient.js';

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

      let redirectUrl = '/user-dashboard.html';
      const roleId = Number(user.role_id);
      if (roleId === 1) {
        redirectUrl = '/superadmin-dashboard.html';
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

    const resetLink = `http://localhost:3000/passwordreset.html?token=${resetToken}`;
    console.log(`\n🔗 [SIMULATED EMAIL DISPATCH] ----------------------------------------`);
    console.log(`To: ${email}`);
    console.log(`Password Reset Link: ${resetLink}`);
    console.log(`----------------------------------------------------------------------\n`);

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
