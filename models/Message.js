const mongoose = require('mongoose');

const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    senderID: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverID: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['delivered', 'unread', 'read', 'deleted'],
      default: 'delivered',
    },
  },
  { timestamps: true },
);

// add index to improve query performance
MessageSchema.index({ senderID: 1 });
MessageSchema.index({ receiverID: 1 });

module.exports = mongoose.model('Message', MessageSchema);
