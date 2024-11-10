const mongoose = require('mongoose');

const { Schema } = mongoose;
const { validateImageURL, validateImageSize } = require('../utils/validators');

const AlbumSchema = new Schema(
  {
    photos: [
      {
        url: {
          type: String,
          required: [true, 'File URL is required'],
        },
        fileName: {
          type: String,
          required: [true, 'File name is required'],
        },
        fileType: {
          type: String,
          required: [true, 'File type is required'],
          validate: [
            {
              validator: validateImageURL,
              message:
                'Photo URL must be a valid .jpeg, .jpg, .png or .pdf file',
            },
          ],
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
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Album = mongoose.model('Album', AlbumSchema);

module.exports = Album;
