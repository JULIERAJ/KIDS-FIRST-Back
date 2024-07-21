const express = require('express');

const router = express.Router();
const kidsController = require('../controllers/kids-controller');

router.get('/', kidsController.getAllKids);
router.post('/', kidsController.createKid);
router.get('/:id', kidsController.getKidById);
router.put('/:id', kidsController.updateKid);
router.delete('/:id', kidsController.deleteKid);

module.exports = router;
