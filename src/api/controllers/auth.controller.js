import jwt from 'jsonwebtoken';

// This controller generates a JWT after successful Google auth
export const googleCallback = (req, res) => {
  // Successful authentication, Passport attaches user to req.user
  // We generate our own JWT to send to the client
  const payload = {
    id: req.user.id,
    displayName: req.user.displayName,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d', // Token valid for 7 days
  });

  // Redirect to frontend with the token
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
};