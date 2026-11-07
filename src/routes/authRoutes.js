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

    // TC-02: Boundary Violation Length Check
    if (password.length < 8) {
      return res.status(400).json({ 
        error: "Password does not meet the structural minimum length requirements." 
      });
    }

    // TC-03: Password Complexity Constraints Check (Requires special tokens/integers)
    const complexityRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>_]).+$/;
    if (!complexityRegex.test(password)) {
      return res.status(400).json({ 
        error: "password complexity constraints (missing special tokens/integers) were not satisfied." 
      });
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

// 1. POST /api/auth/login - Authenticate user, create session, and determine redirect
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Fetch user from database including role_id and status flags
    const { data: user, error: fetchError } = await supabase
      .from('app_user')
      .select('user_id, first_name, last_name, email, password_hash, role_id, is_blocked, status')
      .eq('email', email)
      .single();

    if (fetchError || !user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Security checks
    if (user.is_blocked) {
      return res.status(403).json({ error: 'Account is blocked. Contact an administrator.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is pending approval.' });
    }

    // Compare password hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Save user details to server-side session
    req.session.userId = user.user_id;
    req.session.roleId = user.role_id;
    req.session.firstName = user.first_name;
    req.session.lastName = user.last_name;

    // Determine target dashboard based on role_id
    let redirectUrl = '/user-dashboard.html';
    if (user.role_id === 1) {
      redirectUrl = '/superadmin-dashboard.html';
    } else if (user.role_id === 2) {
      redirectUrl = '/dashboard.html';
    }

    res.status(200).json({ 
      message: 'Login successful.',
      redirectUrl 
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// 2. GET /api/dashboard - Verify session and return user session metadata to frontend
router.get('/dashboard', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized session.' });
  }

  res.status(200).json({
    userSessionData: {
      userId: req.session.userId,
      roleId: req.session.roleId, // Exposes roleId to frontend for conditional UI rendering
      firstName: req.session.firstName,
      lastName: req.session.lastName
    }
  });
});

// 3. POST /api/auth/logout - Terminate session
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out, please try again.' });
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.status(200).json({ message: 'Logged out successfully.' });
  });
});

export default router;