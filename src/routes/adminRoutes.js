import express from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabaseClient.js';
import { requireAdmin, requireSuperadmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ---------------------------------------------------------
// STANDARD ADMIN & SUPERADMIN ROUTES (Protected by requireAdmin)
// ---------------------------------------------------------

// 1. GET /api/admin/users - Retrieve user directory
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const requesterRoleId = req.session.roleId;

    let query = supabase
      .from('app_user')
      .select('user_id, first_name, last_name, email, role_id, is_blocked, status, stamp'); // Updated to stamp

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

// 2. POST /api/admin/users - Add a new user
router.post('/users', requireAdmin, async (req, res) => {
  try {
    const { email, password } = req.body; 

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('app_user')
      .insert([{
        email,
        password_hash: hashedPassword,
        role_id: 3, // FORCED: All newly created users automatically default to standard user (Role ID 3)
        status: 'active',
        is_blocked: false
      }])
      .select();

    if (error) throw error;

    res.status(201).json({ message: 'User created successfully', user: data[0] });
  } catch (err) {
    console.error('Error creating user:', err.message);
    res.status(500).json({ error: 'Internal server error while creating user.' });
  }
});

// 3. PATCH /api/admin/users/:userId/status - Toggle block/unblock status
router.patch('/users/:userId/status', requireAdmin, async (req, res) => {
  try {
    const requesterRoleId = req.session.roleId;
    const { userId } = req.params;
    const { is_blocked } = req.body;

    const { data: targetUser, error: fetchError } = await supabase
      .from('app_user')
      .select('role_id, is_blocked')
      .eq('user_id', userId)
      .single();

    if (fetchError || !targetUser) {
      return res.status(404).json({ error: 'Target user not found.' });
    }

    if (requesterRoleId === 2 && targetUser.role_id === 1) {
      return res.status(403).json({ error: 'Unauthorized: Cannot modify Superadmin status.' });
    }

    // GUARDRAIL (S1-DEV-06): Prevent blocking the last remaining Superadmin
    if (targetUser.role_id === 1 && is_blocked === true) {
      const { count, error: countError } = await supabase
        .from('app_user')
        .select('user_id', { count: 'exact', head: true })
        .eq('role_id', 1)
        .eq('is_blocked', false);

      if (countError) throw countError;

      if (count <= 1) {
        return res.status(400).json({ 
          error: 'Action blocked: Cannot disable or block the last remaining Superadmin.' 
        });
      }
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


// ---------------------------------------------------------
// SUPERADMIN-ONLY ROUTES (Protected by requireSuperadmin)
// ---------------------------------------------------------

// 4. GET /api/admin/pending-users - Review pending registrations (Requirement 1)
router.get('/pending-users', requireSuperadmin, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('app_user')
      .select('user_id, first_name, last_name, email, role_id, status, stamp') // Updated to stamp
      .eq('status', 'pending');

    if (error) throw error;
    res.status(200).json({ users });
  } catch (err) {
    console.error('Error fetching pending users:', err.message);
    res.status(500).json({ error: 'Internal server error while fetching pending users.' });
  }
});

// 5. PATCH /api/admin/users/:userId/approve - Approve pending user (Requirement 1)
router.patch('/users/:userId/approve', requireSuperadmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role_id } = req.body; // Optional role assignment upon approval

    const updatePayload = { status: 'active' };
    if (role_id) updatePayload.role_id = role_id;

    const { data, error } = await supabase
      .from('app_user')
      .update(updatePayload)
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    res.status(200).json({ message: 'User approved and activated successfully.', user: data[0] });
  } catch (err) {
    console.error('Error approving user:', err.message);
    res.status(500).json({ error: 'Internal server error while approving user.' });
  }
});

// 6. PATCH /api/admin/users/:userId/role - Elevate or modify roles
router.patch('/users/:userId/role', requireSuperadmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { target_role_id } = req.body; 
    const currentSessionUserId = req.session.userId;

    if (currentSessionUserId && userId === currentSessionUserId) {
      return res.status(403).json({ 
        error: 'Action blocked: You cannot modify your own account role from the user directory.' 
      });
    }

    const { data: targetUser, error: fetchError } = await supabase
      .from('app_user')
      .select('role_id, is_blocked')
      .eq('user_id', userId)
      .single();

    if (fetchError || !targetUser) {
      return res.status(404).json({ error: 'Target user not found.' });
    }

    if (targetUser.role_id === 1 && Number(target_role_id) !== 1) {
      const { count, error: countError } = await supabase
        .from('app_user')
        .select('user_id', { count: 'exact', head: true })
        .eq('role_id', 1)
        .eq('is_blocked', false);

      if (countError) throw countError;

      if (count <= 1) {
        return res.status(400).json({ 
          error: 'Action blocked: Cannot demote the last remaining Superadmin account.' 
        });
      }
    }

    // Explicitly select role_id in the update response
    const { data, error: updateError } = await supabase
      .from('app_user')
      .update({ role_id: Number(target_role_id) })
      .eq('user_id', userId)
      .select('user_id, email, role_id, is_blocked');

    if (updateError) throw updateError;

    res.status(200).json({ message: 'User role updated successfully.', user: data[0] });
  } catch (err) {
    console.error('Error updating user role:', err.message);
    res.status(500).json({ error: 'Internal server error while updating user role.' });
  }
});
export default router;