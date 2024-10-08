const express = require('express');
const router = express.Router();

const calendarController = require('../controllers/calendar-controller');
const authenticateUser = require('../middleware/authentication');



router.get('/kid/:kidId', calendarController.getCalendarEvents);
router.get('/event/:eventId', authenticateUser, calendarController.getCalendarEventById);
router.post('/', authenticateUser, calendarController.createCalendarEvent);
router.put('/:eventId', authenticateUser, calendarController.updateCalendarEvent);
router.delete('/:eventId', authenticateUser, calendarController.deleteCalendarEvent);

module.exports = router;