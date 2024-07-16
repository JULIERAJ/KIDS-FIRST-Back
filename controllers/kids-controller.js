const asyncWrapper = require('../middleware/async-wrapper');

const getAllKids = asyncWrapper(async (req, res) => {
  res.send('this is getAllKids function');
});

const createKid = asyncWrapper(async (req, res) => {
  res.send('this is addKid function');
});

const getKidById = asyncWrapper(async (req, res) => {
  res.send('this is getKid function');
});

const updateKid = asyncWrapper(async (req, res) => {
  res.send('this is updateKid function');
});

const deleteKid = asyncWrapper(async (req, res) => {
  res.send('this is deleteKid function');
});

module.exports = {
  getAllKids,
  createKid,
  getKidById,
  updateKid,
  deleteKid,
};
