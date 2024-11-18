const express = require('express');
const { cloudinaryConfig } = require('../config/cloudinary-config');

const router = express.Router();
const {
  albumFileUpload,
  getAllFiles,
  deleteFiles,
} = require('../controllers/album-controller');
const { multerUploader } = require('../middleware/multer');

router.post('/:userId', multerUploader, cloudinaryConfig, albumFileUpload);
router.get('/:userId', cloudinaryConfig, getAllFiles);
router.patch('/:userId', cloudinaryConfig, deleteFiles);

module.exports = router;
