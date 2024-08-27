const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messages-controller');

router.get('/', messagesController.getAllMessages);
router.post('/', messagesController.addMessage);
router.get('/:id', messagesController.getMessage);
router.put('/:id', messagesController.updateMessage);
router.delete('/:id', messagesController.deleteMessage);

module.exports = router;