const {
  uploader,
  // eslint-disable-next-line camelcase
  resources_by_asset_folder,
} = require('../config/cloudinary-config');

// Upload files to Cloudinary
const uploadFilesCloudinary = async (file, userId) => {
  try {
    const result = await uploader.upload(
      file,
      {
        use_filename: true,
        folder: `albums/${userId}`,
      },
      (error) => error,
    );
    return result;
  } catch (error) {
    return error;
  }
};

// Get all photos from Cloudinary
// TODO: Set up pagination for images: https://cloudinary.com/blog/lazy-loading-with-infinite-scroll
const getAllPhotoCloudinary = async (userId) => {
  try {
    const photos = await resources_by_asset_folder(
      `albums/${userId}`,
      { tags: true, metadata: true },
      (error) => error,
    );
    return photos;
  } catch (error) {
    return error;
  }
};

module.exports = { uploadFilesCloudinary, getAllPhotoCloudinary };
