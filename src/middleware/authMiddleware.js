import { supabase } from '../config/supabaseClient.js';

const authMiddleware = async (req, res, next) => {
  // 1. Force headers to prevent the browser from caching secure layouts (Fixes TC-05: Back-button routing)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // 2. Base Validation: Check local tracking state (Fixes TC-04)
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized: Secure server-side session token is missing or not mapped.' });
  }

  try {
    // 3. Server-side token guardrail validation (Fixes TC-05 & TC-07)
    // Extract access token if passed via custom header, query, or check active session data
    const accessToken = req.headers.authorization?.split(' ')[1] || req.session.accessToken;
    
    if (accessToken) {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      
      // If the token has been globally signed out or invalidated on the server backend
      if (error || !user) {
        req.session.destroy(); // Wipe local session trace
        return res.status(401).json({ error: 'Session invalid or server-side token invalidated.' });
      }
    }
  } catch (err) {
    return res.status(401).json({ error: 'Session verification failed.' });
  }

  return next(); // User is verified on server-side, proceed safely
};

// Middleware for Superadmin access only (roleId === 1)
export const requireSuperadmin = async (req, res, next) => {
  // Chain the server token & cache guard check
  authMiddleware(req, res, () => {
    if (req.session.roleId !== 1) {
      return res.status(403).json({ error: 'Forbidden. Superadmin privileges required.' });
    }
    next();
  });
};

// Role-based middleware for Admin & Superadmin access (roleId 1 or 2)
export const requireAdmin = async (req, res, next) => {
  // Chain the server token & cache guard check
  authMiddleware(req, res, () => {
    const userRole = req.session.roleId; 
    if (userRole !== 2 && userRole !== 1) {
      return res.status(403).json({ error: 'Forbidden. Administrator privileges required.' });
    }
    next();
  });
};

// Middleware specifically for Regular User access (roleId === 3)
export const requireUser = async (req, res, next) => {
  // Chain the server token & cache guard check
  authMiddleware(req, res, () => {
    if (req.session.roleId !== 3) {
      return res.status(403).json({ error: 'Forbidden. Regular user access required.' });
    }
    next();
  });
};

// Support BOTH default and named imports across your project

export const requireVerifiedEmail = async (req, res, next) => {
  authMiddleware(req, res, async () => {
    try {
      const { data: user, error } = await supabase
        .from("app_user")
        .select("is_verified, email_verified_at")
        .eq("user_id", req.session.userId)
        .maybeSingle();

      if (error) {
        console.error("Email verification check error:", error);
        return res.status(500).json({ error: "Failed to verify account status." });
      }

      if (!Boolean(user?.is_verified || user?.email_verified_at)) {
        return res.status(403).json({
          error: "Please verify your email address to access this resource.",
          code: "EMAIL_NOT_VERIFIED"
        });
      }

      return next();
    } catch (err) {
      console.error("Email verification middleware error:", err);
      return res.status(500).json({ error: "Failed to verify account status." });
    }
  });
};

export const requireAuth = authMiddleware;
export default authMiddleware;
