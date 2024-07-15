const express = require('express');
const router = express.Router();
const {
    createKid,
    updateKid,
    getAllKids,
    deleteKid,
} = require('../controllers/kid-controller');  


router.post('/kid', kidController.kid);
router.put('/kid/:id', kidController.updateKid);
router.delete('/kid/:id', kidController.deleteKid);            
router.get('/kid', kidController.getAllKids);
router.get('/kid/:id', kidController.getKid);

module.exports = router;