import express from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabaseClient.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply requireAdmin middleware to all routes in this file
router.use(requireAdmin);

// 1. GET /api/admin/users - Retrieve user directory with strict Superadmin database filtering
router.get('/users', async (req, res) => {
  try {
    const requesterRoleId = req.session.roleId; // Make sure session matches roleId

    let query = supabase
      .from('app_user')
      .select('user_id, email, role_id, is_blocked, created_at');

    // GUARDRAIL: If the requester is a regular Admin (role_id === 2), hide Superadmin entries (role_id === 1)
    if (requesterRoleId === 2) {
      query = query.neq('role_id', 1);
    }

    const { data: users, error } = await query;
    if (error) throw error;

    res.status(200).json({ users });
  } catch (err) {
    console.error('Error fetching user directory:', err.message);
    res.status(500).json({ error: 'Internal server error while fetching users.' });
  }
});

// 2. POST /api/admin/users - Add a new user (with role restriction)
router.post('/users', async (req, res) => {
  try {
    const requesterRoleId = req.session.roleId;
    const { email, password, role_id } = req.body;

    // Regular Admins (role_id === 2) cannot create Superadmins (role_id === 1)
    if (requesterRoleId === 2 && Number(role_id) === 1) {
      return res.status(403).json({ error: 'Unauthorized: Admins cannot create Superadmin accounts.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('app_user')
      .insert([{ email, password_hash: hashedPassword, role_id, is_blocked: false }])
      .select();

    if (error) throw error;

    res.status(201).json({ message: 'User created successfully', user: data[0] });
  } catch (err) {
    console.error('Error creating user:', err.message);
    res.status(500).json({ error: 'Internal server error while creating user.' });
  }
});

// 3. PATCH /api/admin/users/:userId/status - Toggle block/unblock status
router.patch('/users/:userId/status', async (req, res) => {
  try {
    const requesterRoleId = req.session.roleId;
    const { userId } = req.params;
    const { is_blocked } = req.body;

    // Fetch target user to check their role_id before modifying
    const { data: targetUser, error: fetchError } = await supabase
      .from('app_user')
      .select('role_id')
      .eq('user_id', userId)
      .single();

    if (fetchError || !targetUser) {
      return res.status(404).json({ error: 'Target user not found.' });
    }

    if (requesterRoleId === 2 && targetUser.role_id === 1) {
      return res.status(403).json({ error: 'Unauthorized: Cannot modify Superadmin status.' });
    }

    const { error: updateError } = await supabase
      .from('app_user')
      .update({ is_blocked })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    res.status(200).json({ message: `User successfully ${is_blocked ? 'blocked' : 'unblocked'}.` });
  } catch (err) {
    console.error('Error updating user status:', err.message);
    res.status(500).json({ error: 'Internal server error while updating user status.' });
  }
});

export default router;