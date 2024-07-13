const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
  // eslint-disable-next-line prefer-destructuring
  const token = req.signedCookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded token payload to request object
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = verifyJWT;
