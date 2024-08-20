const express = require('express');
const userController = require('../controllers/user-controller');
// const invitationController = require('../controllers/invitation-controller');
const authenticateUser = require('../middleware/authentication');

const router = express.Router();

// Authentication Routes
router.post('/login', userController.login);
router.post('/loginFacebook', userController.loginFacebook);
router.post('/loginSocial', userController.loginSocial);

// Registration and Activation Routes
router.post('/register', userController.registration);
router.get(
  '/activate/:email/:emailVerificationToken',
  userController.accountActivation,
);
router.post('/resend-email', userController.resendActivationEmail);
// This invitation section needs to be updated after adding shareKid route

// router.get(
//   '/register/:email/:family/:emailVerificationToken',
//   invitationController.invitationAccepted,
// );

// Password Reset Routes
router.post('/forgot-password', userController.requestResetPassword);
router.get(
  '/reset-password/:email/:resetPasswordToken',
  userController.resetPasswordActivation,
);
router.post(
  '/reset-password/:email/:resetPasswordToken',
  userController.resetPasswordUpdates,
);

// Protected Routes
router.post('/logout', authenticateUser, userController.logout);

module.exports = router;
