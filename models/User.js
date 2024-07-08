const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const { Schema } = mongoose;
const uniqueValidator = require('mongoose-unique-validator');

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: false,
    trim: true,
    default: '',
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    //check that it is unique, without duplication
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide your password'],
    trim: true,
  },
  passwordResetToken: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    // default: 'user',
  },
  kids: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Kid',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
  emailIsActivated: {
    type: Boolean,
    default: false,
  },
});

UserSchema.pre('save', async function (next) {
  const user = this;
  // only hash the password if it has been modified (or is new)
  // SALT_WORK_FACTOR = 8, auto-gen a salt and hash
  const salt = await bcrypt.genSalt(10);
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, salt);
  }
  next();
});

// Apply the uniqueValidator plugin to principleSchema.
UserSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', UserSchema);
