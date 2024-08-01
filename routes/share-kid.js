const express = require('express');
const router = express.Router();
const shareKidController = require('../controllers/share-kid-controller');
const authenticateUser = require('../middleware/authentication');

// Create a new share invitation for a specific kid
router.post(
  '/:kidId/share-kid',
  authenticateUser,
  shareKidController.createShareKid,
);

// Get all share invitations for the authenticated user related to a specific kid
router.get('/:kidId/share-kid',
  authenticateUser,
  shareKidController.getAllShareKids
);

// Get a specific share invitation by ID for a specific kid
router.get(
  '/:kidId/share-kid/:shareKidId',
  authenticateUser,
  shareKidController.getShareKidById,
);

// Update the status of a share invitation for a specific kid
router.put(
  '/:kidId/share-kid/:shareKidId',
  authenticateUser,
  shareKidController.updateShareKid,
);

// Delete a share invitation for a specific kid
router.delete(
  '/:kidId/share-kid/:shareKidId',
  authenticateUser,
  shareKidController.deleteShareKid,
);

module.exports = router;
