export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user data missing' });
    }

    let isAuthorized = false;

    for (let i = 0; i < allowedRoles.length; i++) {
        const currentRole = allowedRoles[i];
        if (req.user.role === currentRole) {
            isAuthorized = true;
            break;
        }
    }

    if (isAuthorized === false) {
      return res.status(403).json({ message: 'Access denied: You do not have the required permissions' });
    }

    next();
  };
};
