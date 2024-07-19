const { UnauthenticatedError } = require('../errors/customErrors');
const { verifyAccessToken } = require('../utils/tokenUtils');

const authenticateUser = (req, res, next) => {
  // eslint-disable-next-line prefer-destructuring
  const { token } = req.signedCookies;

  if (!token) {
    return new UnauthenticatedError('Authentication invalid');
  }
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // Attach decoded token payload to request object

    next();
  } catch (err) {
    next(new UnauthenticatedError('Authentication invalid'));
  }
};

module.exports = authenticateUser;
