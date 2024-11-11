const express = require('express');
const { cloudinaryConfig } = require('../config/cloudinary-config');

const router = express.Router();
const {
  albumFileUpload,
  getAllFiles,
} = require('../controllers/album-controller');
const { multerUploader } = require('../middleware/multer');

router.post('/:userId', multerUploader, cloudinaryConfig, albumFileUpload);
router.get('/:userId', cloudinaryConfig, getAllFiles);

module.exports = router;
