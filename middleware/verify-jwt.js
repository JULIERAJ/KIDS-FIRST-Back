const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
  // eslint-disable-next-line prefer-destructuring
  const token = req.signedCookies.token;

  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded token payload to request object

    if (!req.user) {
      // eslint-disable-next-line no-console
      console.log('No user found in request');
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Unauthorized: No user authenticated' });
    }
    next();
  } catch (err) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid token' });
  }
};

module.exports = verifyJWT;
