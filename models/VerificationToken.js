const mongoose = require('mongoose');

const { Schema } = mongoose;

const VerificationTokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 3600, // Token will automatically be removed after 1 hour
  },
});

module.exports = mongoose.model('VerificationToken', VerificationTokenSchema);
