const jwt = require('jsonwebtoken');
const { errorHandler } = require('./error.js');

const verifyToken = (req, res, next) => {
  try {
    // Ensure cookie-parser middleware is active before this middleware
    const token = req.cookies['access_token'];
    console.log('verifyToken → cookie:', token);

    if (!token) {
      return next(errorHandler(401, 'Unauthorized: No token provided'));
    }

    // Verify token validity
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
      if (err) {
        console.error('verifyToken → invalid token:', err.message);
        return next(errorHandler(403, 'Forbidden: Invalid or expired token'));
      }

      // Attach the decoded payload (user info) to request object
      req.user = decodedUser;
      console.log('verifyToken → verified user:', decodedUser);
      next();
    });
  } catch (err) {
    console.error('verifyToken → unexpected error:', err);
    next(errorHandler(500, 'Internal server error during token verification'));
  }
};

module.exports={
  verifyToken
};