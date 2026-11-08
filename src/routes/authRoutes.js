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
  const firstName = typeof req.body.first_name === 'string' ? req.body.first_name.trim() : '';
  const lastName = typeof req.body.last_name === 'string' ? req.body.last_name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      error: 'First name, last_name, email, and password are required.'
    });
  }

  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }

  try {
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
    delete newUser.password_hash;

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
// 2. LOGIN ROUTE
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Fetch user from database including role_id and status flags
    const { data: user, error: fetchError } = await supabase
      .from('app_user')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError || !user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Security checks (Blocked or Pending)
    if (user.is_blocked || user.status === 'blocked') {
      return res.status(403).json({ error: 'Access denied. This account has been blocked.' });
    }

    if (user.status !== 'active' && user.status !== 'Active') {
      return res.status(403).json({ error: 'Account is pending approval.' });
    }

    // Compare password hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Save user details to server-side session
    req.session.userId = user.user_id;
    req.session.email = user.email;
    req.session.roleId = Number(user.role_id);
    req.session.firstName = user.first_name;
    req.session.lastName = user.last_name;

    // Force session to save before replying to the frontend
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Internal server error during login.' });
      }

      // Check if it's the user's first login requiring a password reset/update
      if (user.is_first_login) {
        return res.status(200).json({
          requiresPasswordReset: true,
          message: 'First-time login detected. Please update your password.'
        });
      }

      // Determine target dashboard based on role_id
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
// S1-DEV-04: REQUEST PASSWORD RESET 
// ==========================================
router.post('/forgotpassword', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // Use .maybeSingle() to safely handle emails that are not found without throwing errors
    const { data: user, error } = await supabase
      .from('app_user')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Supabase query error during forgotpassword:', error);
      return res.status(500).json({ error: 'Internal server error.' });
    }

    // Security: Always return generic success message to prevent user enumeration
    if (!user) {
      return res.status(200).json({ 
        message: 'If that email address is registered, a password reset link has been dispatched.' 
      });
    }

    // Generate cryptographically secure random token & 15-minute expiration
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

    // Simulate email dispatch in the terminal
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
// RESET PASSWORD WITH TOKEN (Enforces Password Validator)
// ==========================================
router.post('/passwordreset', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }

    // Enforce password strength rules on password reset too
    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const { data: user, error } = await supabase
      .from('app_user')
      .select('*')
      .eq('reset_token', token)
      .single();

    if (error || !user) {
      return res.status(400).json({ error: 'Invalid or already used password reset token.' });
    }

    // Server-side expiration validation
    const now = new Date();
    const expiresAt = new Date(user.reset_token_expires);

    if (now > expiresAt) {
      return res.status(400).json({ error: 'Password reset token has expired. Please request a new one.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Commit password change and immediately invalidate the token
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

// ==========================================
// 6. DASHBOARD SESSION VERIFICATION
// ==========================================
router.get('/dashboard', authMiddleware, (req, res) => {
  res.status(200).json({
    message: 'Welcome to the dashboard',
    userSessionData: {
      userId: req.session.userId,
      email: req.session.email,
      roleId: req.session.roleId,
      firstName: req.session.firstName,
      lastName: req.session.lastName
    }
  });
});

// ==========================================
// 7. LOGOUT ROUTE
// ==========================================
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out, please try again.' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logged out successfully.' });
  });
});

router.post('/logout', async (req, res) => {
  try {
    // 1. Invalidate token on Supabase's authentication servers
    await supabase.auth.signOut();

    // 2. Clear local memory session storage
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: 'Could not log out of session.' });
        }
        res.clearCookie('connect.sid'); // Clear your session cookie
        return res.status(200).json({ message: 'Logged out successfully.' });
      });
    } else {
      return res.status(200).json({ message: 'Logged out successfully.' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Server logout error.' });
  }
});

router.post('/update-password', async (req, res) => {
  const { newPassword, access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({ error: 'Token missing.' });
  }

  // 1. Anchor the token to this server instance request context
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: access_token,
    refresh_token: req.body.refresh_token || ''
  });

  // CRITICAL FIX FOR TC-06 & TC-07: Catch age thresholds and already-consumed tokens
  if (sessionError) {
    return res.status(400).json({ 
      error: "Token expired. Please request a new verification path." 
    });
  }

  // 2. Commit the password modification payload
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  // CRITICAL FIX FOR TC-07: Globally revoke token instantly so it can never be processed a second time
  await supabase.auth.signOut();

  return res.status(200).json({ message: "Password updated successfully." });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  // CRITICAL FIX FOR TC-03 & TC-04: Secure mapping initialization
  req.session.userId = data.user.id;
  req.session.accessToken = data.session.access_token; // Save this for the middleware to read!
  req.session.roleId = data.user.user_metadata?.roleId || 3; // (or query your DB for role mapping)

  return res.status(200).json({ 
    message: 'Login successful.',
    user: data.user
  });
});


export default router;