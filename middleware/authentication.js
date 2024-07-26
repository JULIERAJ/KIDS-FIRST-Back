const { StatusCodes } = require('http-status-codes');
const { UnauthenticatedError } = require('../errors/customErrors');
const User = require('../models/User');
const { verifyAccessToken } = require('../utils/tokenUtils');

const authenticateUser = async (req, res, next) => {
  const { token } = req.signedCookies;

  if (!token) {
    return new UnauthenticatedError('Authentication invalid');
  }
  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'User not found' });
    }
    req.user = user; // Attach user obj to request

    next();
  } catch (err) {
    next(new UnauthenticatedError('Authentication invalid'));
  }
};

module.exports = authenticateUser;
