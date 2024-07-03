const express = require('express');

const userController = require('../controllers/user-controller');

const router = express.Router();

router.get(
  '/reset-password/:email/:resetPasswordToken',
  userController.resetPasswordActivation,
);
router.post(
  '/reset-password/:email/:resetPasswordToken',
  userController.resetPasswordUpdates,
);

module.exports = router;
