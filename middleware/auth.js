function requireAdmin(req, res, next) {
  if (req.session && req.session.employeeId) return next();
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  return res.redirect('/admin/login');
}

module.exports = { requireAdmin };
