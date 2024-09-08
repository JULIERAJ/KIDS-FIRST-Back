const { StatusCodes } = require('http-status-codes');
const { uploader } = require('../config/cloudinary-config');
const Album = require('../models/Album');

// Upload files to Cloudinary
const uploadFilesCloudinary = async (file, userId) => {
  try {
    const result = await uploader.upload(file, {
      folder: `albums/${userId}`,
    });

    return {
      status: StatusCodes.OK,
      message: 'File successfully uploaded to Cloudinary.',
      url: result.secure_url,
    };
  } catch (error) {
    return {
      status: StatusCodes.BAD_GATEWAY,
      message: 'Error uploading file to Cloudinary.',
      error: error,
    };
  }
};

// Create new album in database
const createNewAlbum = async (data) => {
  try {
    const photos = new Album({ ...data });
    const results = await photos.save();
    if (results) {
      return {
        status: StatusCodes.OK,
        message: 'Successfully updated database with new images.',
        url: photos.url,
      };
    }
    return {
      status: StatusCodes.BAD_REQUEST,
      message: 'Error updating database. Review request parameters.',
    };
  } catch (err) {
    return new Error({ message: 'Error updating database.', error: err });
  }
};

// Get album details from database
const getAlbum = async (userId) => {
  const album = Album.find({ createdBy: userId });
  if (album || album.isArray) {
    return album;
  }
  return new Error('Error finding album.');
};

// Upload new photos to album in database
const updateAlbum = async (createdBy, photo) => {
  try {
    const albumUpdate = await Album.findOneAndUpdate(
      { createdBy },
      { $push: { photos: photo } },
      {
        new: true,
        runValidators: true,
      },
    );
    if (albumUpdate) {
      return {
        status: StatusCodes.OK,
        message: 'Successfully updated database with new image.',
        url: photo.url,
      };
    }
    return {
      status: StatusCodes.BAD_REQUEST,
      message: 'Error updating database. Review request parameters.',
    };
  } catch (err) {
    return new Error({ message: 'Error updating database.', error: err });
  }
};

module.exports = {
  uploadFilesCloudinary,
  createNewAlbum,
  getAlbum,
  updateAlbum,
};
