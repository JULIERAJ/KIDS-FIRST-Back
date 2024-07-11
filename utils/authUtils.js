// utils/authUtils.js
const jwt = require('jsonwebtoken');

const jwtSignAndSetCookie = (payload, secret, options, res) => {
  const token = jwt.sign(payload, secret, options);
  const maxAgeSeconds = parseInt(options.expiresIn, 10);
  const maxAgeMilliseconds = maxAgeSeconds * 1000;

  // Set token in httpOnly cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: maxAgeMilliseconds,
    sameSite: 'strict',
    domain: 'localhost', // Adjust domain as needed
  });

  return token;
};

module.exports = {
  jwtSignAndSetCookie,
};
