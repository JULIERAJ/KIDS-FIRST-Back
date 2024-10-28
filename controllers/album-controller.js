const { StatusCodes } = require('http-status-codes');
const asyncWrapper = require('../middleware/async-wrapper');
const { uploadFilesCloudinary } = require('../middleware/cloudinary');
const {
  createNewAlbum,
  getAlbum,
  updateAlbum,
  getAllPhotoCloudinary,
} = require('../service/album-service');

const { dataUri } = require('../middleware/multer');

// Controller to upload files through multer and cloudinary
const fileUploader = asyncWrapper(async (req, res) => {
  try {
    const { userId } = req.params;
    const existingAlbum = await getAlbum(userId);
    const cloudinaryUploadPromises = req.files.map(async (file) => {
      const fileUri = dataUri(file).content;
      const cloudinaryUploadResult = await uploadFilesCloudinary(
        fileUri,
        userId,
      );
      let dbUploadResult;

      if (cloudinaryUploadResult.status === 200 && existingAlbum.length === 0) {
        //TODO: Add MessageID and KidID. This is pending Message Service creation
        dbUploadResult = await createNewAlbum({
          photos: [{ url: cloudinaryUploadResult.url }],
          createdBy: userId,
        });
      } else if (cloudinaryUploadResult.status === 200) {
        dbUploadResult = await updateAlbum(userId, {
          url: cloudinaryUploadResult.url,
        });
      } else {
        dbUploadResult = cloudinaryUploadResult;
      }

      return dbUploadResult;
    });

    const cloudinaryUploadResults = await Promise.all(cloudinaryUploadPromises);

    res.status(StatusCodes.MULTI_STATUS).json(cloudinaryUploadResults);
  } catch (err) {
    res.status(StatusCodes.BAD_GATEWAY).json({
      err,
    });
  }
});

// Controller to get files from cloudinary
const getAllPhotos = asyncWrapper(async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await getAllPhotoCloudinary(userId);
    res.status(StatusCodes.ACCEPTED).json(results);
  } catch (err) {
    res.status(StatusCodes.BAD_GATEWAY).json({
      err,
    });
  }
});

module.exports = { fileUploader, getAllPhotos };
