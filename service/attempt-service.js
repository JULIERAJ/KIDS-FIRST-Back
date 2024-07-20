const LoginAttempt = require('../models/LoginAttempt');

const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5;
const LOCK_TIME = parseInt(process.env.LOCK_TIME, 10) || 60 * 60 * 100;

const isLocked = (lockUntil) => lockUntil && lockUntil > Date.now();

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

  if (isLocked(loginAttempt.lockUntil)) {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    return { isLocked: true, ...loginAttempt.toObject() };
  }
  loginAttempt.attempts = Math.min(
    loginAttempt.attempts + 1,
    MAX_LOGIN_ATTEMPTS,
  );

  if (loginAttempt.attempts >= MAX_LOGIN_ATTEMPTS) {
    loginAttempt.lockUntil = Date.now() + LOCK_TIME;
    await loginAttempt.save();
    return {
      isLocked: true,
      attempts: loginAttempt.attempts,
    };
  }
  await loginAttempt.save();

  if (loginAttempt.attempts === MAX_LOGIN_ATTEMPTS - 1) {
    return {
      lastAttemptWarning: true,
      isLocked: false,
      attempts: loginAttempt.attempts,
    };
  }
  return {
    lastAttemptWarning: false,
    isLocked: false,
    attempts: loginAttempt.attempts,
  };
};

const resetAttempts = async (userId) => {
  const loginAttempt = await getAttempts(userId);
  if (loginAttempt) {
    loginAttempt.attempts = 0;
    loginAttempt.lockUntil = undefined;
    await loginAttempt.save();
  }
};

module.exports = {
  getAttempts,
  incrementAttempts,
  resetAttempts,
};
