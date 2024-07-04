const mongoose = require('mongoose');

const { Schema } = mongoose;
const {
  validateImageURL,
  validateImageSize,
  validateDOB,
} = require('../utils/validators');

const KidsSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'The kid must have a first name'],
      trim: true,
    },
    childColor: {
      type: String,
      enum: ['purple', 'yellow', 'green', 'blue', 'red'],
      required: true,
    },
    imageProfileURL: {
      type: String,
      validate: [
        {
          validator: validateImageURL,
          message: 'Image URL must be a valid .jpeg, .jpg, or .png file',
        },
        {
          validator: validateImageSize,
          message: 'Image size must be less than 500 KB',
        },
      ],
    },
    imageProfilePublicId: {
      type: String,
    },
    DOB: {
      type: String,
      validate: {
        validator: validateDOB,
        message: 'The date needs to be in the past',
      },
    },
    allergies: {
      type: [
        {
          type: String,
          enum: [
            'Bees',
            'Crustaceans and Molluscs',
            'Eggs',
            'Dust',
            'Fish',
            'Gluten',
            'Lactose',
            'Mustard',
            'Peanuts',
            'Pets',
            'Pollen',
            'Sesame seeds',
            'Soy',
            'Sulfates',
            'Tree Nuts',
          ],
        },
      ],
    },
    interest: {
      type: [
        {
          type: String,
          enum: [
            'Animals',
            'Arts and crafts',
            'Basketball',
            'Cooking',
            'Dancing',
            'Drawing',
            'Ice hockey',
            'Music',
            'Reading',
            'Singing',
            'Soccer',
            'Video games',
          ],
        },
      ],
    },
    fears: {
      type: [
        {
          type: String,
          enum: [
            'Animals',
            'Dogs',
            'Cats',
            'Birds',
            'Rodents',
            'Lizards',
            'Arachnids',
            'Blood',
            'Clowns',
            'Crowded places',
            'The dark',
            'Enclosed spaces',
            'Heights',
            'Flying',
            'Social anxiety',
          ],
        },
      ],
    },
    otherNotes: {
      type: String,
      maxlength: [200, 'Notes can be a maximum of 200 characters'],
    },
    custodyIDs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Kid = mongoose.model('Kid', KidsSchema);

module.exports = Kid;
