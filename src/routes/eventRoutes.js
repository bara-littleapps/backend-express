// src/routes/eventRoutes.js

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
// GET /api/events
router.get('/', getEvents);

// Public: detail event
// GET /api/events/:idOrSlug
router.get('/:idOrSlug', getEventDetail);

// Creator: list events milik sendiri
// GET /api/events/me/list
router.get('/me/list/my', authRequired, getMyEventsHandler);

// Creator: create event
// POST /api/events
router.post('/', authRequired, createEventHandler);

// Creator: update event
// PATCH /api/events/:id
router.patch('/:id', authRequired, updateEventHandler);

// Creator: change event status (PUBLISHED, CANCELLED, ARCHIVED, DRAFT)
// PATCH /api/events/:id/status
router.patch('/:id/status', authRequired, changeEventStatusHandler);

// User login: register event (creates registration + payment if paid)
// POST /api/events/:eventId/registrations
router.post('/:eventId/registrations', authRequired, createEventRegistrationHandler);

// Creator: list registrations
// GET /api/events/:eventId/registrations
router.get('/:eventId/registrations', authRequired, getEventRegistrationsHandler);

// Creator: stats registrasi
// GET /api/events/:eventId/registrations/stats
router.get('/:eventId/registrations/stats', authRequired, getEventRegistrationStatsHandler);

// User: list registration miliknya sendiri
// GET /api/events/registrations/me
router.get('/registrations/me/list', authRequired, getMyEventRegistrationsHandler);

module.exports = router;
