const express = require('express');

const router = express.Router();
const shareKidController = require('../controllers/share-kid-controller');
const authenticateUser = require('../middleware/authentication');

// Create a new share request for a specific kid
router.post(
  '/:kidId/share-request',
  authenticateUser,
  shareKidController.createShareRequest,
);

// Get all pending requests for the authenticated user
router.get(
  '/requests',
  authenticateUser,
  shareKidController.getAllPendingRequests,
);
// Create a new delete request for a specific kid
router.post(
  '/:kidId/delete-request',
  authenticateUser,
  shareKidController.createDeleteRequest,
);

// Update the status of a share request for a specific kid
router.put(
  '/share-request/:requestId',
  authenticateUser,
  shareKidController.handleShareResponse,
);

// Update the status of a delete request for a specific kid
router.put(
  '/delete-request/:requestId',
  authenticateUser,
  shareKidController.handleDeleteResponse,
);

module.exports = router;
