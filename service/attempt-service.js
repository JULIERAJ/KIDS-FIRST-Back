const LoginAttempt = require('../models/LoginAttempt');

const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5;

const getAttempts = async (userId) => {
  let loginAttempt = await LoginAttempt.findOne({ userId });

  if (!loginAttempt) {
    loginAttempt = new LoginAttempt({ userId });
    await loginAttempt.save();
  }
  return loginAttempt;
};

const incrementAttempts = async (userId) => {
  const loginAttempt = await getAttempts(userId);
  loginAttempt.attempts = Math.min(
    loginAttempt.attempts + 1,
    MAX_LOGIN_ATTEMPTS,
  );
  await loginAttempt.save();

  if (loginAttempt.attempts >= MAX_LOGIN_ATTEMPTS) {
    return {
      requiresPasswordReset: true,
      lastAttemptWarning: false,
      attempts: loginAttempt.attempts,
    };
  }
  if (loginAttempt.attempts === MAX_LOGIN_ATTEMPTS - 1) {
    return {
      requiresPasswordReset: false,
      lastAttemptWarning: true,
      attempts: loginAttempt.attempts,
    };
  }
  return {
    requiresPasswordReset: false,
    lastAttemptWarning: false,
    attempts: loginAttempt.attempts,
  };
};

const resetAttempts = async (userId) => {
  const loginAttempt = await getAttempts(userId);
  loginAttempt.attempts = 0;
  await loginAttempt.save();
};

module.exports = {
  getAttempts,
  incrementAttempts,
  resetAttempts,
};
