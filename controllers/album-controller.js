const { StatusCodes } = require('http-status-codes');
const asyncWrapper = require('../middleware/async-wrapper');
const { uploadFilesCloudinary } = require('../middleware/cloudinary');
const { dataUri } = require('../utils/helper');
const {
  createNewMessageAttachment,
  getAlbumSize,
  getMessageAttachments,
  addMessageAttachment,
  getAlbumPhotos,
} = require('../service/album-service');

// Controller to upload message attachments to cloudinary
const albumFileUpload = asyncWrapper(async (req, res) => {
  try {
    // Validate storage space is sufficient
    const { userId } = req.params;
    const { messageId, kidId } = req.body;
    let totalFileSize;
    req.files.forEach((file) => {
      totalFileSize += file.size;
    });

    const totalStorageSpaceUsed = await getAlbumSize(userId);
    if (totalFileSize + totalStorageSpaceUsed > process.env.MAX_STORAGE_SIZE) {
      throw new Error(
        'Insufficient storage space. Please clear files from Album to add more files.',
      );
    }

    // Upload to Cloudinary
    const cloudinaryUploadPromises = req.files.map(async (file) => {
      const fileUri = dataUri(file).content;
      const cloudinaryUploadResult = await uploadFilesCloudinary(
        fileUri,
        userId,
      );
      let dbUploadResult;

      const message = await getMessageAttachments(messageId);
      if (cloudinaryUploadResult && message) {
        dbUploadResult = await createNewMessageAttachment({
          photos: [
            {
              cloudinaryPublicId: cloudinaryUploadResult.public_id,
              url: cloudinaryUploadResult.secure_url,
              fileName: file.originalname,
              fileSize: file.size,
            },
          ],
          messageId: messageId,
          kidId: kidId,
          createdBy: userId,
        });
      } else if (cloudinaryUploadResult) {
        dbUploadResult = await addMessageAttachment(userId, {
          cloudinaryPublicId: cloudinaryUploadResult.public_id,
          url: cloudinaryUploadResult.secure_url,
          fileName: file.originalname,
          fileSize: file.size,
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

// Controller to get all Album photos from cloudinary
const getAllFiles = asyncWrapper(async (req, res) => {
  try {
    const { userId } = req.params;
    const attachments = await getAlbumPhotos(userId);
    res.status(StatusCodes.ACCEPTED).json(attachments);
  } catch (err) {
    res.status(StatusCodes.BAD_GATEWAY).json({
      err,
    });
  }
});

module.exports = { albumFileUpload, getAllFiles };
