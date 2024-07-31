const express = require('express');

const router = express.Router();
const shareKidController = require('../controllers/share-kid-controller');
const authenticateUser = require('../middleware/authentication');

// Create a new share invitation
router.post('/', authenticateUser, shareKidController.createShareKid);

// Get all share invitations for the authenticated user
router.get('/', authenticateUser, shareKidController.getAllShareKids);

// Get a specific share invitation by ID
router.get('/:id', authenticateUser, shareKidController.getShareKidById);

// Update the status of a share invitation
router.put('/:id', authenticateUser, shareKidController.updateShareKid);

// Delete a share invitation
router.delete('/:id', authenticateUser, shareKidController.deleteShareKid);

module.exports = router;
