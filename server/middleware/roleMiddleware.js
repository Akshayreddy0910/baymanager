// Middleware factory function to restrict access based on user roles
export const authorizeRoles = (...allowedRoles) => {
  // Return a standard middleware function
  return (req, res, next) => {
    // Check if the user exists (set by the protect middleware)
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user data missing' });
    }

    let isAuthorized = false;

    // Use a for loop to check if the user's role matches any of the allowed roles
    for (let i = 0; i < allowedRoles.length; i++) {
        const currentRole = allowedRoles[i];
        if (req.user.role === currentRole) {
            // Found a match, user is allowed to proceed
            isAuthorized = true;
            break; // Stop the loop since we found a match
        }
    }

    // If the loop finished and no match was found, deny access
    if (isAuthorized === false) {
      return res.status(403).json({ message: 'Access denied: You do not have the required permissions' });
    }

    // Call next to move to the next function if authorized
    next();
  };
};
