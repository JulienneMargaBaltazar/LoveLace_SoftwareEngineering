export const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next(); // User is authenticated, proceed to the endpoint
  }
  return res.status(401).json({ error: 'Unauthorized access. Please log in.' });
};