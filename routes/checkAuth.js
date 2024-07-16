const express = require('express');

const userController = require('../controllers/user-controller');

const router = express.Router();

router.get('/checkAuth', userController.checkAuth);

module.exports = router;
