import express from 'express';
import bcrypt from 'bcryptjs';
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

    // Requirement 2: Check if it's the user's first login (mandatory set-password flow)
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

export default router;