const express = require('express');
const {
  getEvents,
  getEventDetail,
  getMyEventsHandler,
  createEventHandler,
  updateEventHandler,
  changeEventStatusHandler,
  createEventRegistrationHandler,
  getEventRegistrationsHandler,
  getEventRegistrationStatsHandler,
  getMyEventRegistrationsHandler,
} = require('../controllers/eventController');
const { authRequired } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public: list events
router.get('/', getEvents);

// Public: detail event
router.get('/:idOrSlug', getEventDetail);

// Event Creator: list my events
router.get('/me/list/my', authRequired, getMyEventsHandler);

// Creator: create event
router.post('/', authRequired, createEventHandler);

// Creator: update event
router.patch('/:id', authRequired, updateEventHandler);

// Creator: change event status (PUBLISHED, CANCELLED, ARCHIVED, DRAFT)
router.patch('/:id/status', authRequired, changeEventStatusHandler);

// User login: register event (creates registration + payment if paid)
router.post('/:eventId/registrations', authRequired, createEventRegistrationHandler);

// Creator: list registrations
router.get('/:eventId/registrations', authRequired, getEventRegistrationsHandler);

// Creator: stats registrations for event
router.get('/:eventId/registrations/stats', authRequired, getEventRegistrationStatsHandler);

// User: list event registrations for self
router.get('/registrations/me/list', authRequired, getMyEventRegistrationsHandler);

module.exports = router;
