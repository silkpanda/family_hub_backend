import jwt from 'jsonwebtoken';
import User from '../../models/user.model.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (excluding password) and attach to request
      // NOTE: You might need to expand this to fetch family info as well
      req.user = await User.findById(decoded.id).select('-password'); 

      // For this CRUD, we assume familyId is on the user object.
      // In a real app, you might fetch the Family document here.
      // For now, let's assume a simple structure:
      if (!req.user.familyId) {
         // In a real app, every user should belong to a family.
         // This is a placeholder for demonstration.
         req.user.familyId = 'some_default_family_id_from_user_model';
      }


      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
