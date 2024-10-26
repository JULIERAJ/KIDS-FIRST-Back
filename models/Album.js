const mongoose = require('mongoose');

const { Schema } = mongoose;
const {
  validateImageURL,
  validateImageSize,
  validateStorageSize,
} = require('../utils/validators');

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
    totalStorageSpaceUsed: {
      type: Number,
      required: [true, 'Storage size is required'],
      validate: [
        {
          validator: validateStorageSize,
          message: 'Total size must be less than 12 MB',
        },
      ],
    },
    kidID: {
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
