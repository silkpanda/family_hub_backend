import jwt from 'jsonwebtoken';
import User from '../../models/user.model.js';
import config from '../../config/index.js';

// This middleware function, 'protect', is designed to secure API endpoints.
// It verifies a user's JSON Web Token (JWT) before allowing them to access a route.
const protect = async (req, res, next) => {
  let token;

  // Check if the request headers contain an Authorization token, and if it's a Bearer token.
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the 'Authorization: Bearer <TOKEN>' header.
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using the secret key from our configuration.
      // This will throw an error if the token is invalid or expired.
      const decoded = jwt.verify(token, config.jwtSecret);

      // Use the ID from the decoded token payload to find the user in the database.
      // We exclude the user's Google access/refresh tokens for security.
      req.user = await User.findById(decoded.id).select('-accessToken -refreshToken');

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      // If the user is found, attach the user object to the request (req.user)
      // and call next() to pass control to the next middleware or the route controller.
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      next(new Error('Not authorized, token failed'));
    }
  }

  // If no token is found in the header, the user is not authorized.
  if (!token) {
    res.status(401);
    next(new Error('Not authorized, no token'));
  }
};

export { protect };
