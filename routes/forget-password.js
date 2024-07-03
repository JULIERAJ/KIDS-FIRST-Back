const express = require('express');

const userController = require('../controllers/user-controller');

const router = express.Router();

router.post('/forgot-password', userController.requestResetPassword);

module.exports = router;
