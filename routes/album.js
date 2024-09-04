const express = require('express');

const router = express.Router();
const { fileUploader } = require('../controllers/album-controller');
const { multerUploader } = require('../middleware/multer');

router.post('/uploadFiles/:userId', multerUploader, fileUploader);

module.exports = router;
