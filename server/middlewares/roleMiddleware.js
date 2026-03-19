

module.exports = function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié." });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Accès interdit. Rôle insuffisant." });
    }

    next(); 
  };
};
