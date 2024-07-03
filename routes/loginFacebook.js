const express = require('express');

const userController = require('../controllers/user-controller');

const router = express.Router();

router.post('/loginFacebook', userController.loginFacebook);

module.exports = router;
