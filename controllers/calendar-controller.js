const { StatusCodes } = require('http-status-codes');
const asyncWrapper = require('../middleware/async-wrapper');
const calendarService = require('../service/calendar-service');

// Create a new calendar event
const createCalendarEvent = asyncWrapper(async (req, res) => {
  const { kidID } = req.params;
  const { title, description, startTime, endTime, sharedWith, eventType } = req.body;
  const createdBy = req.user._id;
  const result = await calendarService.createEvent( 
    kidID,
    createdBy,
    title,
    description,
    startTime,
    endTime,
    sharedWith,
    eventType
  );
  res.status(StatusCodes.CREATED).json(result);
});

// Update an existing calendar event
const updateCalendarEvent = asyncWrapper(async (req, res) => {
  const { eventId } = req.params;
  const { title, description, startTime, endTime, sharedWith, eventType, status } = req.body;
  const userId = req.user._id;
  const result = await calendarService.updateEvent( 
    eventId,
    userId,
    title,
    description,
    startTime,
    endTime,
    sharedWith,
    eventType,
    status
  );
  res.status(StatusCodes.OK).json(result);
});

// Delete a calendar event
const deleteCalendarEvent = asyncWrapper(async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;
  const result = await calendarService.deleteEvent(eventId, userId); 
  res.status(StatusCodes.OK).json(result);
});

// Get calendar events for a kid
const getCalendarEvents = asyncWrapper(async (req, res) => {
  const { kidID } = req.params;
  const userId = req.user._id;
  const events = await calendarService.getEventsForKid(kidID, userId); 
  res.status(StatusCodes.OK).json(events);
});

// Get a single calendar event by ID
const getCalendarEventById = asyncWrapper(async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;
  const event = await calendarService.getEventById(eventId, userId); 
  res.status(StatusCodes.OK).json(event);
});

module.exports = {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvents,
  getCalendarEventById,
};
