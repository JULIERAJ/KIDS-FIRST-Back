const express = require('express');

const userController = require('../controllers/user-controller');

const router = express.Router();

router.post('/register', userController.registration);
router.get(
  '/activate/:email/:emailVerificationToken',
  userController.accountActivation,
);
router.get(
  '/register/:email/:family/:emailVerificationToken');
router.post('/resend-email', userController.resendActivationEmail);

module.exports = router;
