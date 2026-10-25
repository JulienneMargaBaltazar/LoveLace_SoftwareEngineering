import express from 'express';
import { supabase } from '../config/supabaseClient.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Guardrail: Server-side validation against empty or malformed inputs
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'All fields (fullName, email, password) are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user?.id;

    if (userId) {
      // 2. Enforce system baseline rule: default status to 'pending' in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            full_name: fullName,
            email: email,
            status: 'pending' // Requirement 3 & Guardrail enforcement
          }
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError.message);
      }
    }

    return res.status(201).json({
      message: 'Registration successful! Your account is currently pending administrative approval.',
      userId: userId
    });

  } catch (err) {
    console.error('Unexpected server error during registration:', err.message);
    return res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
});

export default router;