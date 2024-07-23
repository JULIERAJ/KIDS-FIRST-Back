const express = require('express');
const userController = require('../controllers/user-controller');
// const invitationController = require('../controllers/invitation-controller');
const authenticateUser = require('../middleware/authentication');

const router = express.Router();

// Authentication Routes
router.post('/v1/login', userController.login);
router.post('/v1/loginFacebook', userController.loginFacebook);
router.post('/v1/loginSocial', userController.loginSocial);

// Registration and Activation Routes
router.post('/v1/register', userController.registration);
router.get(
  '/v1/activate/:email/:emailVerificationToken',
  userController.accountActivation,
);
router.post('/v1/resend-email', userController.resendActivationEmail);
// This invitation section needs to be updated after adding shareKid route

// router.get(
//   '/v1/register/:email/:family/:emailVerificationToken',
//   invitationController.invitationAccepted,
// );

// Password Reset Routes
router.post('/v1/forgot-password', userController.requestResetPassword);
router.get(
  '/v1/reset-password/:email/:resetPasswordToken',
  userController.resetPasswordActivation,
);
router.post(
  '/v1/reset-password/:email/:resetPasswordToken',
  userController.resetPasswordUpdates,
);

// Protected Routes
router.post('/v1/logout', authenticateUser, userController.logout);

module.exports = router;
