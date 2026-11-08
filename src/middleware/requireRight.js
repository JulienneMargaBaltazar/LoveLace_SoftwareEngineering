// src/middleware/requireRight.js
import { supabase } from '../config/supabaseClient.js';

const getUserId = req => req.session?.userId || req.session?.user_id || req.session?.id;

const hasElevatedRole = req => {
    const roleId = Number(req.session?.roleId || req.session?.role_id);
    return roleId === 1 || roleId === 2 || req.session?.isSuperAdmin;
};

async function hasRight(req, moduleName, actionKeys) {
    const userId = getUserId(req);
    if (hasElevatedRole(req)) return true;

    let query = supabase
        .from('user_rights')
        .select('action_key')
        .eq('user_id', String(userId))
        .eq('module_name', moduleName.toLowerCase())
        .eq('is_allowed', true)
        .eq('is_deleted', false)
        .limit(1);

    if (actionKeys.length > 0) {
        query = query.in('action_key', actionKeys);
    }
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return Boolean(data);
}

function requireRights(moduleName, actionKeys) {
    return async (req, res, next) => {
        const userId = getUserId(req);
        if (!req.session || !userId) {
            return res.status(401).json({ error: 'Unauthorized. Please log in again.' });
        }

        try {
            if (await hasRight(req, moduleName, actionKeys)) return next();
            return res.status(403).json({ error: 'You do not have permission to perform this action.' });
        } catch (err) {
            console.error('Authorization middleware error:', err);
            return res.status(500).json({ error: 'Unable to verify permission.' });
        }
    };
}

export function requireAnyRight(moduleName) {
    return requireRights(moduleName, []);
}

export function requireOneOfRights(moduleName, actionKeys) {
    return requireRights(moduleName, actionKeys);
}

export default function requireRight(moduleName, actionKey = 'view') {
    return requireRights(moduleName, [actionKey]);
}