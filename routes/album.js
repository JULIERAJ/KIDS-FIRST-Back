const express = require('express');
const { cloudinaryConfig } = require('../config/cloudinary-config');

const router = express.Router();
const {
  albumFileUpload,
  getAllPhotos,
} = require('../controllers/album-controller');
const { multerUploader } = require('../middleware/multer');

router.post('/:userId', multerUploader, cloudinaryConfig, albumFileUpload);
router.get('/:userId', cloudinaryConfig, getAllPhotos);

module.exports = router;
