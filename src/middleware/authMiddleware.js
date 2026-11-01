const authMiddleware = (req, res, next) => {
  // Check if the user session exists
  if (req.session && req.session.userId) {
    return next(); // User is logged in, proceed to the route
  }

  // If not logged in, reject with 401 Unauthorized
  return res.status(401).json({ error: 'Unauthorized. Please log in.' });
};

// Middleware for Superadmin access only (roleId === 1)
export const requireSuperadmin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  if (req.session.roleId !== 1) {
    return res.status(403).json({ error: 'Forbidden. Superadmin privileges required.' });
  }

  next();
};

// Role-based middleware for Admin & Superadmin access (roleId 1 or 2)
export const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  const userRole = req.session.roleId; 
  if (userRole !== 2 && userRole !== 1) {
    return res.status(403).json({ error: 'Forbidden. Administrator privileges required.' });
  }

  next();
};

// Middleware specifically for Regular User access (roleId === 3)
export const requireUser = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  if (req.session.roleId !== 3) {
    return res.status(403).json({ error: 'Forbidden. Regular user access required.' });
  }

  next();
};

// Support BOTH default and named imports across your project
export const requireAuth = authMiddleware;
export default authMiddleware;