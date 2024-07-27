
const VerificationToken = require('../models/VerificationToken');
const { createJWTEmail, verifyEmailToken } = require('../utils/tokenUtils');

const createToken = async (userId, email) => {
  const token = createJWTEmail({ email });
  await VerificationToken.create({ userId, token });
  return token;
};

const verifyToken = async (userId, token) => {
  const storedToken = await VerificationToken.findOne({ userId, token });
  if (!storedToken) {
    return { valid: false, reason: 'expired' };
  }

  try {
    verifyEmailToken(token);
    return { valid: true };
  } catch (err) {
    await VerificationToken.deleteOne({ userId, token });
    return { valid: false, reason: 'invalid' };
  }
};

const invalidateTokens = async (userId) => {
  await VerificationToken.deleteMany({ userId });
};

module.exports = {
  createToken,
  verifyToken,
  invalidateTokens,
};
