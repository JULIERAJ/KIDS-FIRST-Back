/* eslint-disable no-dupe-keys */
const bcrypt = require('bcryptjs');
const cron = require('node-cron');

const User = require('../models/User');
const verificationTokenService = require('./token-verification-service');

require('dotenv').config({ path: './.env.local' });

const registration = async (
  firstName,
  lastName,
  email,
  password,
  googleUserId,
) => {
  const user = new User({ firstName, lastName, email, password, googleUserId });
  await user.save();

  //   return {
  //     id: user._id,
  //     email: user.email,
  //     firstName: user.firstName,
  //     lastName: user.lastName,
  //   };
  return user;
};

const findUser = async (email) => {
  const user = await User.findOne({ email }).exec();
  return user || null;
};

// need to add logic when compare stored password with the password provided.
// Depends on what crypting module is used. For ex bcrypt
const isPasswordCorrect = async (email, password) => {
  const user = await User.findOne({ email });
  const isMatch = await bcrypt.compare(password, user.password);

  return isMatch;
};

const activateAccount = async (email) => {
  const user = await User.findOneAndUpdate(
    { email: email },
    { emailIsActivated: true },
    { new: true },
  );
  await verificationTokenService.invalidateTokens(user._id);
  return user;
};

const validateUserAndToken = async (email, token) => {
  const user = await findUser(email);
  const resetPasswordTokenVerified = await verificationTokenService.verifyToken(
    user._id,
    token,
  );
  return user && resetPasswordTokenVerified;
};

const updateUserPassword = async (email, password) => {
  const user = await findUser(email);
  if (!user) {
    throw new Error('User not found');
  }
  const hashedPassword = await bcrypt.hash(password, 8);
  const updatedUser = await User.findOneAndUpdate(
    { email: email },
    { $set: { password: hashedPassword } },
    { new: true },
  );
  return updatedUser;
};

// Define the function to delete inactive users
const deleteInactiveUsers = async () => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago in milliseconds
  try {
    // Find users who haven't activated their account and were created more than 1 hour ago
    const inactiveUsers = await User.find({
      emailIsActivated: false, // Filter: email is not activated
      createdAt: { $lt: oneHourAgo }, // Filter: created more than 1 hour ago
    });

    // Delete inactive users
    await Promise.all(
      // Map over the array of inactive users and delete each user
      inactiveUsers.map(async (user) => {
        await User.findByIdAndDelete(user._id); // Delete user by ID
      }),
    );

    // Log the number of inactive users deleted
    // eslint-disable-next-line no-console
    console.log('Inactive users deleted:', inactiveUsers.length);
  } catch (error) {
    // Log any errors that occur
    // eslint-disable-next-line no-console
    console.error('Error deleting inactive users:', error);
  }
};

// Schedule the task to run every hour to bulk delete. --- to change it to 2min for testing: */2 * * * *
cron.schedule('0 * * * *', () => {
  deleteInactiveUsers();
});

module.exports = {
  registration,
  findUser,
  isPasswordCorrect,
  activateAccount,
  validateUserAndToken,
  updateUserPassword,
  deleteInactiveUsers,
  deleteInactiveUsers,
};
