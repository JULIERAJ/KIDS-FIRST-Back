const express = require('express');

const userController = require('../controllers/user-controller');

const router = express.Router();

router.post('/loginSocial', userController.loginSocial);

module.exports = router;
