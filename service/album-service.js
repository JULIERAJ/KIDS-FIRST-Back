const { StatusCodes } = require('http-status-codes');
const { uploader } = require('../config/cloudinary-config');

// Upload files to Cloudinary
const uploadFilesCloudinary = async (file, userId) => {
  try {
    const result = await uploader.upload(file, {
      folder: `album/${userId}`,
    });

    return {
      status: StatusCodes.OK,
      message: 'File successfully uploaded to Cloudinary',
      url: result.secure_url,
    };
  } catch (error) {
    return {
      status: StatusCodes.BAD_GATEWAY,
      message: 'Error uploading file to Cloudinary',
      error: error,
    };
  }
};

module.exports = {
  uploadFilesCloudinary,
};
