const { uploader } = require('../config/cloudinary-config');

// Express route for file upload
const uploadFilesCloudinary = async (file) => {
  try {
    // Upload file to Cloudinary
    const result = await uploader.upload(file, {
      folder: 'album',
    });

    // Send the Cloudinary URL in the response
    return {
      status: 200,
      message: 'File successfully uploaded to Cloudinary',
      url: result.secure_url,
    };
  } catch (error) {
    return {
      status: 500,
      message: 'Error uploading file to Cloudinary',
      error: error,
    };
  }
};

module.exports = {
  uploadFilesCloudinary,
};
