const mongoose = require('mongoose');

const { Schema } = mongoose;
const { validateImageURL, validateImageSize } = require('../utils/validators');

const AlbumSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'The album must have a title'],
      trim: true,
    },
    photos: [
      {
        url: {
          type: String,
          required: [true, 'Photo URL is required'],
          validate: [
            {
              validator: validateImageURL,
              message:
                'Photo URL must be a valid .jpeg, .jpg, .png or .pdf file',
            },
            {
              validator: validateImageSize,
              message: 'Photo size must be less than 500 KB',
            },
          ],
        },
      },
    ],
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
