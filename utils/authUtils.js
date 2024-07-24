const { createJWT } = require('./tokenUtils');

const attachCookies = ({ res, user, rememberMe = false }) => {
  const tokenPayload = { userId: user._id };
  const token = createJWT(tokenPayload);

  const rememberMeExpirationDays = parseInt(
    process.env.REMEMBER_ME_EXPIRATION_DAYS,
    10,
  ) || 30;
  const defaultExpirationDays = parseInt(
    process.env.DEFAULT_EXPIRATION_DAYS,
    10,
  ) || 1;

  const maxAgeMilliseconds = rememberMe
    ? 1000 * 60 * 60 * 24 * rememberMeExpirationDays
    : 1000 * 60 * 60 * 24 * defaultExpirationDays;

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: maxAgeMilliseconds,
    signed: true,
    sameSite: 'Lax', // Use 'Lax' instead of 'Strict' to support social logins
  });

  return token;
};

module.exports = attachCookies;
