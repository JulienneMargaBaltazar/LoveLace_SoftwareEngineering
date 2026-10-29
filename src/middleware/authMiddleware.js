const authMiddleware = (req, res, next) => {
  // Check if the user session exists
  if (req.session && req.session.userId) {
    return next(); // User is logged in, proceed to the route
  }

  // If not logged in, reject with 401 Unauthorized
  return res.status(401).json({ error: 'Unauthorized. Please log in.' });
};

// Role-based middleware for Task S1-DEV-05 (Admin & Superadmin access only)
export const requireAdmin = (req, res, next) => {
  // First, verify they are authenticated
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  // Next, verify their role (adjust property name if your session uses roleId/role)
  const userRole = req.session.role; // or req.session.roleId depending on how you store it
  if (userRole !== 2 && userRole !== 1) {
    return res.status(403).json({ error: 'Forbidden. Administrator privileges required.' });
  }

  next();
};

// Support BOTH default and named imports across your project
export const requireAuth = authMiddleware;
export default authMiddleware;