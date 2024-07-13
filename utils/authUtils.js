const jwt = require('jsonwebtoken');

const attachCookies = (payload, secret, options, res) => {
  const token = jwt.sign(payload, secret, options);
  const maxAgeSeconds = parseInt(options.expiresIn, 10);
  const maxAgeMilliseconds = maxAgeSeconds * 1000;

  // Set token in httpOnly cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: maxAgeMilliseconds,
    signed: true,
    sameSite: 'Lax', // use 'Lax' instead of 'strict' to support social logins
  });

  return token;
};

module.exports = attachCookies;
