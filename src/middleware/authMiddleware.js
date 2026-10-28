const authMiddleware = (req, res, next) => {
  // Check if the user session exists
  if (req.session && req.session.userId) {
    return next(); // User is logged in, proceed to the route
  }

  // If not logged in, reject with 401 Unauthorized
  return res.status(401).json({ error: 'Unauthorized. Please log in.' });
};

// Support BOTH default and named imports ({ requireAuth }) across your project
export const requireAuth = authMiddleware;
export default authMiddleware;