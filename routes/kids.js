const express = require('express');

const router = express.Router();
const kidsController = require('../controllers/kids-controller');
const authenticateUser = require('../middleware/authentication');

router.get('/v1/kids', authenticateUser, kidsController.getAllKids);
router.post('/v1/kids', authenticateUser, kidsController.createKid);
router.get('/v1/kids/:id', authenticateUser, kidsController.getKidById);
router.put('/v1/kids/:id', authenticateUser, kidsController.updateKid);
router.delete('/v1/kids/:id', authenticateUser, kidsController.deleteKid);

module.exports = router;
