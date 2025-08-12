// This middleware protects routes by verifying a user's JWT token.

import jwt from 'jsonwebtoken';
import User from '../../models/user.model.js';

export const protect = async (req, res, next) => {
  let token;
  // Check for the token in the 'Authorization' header.
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the header string.
      token = req.headers.authorization.split(' ')[1];
      // Verify the token using the secret key.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Find the user by the ID from the token and attach it to the request object.
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      next(); // Proceed to the next middleware or route handler.
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
    return;
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};