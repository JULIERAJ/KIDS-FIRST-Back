const CalendarEvent = require('../models/Calendar');
const Kid = require('../models/Kid');
const User = require('../models/User');

// Create a new calendar event
const createEvent = async (creatorID, kidID, eventDetails) => {
  // Verify that the kid exists
  const kid = await Kid.findById(kidID);
  if (!kid) throw new Error('Kid does not exist');

  // Verify that the creator is authorized (e.g., has custody of the kid)
  const creator = await User.findById(creatorID);
  if (!creator || !creator.kids.includes(kidID)) {
    throw new Error('You do not have custody of this kid');
  }

  // Create the new event
  const newEvent = new CalendarEvent({
    ...eventDetails,
    kidID,
    createdBy: creatorID,
    status: eventDetails.sharedWith ? 'pending' : 'accepted', // Status is 'accepted' if solo, 'pending' otherwise
  });

  try {
    return await newEvent.save();
  } catch (error) {
    throw new Error('Failed to create calendar event');
  }
};

// Update an existing calendar event
const updateEvent = async (eventID, updaterID, eventUpdates) => {
  const event = await CalendarEvent.findById(eventID);
  if (!event) throw new Error('Event not found');

  if (event.createdBy.toString() !== updaterID.toString()) {
    throw new Error('You do not have permission to update this event');
  }

  Object.assign(event, eventUpdates);

  try {
    return await event.save();
  } catch (error) {
    throw new Error('Failed to update calendar event');
  }
};

// Delete a calendar event
const deleteEvent = async (eventID, userID) => {
  const event = await CalendarEvent.findById(eventID);
  if (!event) throw new Error('Event not found');

  if (event.createdBy.toString() !== userID.toString()) {
    throw new Error('You do not have permission to delete this event');
  }

  try {
    await event.remove();
    return { message: 'Event deleted successfully' };
  } catch (error) {
    throw new Error('Failed to delete calendar event');
  }
};

// Retrieve all events for a specific kid
const getEventsForKid = async (kidID) => {
  try {
    return await CalendarEvent.find({ kidID });
  } catch (error) {
    throw new Error('Failed to retrieve events');
  }
};

// Handle event response (for shared events)
const handleEventResponse = async (eventID, userID, response) => {
  const event = await CalendarEvent.findById(eventID);
  if (!event) throw new Error('Event not found');

  if (event.sharedWith.toString() !== userID.toString()) {
    throw new Error('You do not have permission to respond to this event');
  }

  if (response === 'accepted') {
    event.status = 'accepted';
  } else if (response === 'declined') {
    event.status = 'declined';
  } else {
    throw new Error('Invalid response');
  }

  try {
    return await event.save();
  } catch (error) {
    throw new Error('Failed to update event status');
  }
};

module.exports = {
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsForKid,
  handleEventResponse,
};
