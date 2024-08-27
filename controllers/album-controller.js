const { StatusCodes } = require('http-status-codes');
const asyncWrapper = require('../middleware/async-wrapper');
const { uploadFilesCloudinary } = require('../service/album-service');

const { dataUri } = require('../middleware/multer');

// Route to upload files through multer and cloudinary
const fileUploader = asyncWrapper(async (req, res) => {
  const { userId } = req.params;
  const uploadPromises = req.files.map(async (file) => {
    const fileUri = dataUri(file).content;
    const uploadResult = await uploadFilesCloudinary(fileUri, userId);
    return uploadResult;
  });

  const uploadResults = await Promise.all(uploadPromises);

  res.status(StatusCodes.MULTI_STATUS).json(uploadResults);
});

module.exports = { fileUploader };
