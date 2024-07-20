const mongoose = require('mongoose');

const { Schema } = mongoose;

const LoginAttemptSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
    required: true,
  },
  lockUntil: { type: Date },
});

module.exports = mongoose.model('LoginAttempt', LoginAttemptSchema);
