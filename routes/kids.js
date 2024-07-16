const express = require('express');
const router = express.Router();
const {
    createKid,
    updateKid,
    getAllKids,
    getKidById,
    deleteKid,
} = require('../controllers/kid-controller');  


router.post('/kid', kidController.createKid);
router.put('/kid/:id', kidController.updateKid);
router.delete('/kid/:id', kidController.deleteKid);            
router.get('/kids', kidController.getAllKids);
router.get('/kid/:id', kidController.getKidById);

module.exports = router;