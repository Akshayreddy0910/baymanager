import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware function to protect routes from unauthorized access
export const protect = async (req, res, next) => {
  let token;

  // 1. Check if the Authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extract the token from the header (it's the second part after the space)
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token using the secret key from environment variables
      // This ensures the token was created by our server and hasn't expired
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find the user in the database by the id stored in the token
      // We use .select('-password') to make sure we don't carry the password hash in the request
      req.user = await User.findById(decoded.id).select('-password');

      // 5. Move to the next middleware or controller function
      next();
    } catch (error) {
      // 6. If anything fails during verification, return a 401 Unauthorized response
      console.log("JWT Verification Error:", error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // 7. If no token was found at all, return a 401 Unauthorized response
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
