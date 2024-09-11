const express = require('express');
const { cloudinaryConfig } = require('../config/cloudinary-config');

const router = express.Router();
const { fileUploader } = require('../controllers/album-controller');
const { multerUploader } = require('../middleware/multer');

router.post(
  '/uploadFiles/:userId',
  multerUploader,
  cloudinaryConfig,
  fileUploader,
);

module.exports = router;
