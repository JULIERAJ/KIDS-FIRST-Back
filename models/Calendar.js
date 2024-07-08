const mongoose = require('mongoose');

const { Schema } = mongoose;

const CalendarEventSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
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
  sharedWith: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  eventType: {
    type: String,
    enum: ['solo', 'shared'],
    default: 'solo',
  },
  requestType: {
    type: String,
    enum: ['add', 'edit', 'delete'],
    default: 'add',
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

CalendarEventSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const CalendarEvent = mongoose.model('CalendarEvent', CalendarEventSchema);

module.exports = CalendarEvent;
