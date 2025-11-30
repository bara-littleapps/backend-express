// src/controllers/eventController.js

const { successResponse, errorResponse } = require('../utils/response');
const {
  listEvents,
  listMyEvents,
  createEvent,
  getEventPublic,
  updateEvent,
  changeEventStatus,
  createEventRegistration,
  listEventRegistrations,
  getEventRegistrationStats,
  listMyEventRegistrations,
} = require('../services/eventService');
const {
  createPaymentForEventRegistration,
} = require('../services/paymentService');

async function getEvents(req, res, next) {
  try {
    const { page, limit, q, upcoming } = req.query;

    const result = await listEvents({ page, limit, q, upcoming });

    return successResponse(res, {
      code: 200,
      message: 'Events fetched successfully',
      data: result.items,
      meta: result.meta,
    });
  } catch (err) {
    return next(err);
  }
}

async function getEventDetail(req, res, next) {
  try {
    const { idOrSlug } = req.params;

    const event = await getEventPublic(idOrSlug);

    return successResponse(res, {
      code: 200,
      message: 'Event fetched successfully',
      data: event,
    });
  } catch (err) {
    if (err.code && err.errorCode) {
      return errorResponse(res, {
        code: err.code,
        errorCode: err.errorCode,
      });
    }
    return next(err);
  }
}

async function getMyEventsHandler(req, res, next) {
  try {
    const { page, limit } = req.query;

    const result = await listMyEvents(req.user.id, { page, limit });

    return successResponse(res, {
      code: 200,
      message: 'Events fetched successfully',
      data: result.items,
      meta: result.meta,
    });
  } catch (err) {
    return next(err);
  }
}

async function createEventHandler(req, res, next) {
  try {
    const {
      title,
      description,
      location,
      startDatetime,
      endDatetime,
      pricePerPerson,
    } = req.body;

    const missing = [];
    if (!title) missing.push({ field: 'title', message: 'Title is required' });
    if (!description) missing.push({ field: 'description', message: 'Description is required' });
    if (!location) missing.push({ field: 'location', message: 'Location is required' });
    if (!startDatetime) missing.push({ field: 'startDatetime', message: 'Start datetime is required' });
    if (!endDatetime) missing.push({ field: 'endDatetime', message: 'End datetime is required' });

    if (missing.length > 0) {
      return errorResponse(res, {
        code: 422,
        errorCode: 'VALIDATION_ERROR',
        details: missing,
      });
    }

    const event = await createEvent({
      creatorId: req.user.id,
      payload: req.body,
    });

    return successResponse(res, {
      code: 201,
      message: 'Event created successfully',
      data: event,
    });
  } catch (err) {
    if (err.code && err.errorCode) {
      return errorResponse(res, {
        code: err.code,
        errorCode: err.errorCode,
        details: err.details || null,
      });
    }
    return next(err);
  }
}

async function updateEventHandler(req, res, next) {
  try {
    const { id } = req.params;

    const event = await updateEvent({
      creatorId: req.user.id,
      eventId: id,
      payload: req.body,
    });

    return successResponse(res, {
      code: 200,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (err) {
    if (err.code && err.errorCode) {
      return errorResponse(res, {
        code: err.code,
        errorCode: err.errorCode,
        details: err.details || null,
      });
    }
    return next(err);
  }
}

async function changeEventStatusHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, {
        code: 422,
        errorCode: 'VALIDATION_ERROR',
        details: [{ field: 'status', message: 'Status is required' }],
      });
    }

    const event = await changeEventStatus({
      creatorId: req.user.id,
      eventId: id,
      status,
    });

    return successResponse(res, {
      code: 200,
      message: 'Event status updated successfully',
      data: event,
    });
  } catch (err) {
    if (err.code && err.errorCode) {
      return errorResponse(res, {
        code: err.code,
        errorCode: err.errorCode,
        details: err.details || null,
      });
    }
    return next(err);
  }
}

// User login: register event (create registration + payment bila berbayar)
async function createEventRegistrationHandler(req, res, next) {
  try {
    const { eventId } = req.params;

    const { event, registration } = await createEventRegistration({
      userId: req.user.id,
      eventId,
    });

    let payment = null;
    if (event.isPaid) {
      payment = await createPaymentForEventRegistration({
        userId: req.user.id,
        event,
        registration,
      });
    }

    return successResponse(res, {
      code: 201,
      message: 'Event registration created successfully',
      data: {
        event,
        registration,
        payment,
      },
    });
  } catch (err) {
    if (err.code && err.errorCode) {
      return errorResponse(res, {
        code: err.code,
        errorCode: err.errorCode,
        details: err.details || null,
      });
    }
    return next(err);
  }
}

// Creator: list registrations untuk event
async function getEventRegistrationsHandler(req, res, next) {
  try {
    const { eventId } = req.params;

    const regs = await listEventRegistrations({
      eventId,
      creatorId: req.user.id,
    });

    return successResponse(res, {
      code: 200,
      message: 'Event registrations fetched successfully',
      data: regs,
    });
  } catch (err) {
    if (err.code && err.errorCode) {
      return errorResponse(res, {
        code: err.code,
        errorCode: err.errorCode,
      });
    }
    return next(err);
  }
}

// Creator: stats registrasi
async function getEventRegistrationStatsHandler(req, res, next) {
  try {
    const { eventId } = req.params;

    const stats = await getEventRegistrationStats({
      eventId,
      creatorId: req.user.id,
    });

    return successResponse(res, {
      code: 200,
      message: 'Event registration stats fetched successfully',
      data: stats,
    });
  } catch (err) {
    if (err.code && err.errorCode) {
      return errorResponse(res, {
        code: err.code,
        errorCode: err.errorCode,
      });
    }
    return next(err);
  }
}

// User: list event registrations miliknya
async function getMyEventRegistrationsHandler(req, res, next) {
  try {
    const { page, limit } = req.query;

    const result = await listMyEventRegistrations(req.user.id, { page, limit });

    return successResponse(res, {
      code: 200,
      message: 'Event registrations fetched successfully',
      data: result.items,
      meta: result.meta,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
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
};
