const asyncWrapper = require('../middleware/async-wrapper');

const getAllMessages = asyncWrapper(async (req, res) => {
    res.send('this is getAllMessages function');
});
const addMessage = asyncWrapper(async (req, res) => {
    res.send('this is addMessage function');
});
const getMessage = asyncWrapper(async (req, res) => {
    res.send('this is getMessage function');
});
const updateMessage = asyncWrapper(async (req, res) => {
    res.send('this is updateMessage function');
});
const deleteMessage = asyncWrapper(async (req, res) => {
    res.send('this is deleteMessage function');
});

module.exports = {
 getAllMessages,
 addMessage,
 getMessage,
 updateMessage,
 deleteMessage,
  };
  