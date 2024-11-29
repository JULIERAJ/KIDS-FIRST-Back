const { StatusCodes } = require('http-status-codes');
const asyncWrapper = require('../middleware/async-wrapper');
const {
  getAllKids,
  createKid,
  getKidById,
  updateKid,
  deleteKid,
} = require('../service/kid-service');
const { uploadFilesCloudinary } = require('../middleware/cloudinary');
const { dataUri } = require('../middleware/multer');

const getAllKidsCtrl = asyncWrapper(async (req, res) => {
  const { id: userId } = req.user;
  const kids = await getAllKids(userId);
  res.status(StatusCodes.OK).json({ kids });
});

const createKidCtrl = asyncWrapper(async (req, res) => {
  try {
    const { id: userId } = req.user;
    let imageProfileURL;
    if (req.file) {
      const fileUri = dataUri(req.file).content;
      const cloudinaryUploadResult = await uploadFilesCloudinary(
        fileUri,
        userId,
      );
      imageProfileURL = cloudinaryUploadResult.url;
    }

    const newKid = await createKid(req.body, userId, imageProfileURL);

    res.status(StatusCodes.CREATED).json({ newKid });
  } catch (err) {
    res.status(StatusCodes.BAD_GATEWAY).json({
      err,
    });
  }
});

const getKidByIdCtrl = asyncWrapper(async (req, res) => {
  const { id: userId } = req.user;
  const { id: kidId } = req.params;
  const kid = await getKidById(kidId, userId);
  res.status(StatusCodes.OK).json({ kid });
});

const updateKidCtrl = asyncWrapper(async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { id: kidId } = req.params; 

    let imageProfileURL;

    if (req.file) {
      const fileUri = dataUri(req.file).content; 
      const cloudinaryUploadResult = await uploadFilesCloudinary(
        fileUri,
        userId,
      );
      imageProfileURL = cloudinaryUploadResult.url; 
    }

    const updatedKid = await updateKid(kidId, userId, req.body, imageProfileURL);

    res.status(StatusCodes.OK).json({ updatedKid });
  } catch (err) {
    console.error('Update Error:', err);
    res.status(StatusCodes.BAD_GATEWAY).json({
      error: err.message || 'Failed to update kid information',
    });
  }
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
