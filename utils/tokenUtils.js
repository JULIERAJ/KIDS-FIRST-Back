const jwt = require('jsonwebtoken');

const {
  JWT_SECRET,
  JWT_LIFETIME,
  JWT_EMAIL_VERIFICATION_SECRET,
  JWT_EMAIL_LIFETIME,
  JWT_RESET_PASSWORD_SECRET,
} = process.env;

// JWT Creation
const createJWT = (payload, secret = JWT_SECRET, expiresIn = JWT_LIFETIME) => {
  const token = jwt.sign(payload, secret, {
    expiresIn,
  });
  return token;
};

const createJWTEmail = (payload) => {
  const token = jwt.sign(payload, JWT_EMAIL_VERIFICATION_SECRET, {
    expiresIn: JWT_EMAIL_LIFETIME,
  });
  return token;
};

const createJWTPasswordReset = (payload) => {
  const token = jwt.sign(payload, JWT_EMAIL_VERIFICATION_SECRET, {
    expiresIn: JWT_LIFETIME,
  });
  return token;
};

// JWT Verification
const verifyJWT = (token, secret) => jwt.verify(token, secret);

const verifyAccessToken = (token) => verifyJWT(token, JWT_SECRET);

const verifyEmailToken = (token) =>
  verifyJWT(token, JWT_EMAIL_VERIFICATION_SECRET);

const verifyResetToken = (token) => verifyJWT(token, JWT_RESET_PASSWORD_SECRET);

module.exports = {
  createJWT,
  createJWTEmail,
  createJWTPasswordReset,
  verifyJWT,
  verifyAccessToken,
  verifyEmailToken,
  verifyResetToken,
};
