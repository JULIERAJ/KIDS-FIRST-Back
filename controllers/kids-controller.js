const { StatusCodes } = require('http-status-codes');
const asyncWrapper = require('../middleware/async-wrapper');
const { getAllKids, createKid } = require('../service/kid-service');

const getAllKidsCtrl = asyncWrapper(async (req, res) => {
  const { id: userId } = req.user;
  const kids = await getAllKids(userId);
  res.status(StatusCodes.OK).json({ kids });
});

const createKidCtrl = asyncWrapper(async (req, res) => {
  const { id: userId } = req.user;
  const newKid = await createKid(req.body, userId);
  res.status(StatusCodes.CREATED).json({ newKid });
});

const getKidByIdCtrl = asyncWrapper(async (req, res) => {
  res.send('this is getKid function');
});

const updateKidCtrl = asyncWrapper(async (req, res) => {
  res.send('this is updateKid function');
});

const deleteKidCtrl = asyncWrapper(async (req, res) => {
  res.send('this is deleteKid function');
});

const shareKidCtrl = asyncWrapper(async (req, res) => {
  res.send('this is shareKid function');
});

module.exports = {
  getAllKids: getAllKidsCtrl,
  createKid: createKidCtrl,
  getKidById: getKidByIdCtrl,
  updateKid: updateKidCtrl,
  deleteKid: deleteKidCtrl,
  shareKid: shareKidCtrl,
};
