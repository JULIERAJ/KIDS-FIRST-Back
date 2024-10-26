const { StatusCodes } = require('http-status-codes');
const asyncWrapper = require('../middleware/async-wrapper');
const { uploadFilesCloudinary } = require('../middleware/cloudinary');
const { dataUri } = require('../utils/helper');
const {
  createNewAlbum,
  getAlbum,
  updateAlbum,
  getAllPhotoCloudinary,
} = require('../service/album-service');

// Controller to upload files through multer and cloudinary
const fileUploader = asyncWrapper(async (req, res) => {
  try {
    const { userId } = req.params;
    const cloudinaryUploadPromises = req.files.map(async (file, index) => {
      const existingAlbum = await getAlbum(userId);
      if (existingAlbum.length === 0 && index === 0)
        existingAlbum.totalStorageSpaceUsed = file.size;
      if (existingAlbum.length > 0) {
        if (
          existingAlbum.totalStorageSpaceUsed + file.size >
          process.env.MAX_STORAGE_SIZE
        ) {
          throw new Error(
            'Insufficient storage space. Please clear files from Album to add more files.',
          );
        } else {
          existingAlbum.totalStorageSpaceUsed += file.size;
        }
      }

      const fileUri = dataUri(file).content;
      const cloudinaryUploadResult = await uploadFilesCloudinary(
        fileUri,
        userId,
      );
      let dbUploadResult;

      if (cloudinaryUploadResult.status === 200 && existingAlbum.length === 0) {
        //TODO: Add MessageID and KidID. This is pending Message Service creation
        dbUploadResult = await createNewAlbum({
          photos: [
            {
              url: cloudinaryUploadResult.url,
              fileName: file.originalname,
              fileType: file.mimetype.split('/')[1],
              fileSize: file.size,
            },
          ],
          messageId: req.messageId,
          kidId: req.kidId,
          createdBy: userId,
          totalStorageSpaceUsed: existingAlbum.totalStorageSpaceUsed,
        });
      } else if (cloudinaryUploadResult.status === 200) {
        dbUploadResult = await updateAlbum(userId, {
          url: cloudinaryUploadResult.url,
          fileName: file.originalname,
          fileType: file.mimetype.split('/')[1],
          fileSize: file.size,
          totalStorageSpaceUsed: existingAlbum.totalStorageSpaceUsed,
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
