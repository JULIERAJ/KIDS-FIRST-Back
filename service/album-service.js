/* eslint-disable camelcase */
const { StatusCodes } = require('http-status-codes');
const Album = require('../models/Album');

// Get message attachments by message Id
const getMessageAttachments = async (messageId) => {
  const attachments = await Album.find({ messageId: messageId });
  if (attachments) return attachments;
  return new Error('Error finding attachments.');
};

// Get album photos from database
const getAlbumPhotos = async (userId) => {
  try {
    const messages = await Album.find({ createdBy: userId });
    const album = [];
    messages.forEach((message) => {
      album.push(...message.photos);
    });
    return album;
  } catch (err) {
    return {
      status: StatusCodes.BAD_GATEWAY,
      message: 'Error retrieving album photos.',
      error: err,
    };
  }
};

// Get album size from database
const getAlbumSize = async (userId) => {
  try {
    const messages = await Album.find({ createdBy: userId });
    let totalStorageSpaceUsed = 0;
    messages.forEach((message) => {
      message.photos.forEach((photo) => {
        totalStorageSpaceUsed += photo.fileSize;
      });
    });
    return totalStorageSpaceUsed || 0;
  } catch (err) {
    return {
      status: StatusCodes.BAD_GATEWAY,
      message: 'Error retrieving album details.',
      error: err,
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
    return {
      status: StatusCodes.BAD_GATEWAY,
      message: 'Error updating database.',
      error: err,
    };
  }
};

module.exports = {
  createNewAlbum,
  getAlbumPhotos,
  getAlbumSize,
  updateAlbum,
  getMessageAttachments,
};
