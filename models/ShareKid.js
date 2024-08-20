const mongoose = require('mongoose');

const { Schema } = mongoose;
const ShareKidSchema = new Schema(
  {
    inviterID: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    kidID: {
      type: Schema.Types.ObjectId,
      ref: 'Kid',
      required: true,
    },
    inviteeEmail: {
      type: String,
      required: [
        true,
        'Please enter the email of the person you want to share the kid with',
      ],
      lowercase: true,
    },
    inviteeFirstName: {
      type: String,
      required: [
        true,
        'Please enter the first name of the person you want to share the kid with',
      ],
      trim: true,
    },
    inviteeLastName: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    requestType: {
      type: String,
      enum: ['share', 'delete'],
      required: true,
    },
  },
  { timestamps: true },
);

// prevent creating duplicated entries where the same inviter attempts to share the same kids info with the same invitee multiple times
ShareKidSchema.index(
  { inviterID: 1, kidIDs: 1, inviteeEmail: 1, createdAt: 1 },
  { unique: true },
);
module.exports = mongoose.model('ShareKid', ShareKidSchema);
