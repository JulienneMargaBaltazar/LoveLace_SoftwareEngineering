import crypto from 'crypto';
import express from 'express';
import bcrypt from 'bcryptjs';
import authMiddleware from '../middleware/authMiddleware.js';
import { supabase } from '../config/supabaseClient.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'All fields (first_name, last_name, email, password) are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }


    const { data: existingUser, error: checkError } = await supabase
      .from('app_user')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 3. Insert the new user directly into the 'app_user' table
    const { data: insertData, error: insertError } = await supabase
      .from('app_user')
      .insert([
        {
          first_name,
          last_name,
          email,
          password_hash,
          status: 'pending',     
          is_blocked: false,
          role_id: 1,
          is_first_login: true 
        }
      ])
      .select();

    if (insertError) {
      return res.status(400).json({ error: insertError.message });
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
// LOGIN ROUTE (S1-DEV-03 - Requirement 1 & 3)
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Fetch user from the unified app_user table
    const { data: user, error } = await supabase
      .from('app_user')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Guardrail: Blocked users cannot sign in (Requirement 3)
    if (user.is_blocked || user.status === 'blocked') {
      return res.status(403).json({ error: 'Access denied. This account has been blocked.' });
    }

    // Validate password using bcryptjs
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Initialize session using express-session
    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.roleId = user.role_id;

    // FORCE the session to save before replying to the frontend
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Internal server error during session creation.' });
      }

      // Requirement 2: Check if it's the user's first login
      if (user.is_first_login) {
        return res.status(200).json({
          requiresPasswordReset: true,
          message: 'First-time login detected. Please update your password.'
        });
      }

      return res.status(200).json({
        message: 'Login successful!',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          status: user.status
        }
      });
    });

  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// ==========================================
// SET-PASSWORD ON FIRST LOGIN (Requirement 2)
// ==========================================
router.post('/set-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);

    // Update password, clear first login flag, and activate status
    const { data, error } = await supabase
      .from('app_user')
      .update({
        password_hash: password_hash,
        is_first_login: false,
        status: 'Active'
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

    const { data: user, error } = await supabase
      .from('app_user')
      .select('*')
      .eq('email', email)
      .single();

    // Security: Always return generic success message to prevent user enumeration
    if (error || !user) {
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
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ==========================================
// S1-DEV-04: RESET PASSWORD WITH TOKEN
// ==========================================
router.post('/passwordreset', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
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

    // Commit password change and immediately invalidate the token (Requirement 3)
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
// LOGOUT ROUTE (Requirement 1)
// ==========================================
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out, please try again.' });
    }
    res.clearCookie('connect.sid'); // Clears the session cookie
    return res.status(200).json({ message: 'Logged out successfully.' });
  });
});

router.get('/dashboard', authMiddleware, (req, res) => {
    res.json({
        message: 'Welcome to the dashboard',
        userSessionData: {
            userId: req.session.userId,
            email: req.session.email
        }
    });
});

export default router;