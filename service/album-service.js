/* eslint-disable camelcase */
const { StatusCodes } = require('http-status-codes');
const { getAllPhotoCloudinary } = require('../middleware/cloudinary');
const Album = require('../models/Album');

// Get message attachments by message Id
const getMessageAttachments = async (messageId) => {
  const attachments = await Album.find({ messageId: messageId });
  return attachments;
};

// Get album photos from database
const getAlbumPhotos = async (userId) => {
  try {
    const { resources } = await getAllPhotoCloudinary(userId);
    //TODO: enrich with message data from database
    // const attachments = await Album.find({ createdBy: userId });
    let totalStorageSpaceUsed = 0;
    resources.forEach((upload) => {
      totalStorageSpaceUsed += upload.bytes;
    });
    return { totalStorageSpaceUsed, resources };
  } catch (err) {
    return {
      message: 'Error retrieving album photos.',
      error: err,
    };
  }
};

// Get album size from database
const getAlbumSize = async (userId) => {
  try {
    const attachments = await Album.find({ createdBy: userId });
    let totalStorageSpaceUsed = 0;
    attachments.forEach((attachment) => {
      attachment.photos.forEach((photo) => {
        totalStorageSpaceUsed += photo.fileSize;
      });
    });
    return totalStorageSpaceUsed || 0;
  } catch (err) {
    return {
      message: 'Error retrieving album details.',
      error: err,
    };
  }
};

// Create new message attachments in database
const createNewMessageAttachment = async (data) => {
  try {
    const attachments = new Album({ ...data });
    const results = await attachments.save();
    if (results) {
      return {
        status: StatusCodes.OK,
        message: 'Successfully updated database with new images.',
        url: results.photos[0].url,
        cloudinaryPublicId: results.photos[0].cloudinaryPublicId,
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

// Upload new attachments to existing message in database
const addMessageAttachment = async (createdBy, messageId, photo) => {
  try {
    const albumUpdate = await Album.findOneAndUpdate(
      { createdBy: createdBy, messageId: messageId },
      {
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
        cloudinaryPublicId: photo.cloudinaryPublicId,
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

// Delete attachment to existing message in database
const deleteMessageAttachment = async (
  createdBy,
  messageId,
  cloudinaryPublicId,
) => {
  try {
    const albumUpdate = await Album.findOneAndUpdate(
      { createdBy: createdBy, messageId: messageId },
      {
        $pull: { photos: { cloudinaryPublicId } },
      },
      {
        new: true,
        runValidators: true,
      },
    );
    if (albumUpdate.photos.length === 0) {
      Album.findOneAndDelete({
        createdBy: createdBy,
        messageId: messageId,
      });
    }
    if (albumUpdate) {
      return {
        status: StatusCodes.OK,
        message: 'Successfully removed attachment from database.',
        albumUpdate: albumUpdate,
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

// Delete attachment to existing message in database
const cleanEmptyAttachments = async (createdBy, messageId) => {
  try {
    const attachments = await Album.find({
      createdBy: createdBy,
      messageId: messageId,
    });
    if (attachments.photos.length === 0) {
      const deleteResults = Album.findOneAndDelete({
        createdBy: createdBy,
        messageId: messageId,
      });

      return {
        status: StatusCodes.OK,
        message: 'Successfully cleaned up message attachments in database.',
        results: deleteResults,
      };
    }
    return {
      status: StatusCodes.OK,
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
  createNewMessageAttachment,
  getAlbumPhotos,
  getAlbumSize,
  getMessageAttachments,
  addMessageAttachment,
  deleteMessageAttachment,
  cleanEmptyAttachments,
};
