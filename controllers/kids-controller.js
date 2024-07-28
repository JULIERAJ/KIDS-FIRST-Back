const { StatusCodes } = require('http-status-codes');
const asyncWrapper = require('../middleware/async-wrapper');
const {
  getAllKids,
  createKid,
  getKidById,
  updateKid,
  deleteKid,
} = require('../service/kid-service');

const getAllKidsCtrl = asyncWrapper(async (req, res) => {
  const { id: userId } = req.user;
  const kids = await getAllKids(userId);
  res.status(StatusCodes.OK).json({ kids });
});

const createKidCtrl = asyncWrapper(async (req, res) => {
  const { id: userId } = req.user;
  const newKid = await createKid(req.body, userId);
  res
    .status(StatusCodes.CREATED)
    .json({ message: `Kid with name ${newKid.name} has been created.` });
});

const getKidByIdCtrl = asyncWrapper(async (req, res) => {
  const { id: userId } = req.user;
  const { id: kidId } = req.params;
  const kid = await getKidById(kidId, userId);
  res.status(StatusCodes.OK).json({ kid });
});

const updateKidCtrl = asyncWrapper(async (req, res) => {
  const { id: userId } = req.user;
  const { id: kidId } = req.params;
  const updatedKid = await updateKid(kidId, userId, req.body);
  res.status(StatusCodes.OK).json({ updatedKid });
});

const deleteKidCtrl = asyncWrapper(async (req, res) => {
  const { id: userId } = req.user;
  const { id: kidId } = req.params;
  await deleteKid(kidId, userId);
  res
    .status(StatusCodes.OK)
    .json({ message: `Kid with id: ${kidId} was deleted` });
});

module.exports = {
  getAllKids: getAllKidsCtrl,
  createKid: createKidCtrl,
  getKidById: getKidByIdCtrl,
  updateKid: updateKidCtrl,
  deleteKid: deleteKidCtrl,
};
