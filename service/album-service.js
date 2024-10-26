/* eslint-disable camelcase */
const { StatusCodes } = require('http-status-codes');
const { resources_by_asset_folder } = require('../config/cloudinary-config');
const Album = require('../models/Album');

// Create new album in database
const createNewAlbum = async (data) => {
  try {
    const photos = new Album({ ...data });
    const results = await photos.save();
    if (results) {
      return {
        status: StatusCodes.OK,
        message: 'Successfully updated database with new images.',
        url: results.photos[0].url,
      };
    }
    return {
      status: StatusCodes.BAD_REQUEST,
      message: 'Error updating database. Review request parameters.',
    };
  } catch (err) {
    return {
      status: StatusCodes.BAD_GATEWAY,
      message: 'Error updating database.',
      error: err,
    };
  }
};

// Get album details from database
const getAlbum = async (userId) => {
  const album = await Album.find({ createdBy: userId });
  if (album || album.isArray) {
    return album;
  }
  return new Error('Error finding album.');
};

// Upload new photos to album in database
const updateAlbum = async (createdBy, photo, totalStorageSpaceUsed) => {
  try {
    const albumUpdate = await Album.findOneAndUpdate(
      { createdBy: createdBy },
      {
        totalStorageSpaceUsed: totalStorageSpaceUsed,
        $push: { photos: photo },
      },
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
    console.log(err);
    return {
      status: StatusCodes.BAD_GATEWAY,
      message: 'Error updating database.',
      error: err,
    };
  }
};

// Get all photos from Cloudinary
// TODO: Set up pagination for images: https://cloudinary.com/blog/lazy-loading-with-infinite-scroll
const getAllPhotoCloudinary = async (userId) => {
  try {
    const photos = await resources_by_asset_folder(
      `albums/${userId}`,
      { tags: true, metadata: true },
      (error, result) => error,
    );
    if (photos) {
      return {
        status: StatusCodes.OK,
        message: 'Successfully fetched images from Cloudinary.',
        photos,
      };
    }
  } catch (err) {
    return {
      status: StatusCodes.BAD_GATEWAY,
      message: 'Error getting photos.',
      error: err,
    };
  }
};

module.exports = {
  createNewAlbum,
  getAlbum,
  updateAlbum,
  getAllPhotoCloudinary,
};
