const express = require('express');

const invitationController = require('../controllers/invitation-controller');
const userController = require('../controllers/user-controller');

const router = express.Router();

router.post('/register', userController.registration);
router.get(
  '/activate/:email/:emailVerificationToken',
  userController.accountActivation,
);
router.get(
  '/register/:email/:family/:emailVerificationToken',
  invitationController.invitationAccepted,
);
router.post('/resend-email', userController.resendActivationEmail);

module.exports = router;
