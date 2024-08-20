const VerificationToken = require('../models/VerificationToken');
const {
  createJWTEmail,
  verifyEmailToken,
  verifyResetToken,
  createJWTPasswordReset,
} = require('../utils/tokenUtils');

const createToken = async (userId, email) => {
  const token = createJWTEmail({ email });
  await VerificationToken.create({ userId, token });
  return token;
};

const verifyToken = async (userId, token, tokenType) => {
  const storedToken = await VerificationToken.findOne({ userId, token });
  if (!storedToken) {
    return { valid: false, reason: 'expired' };
  }

  if (tokenType === 'email') {
    try {
      verifyEmailToken(token);
      return { valid: true };
    } catch (err) {
      await VerificationToken.deleteOne({ userId, token });
      return { valid: false, reason: 'invalid' };
    }
  } else if (tokenType === 'password') {
    try {
      const tokenStatus = verifyResetToken(token);
      if (tokenStatus.exp < Math.round(Date.now() / 1000)) {
        await VerificationToken.deleteOne({ userId, token });
        return { valid: false, reason: 'expired' };
      }
      return { valid: true };
    } catch (err) {
      await VerificationToken.deleteOne({ userId, token });
      return { valid: false, reason: 'invalid' };
    }
  }
};

const createPasswordToken = async (userId, email) => {
  const token = createJWTPasswordReset({ email });
  await VerificationToken.create({ userId, token });
  return token;
};

const invalidateTokens = async (userId) => {
  await VerificationToken.deleteMany({ userId });
};

module.exports = {
  createToken,
  verifyToken,
  invalidateTokens,
  createPasswordToken,
};
