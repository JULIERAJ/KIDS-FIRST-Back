const mongoose = require('mongoose');
const { validateImageSize } = require('../utils/validators');

const { Schema } = mongoose;

const AlbumSchema = new Schema(
  {
    photos: [
      {
        cloudinaryPublicId: {
          type: String,
          required: [true, 'Cloudinary Public Id is required'],
        },
        url: {
          type: String,
          required: [true, 'File URL is required'],
        },
        fileName: {
          type: String,
          required: [true, 'File name is required'],
        },
        fileSize: {
          type: Number,
          required: [true, 'File size is required'],
          validate: [
            {
              validator: validateImageSize,
              message: 'Photo size must be less than 500 KB',
            },
          ],
        },
      },
    ],
    kidId: {
      type: Schema.Types.ObjectId,
      ref: 'Kid',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const Album = mongoose.model('Album', AlbumSchema);

module.exports = Album;
