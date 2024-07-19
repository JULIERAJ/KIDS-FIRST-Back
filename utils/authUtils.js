const { createJWT } = require('./tokenUtils');

const attachCookies = ({ res, user }) => {
  const tokenPayload = { userId: user._id };
  const token = createJWT(tokenPayload);

  // Set the cookie expiration to 1 week
  const maxAgeMilliseconds = 1000 * 60 * 60 * 24 * 7;

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
