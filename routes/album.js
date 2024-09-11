const express = require('express');
const { cloudinaryConfig } = require('../config/cloudinary-config');

const router = express.Router();
const {
  fileUploader,
  getAllPhotos,
} = require('../controllers/album-controller');
const { multerUploader } = require('../middleware/multer');

router.post('/:userId', multerUploader, fileUploader);
router.get('/:userId', getAllPhotos);

module.exports = router;
