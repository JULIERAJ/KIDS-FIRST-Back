const express = require('express');

const router = express.Router();
const kidsController = require('../controllers/kids-controller');
const authenticateUser = require('../middleware/authentication');
const { multerKidsPhotoUploader } = require('../middleware/multer');
const { cloudinaryConfig } = require('../config/cloudinary-config');

router.get('/', authenticateUser, kidsController.getAllKids);
router.post(
  '/',
  authenticateUser,
  multerKidsPhotoUploader,
  cloudinaryConfig,
  kidsController.createKid,
);
router.get('/:id', authenticateUser, kidsController.getKidById);
router.put('/:id', authenticateUser, kidsController.updateKid);
router.delete('/:id', authenticateUser, kidsController.deleteKid);

module.exports = router;
