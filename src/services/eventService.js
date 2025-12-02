const prisma = require('../prisma/client');
const { EVENT_ADMIN_FEE_IDR } = require('../constants/financeConstants');

async function generateEventSlug(title) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const slug = `${base}-${Date.now()}`;
  return slug;
}

// Public: list events
async function listEvents({ page = 1, limit = 10, q, upcoming }) {
  const take = Number(limit) || 10;
  const skip = (Number(page) - 1) * take;

  const now = new Date();

  const where = {
    status: 'PUBLISHED',
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { location: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (upcoming === 'true') {
    where.startDatetime = {
      gte: now,
    };
  }

  const [items, totalItems] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take,
      orderBy: {
        startDatetime: 'asc',
      },
      include: {
        creator: true,
      },
    }),
    prisma.event.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / take);

  return {
    items,
    meta: {
      page: Number(page),
      limit: take,
      totalItems,
      totalPages,
    },
  };
}

// Creator: list their events
async function listMyEvents(creatorId, { page = 1, limit = 10 }) {
  const take = Number(limit) || 10;
  const skip = (Number(page) - 1) * take;

  const where = {
    creatorId,
  };

  const [items, totalItems] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.event.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / take);

  return {
    items,
    meta: {
      page: Number(page),
      limit: take,
      totalItems,
      totalPages,
    },
  };
}

// Creator: create event
async function createEvent({ creatorId, payload }) {
  const {
    title,
    description,
    location,
    startDatetime,
    endDatetime,
    pricePerPerson,
    quota,
  } = payload;

  const slug = await generateEventSlug(title);

  const isPaid = pricePerPerson && Number(pricePerPerson) > 0;

  const event = await prisma.event.create({
    data: {
      creatorId,
      title,
      slug,
      type: payload.type || 'MAIN_BARENG',
      description,
      location,
      startDatetime: new Date(startDatetime),
      endDatetime: new Date(endDatetime),
      isPaid,
      pricePerPerson: isPaid ? pricePerPerson : null,
      adminFee: isPaid ? EVENT_ADMIN_FEE_IDR : 0,
      quota: quota || null,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  return event;
}

// Public detail event by id / slug
async function getEventPublic(idOrSlug) {
  let event = null;

  if (idOrSlug.includes('-') && idOrSlug.length > 20) {
    event = await prisma.event.findUnique({
      where: { id: idOrSlug },
      include: {
        creator: true,
      },
    });
  } else {
    event = await prisma.event.findFirst({
      where: { slug: idOrSlug },
      include: { creator: true },
    });

    if (!event) {
      event = await prisma.event.findUnique({
        where: { id: idOrSlug },
        include: { creator: true },
      });
    }
  }

  if (!event || event.status !== 'PUBLISHED') {
    const error = new Error('Event not found');
    error.code = 404;
    error.errorCode = 'EVENT_NOT_FOUND';
    throw error;
  }

  return event;
}

// Creator: update event
async function updateEvent({ creatorId, eventId, payload }) {
  const existing = await prisma.event.findFirst({
    where: {
      id: eventId,
      creatorId,
    },
  });

  if (!existing) {
    const error = new Error('Event not found');
    error.code = 404;
    error.errorCode = 'EVENT_NOT_FOUND';
    throw error;
  }

  const data = {
    title: payload.title ?? existing.title,
    description: payload.description ?? existing.description,
    location: payload.location ?? existing.location,
    startDatetime: payload.startDatetime
      ? new Date(payload.startDatetime)
      : existing.startDatetime,
    endDatetime: payload.endDatetime
      ? new Date(payload.endDatetime)
      : existing.endDatetime,
    quota: typeof payload.quota === 'number' ? payload.quota : existing.quota,
  };

  if (typeof payload.pricePerPerson !== 'undefined') {
    const isPaid = Number(payload.pricePerPerson) > 0;
    data.isPaid = isPaid;
    data.pricePerPerson = isPaid ? payload.pricePerPerson : null;
    data.adminFee = isPaid ? EVENT_ADMIN_FEE_IDR : 0;
  }

  const event = await prisma.event.update({
    where: { id: eventId },
    data,
  });

  return event;
}

// Creator: change status (PUBLISHED, CANCELLED, ARCHIVED, DRAFT)
async function changeEventStatus({ creatorId, eventId, status }) {
  const allowed = ['PUBLISHED', 'CANCELLED', 'ARCHIVED', 'DRAFT'];

  if (!allowed.includes(status)) {
    const error = new Error('Invalid status value');
    error.code = 422;
    error.errorCode = 'VALIDATION_ERROR';
    error.details = [
      {
        field: 'status',
        message: 'Status must be one of PUBLISHED, CANCELLED, ARCHIVED, DRAFT',
      },
    ];
    throw error;
  }

  const existing = await prisma.event.findFirst({
    where: {
      id: eventId,
      creatorId,
    },
  });

  if (!existing) {
    const error = new Error('Event not found');
    error.code = 404;
    error.errorCode = 'EVENT_NOT_FOUND';
    throw error;
  }

  const data = { status };

  if (status === 'PUBLISHED' && !existing.publishedAt) {
    data.publishedAt = new Date();
  }

  const updated = await prisma.event.update({
    where: { id: eventId },
    data,
  });

  return updated;
}

// Helper: check quote
async function ensureEventCapacity(eventId) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    const error = new Error('Event not found');
    error.code = 404;
    error.errorCode = 'EVENT_NOT_FOUND';
    throw error;
  }

  if (!event.quota || event.quota <= 0) {
    return event; // no quota limit
  }

  const count = await prisma.eventRegistration.count({
    where: {
      eventId,
      status: {
        in: ['PENDING_PAYMENT', 'CONFIRMED'],
      },
    },
  });

  if (count >= event.quota) {
    const error = new Error('Event quota is full');
    error.code = 400;
    error.errorCode = 'VALIDATION_ERROR';
    error.details = [
      {
        field: 'eventId',
        message: 'Event quota is full',
      },
    ];
    throw error;
  }

  return event;
}

// Register event + payment (Payment service)
async function createEventRegistration({ userId, eventId }) {
  const event = await ensureEventCapacity(eventId);

  if (event.status !== 'PUBLISHED') {
    const error = new Error('Event is not open for registration');
    error.code = 400;
    error.errorCode = 'VALIDATION_ERROR';
    error.details = [
      {
        field: 'eventId',
        message: 'Event is not open for registration',
      },
    ];
    throw error;
  }

  let totalAmount = 0;
  if (event.isPaid) {
    const base = Number(event.pricePerPerson || 0);
    const fee = Number(event.adminFee || 0);
    totalAmount = base + fee;
  }

  const registration = await prisma.eventRegistration.create({
    data: {
      eventId: event.id,
      userId,
      status: event.isPaid ? 'PENDING_PAYMENT' : 'CONFIRMED',
      totalAmount,
    },
  });

  return {
    event,
    registration,
  };
}

// Creator: list registrations for their event
async function listEventRegistrations({ eventId, creatorId }) {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      creatorId,
    },
  });

  if (!event) {
    const error = new Error('Event not found');
    error.code = 404;
    error.errorCode = 'EVENT_NOT_FOUND';
    throw error;
  }

  const regs = await prisma.eventRegistration.findMany({
    where: {
      eventId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: true,
    },
  });

  return regs;
}

// Creator: stats register event
async function getEventRegistrationStats({ eventId, creatorId }) {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      creatorId,
    },
  });

  if (!event) {
    const error = new Error('Event not found');
    error.code = 404;
    error.errorCode = 'EVENT_NOT_FOUND';
    throw error;
  }

  const grouped = await prisma.eventRegistration.groupBy({
    by: ['status'],
    where: {
      eventId,
    },
    _count: {
      _all: true,
    },
  });

  const byStatus = grouped.reduce((acc, item) => {
    acc[item.status] = item._count._all;
    return acc;
  }, {});

  const total = grouped.reduce((sum, item) => sum + item._count._all, 0);

  return {
    eventId,
    totalRegistrations: total,
    byStatus,
  };
}

// User: view their event registrations
async function listMyEventRegistrations(userId, { page = 1, limit = 10 }) {
  const take = Number(limit) || 10;
  const skip = (Number(page) - 1) * take;

  const where = {
    userId,
  };

  const [items, totalItems] = await Promise.all([
    prisma.eventRegistration.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        event: true,
      },
    }),
    prisma.eventRegistration.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / take);

  return {
    items,
    meta: {
      page: Number(page),
      limit: take,
      totalItems,
      totalPages,
    },
  };
}

module.exports = {
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
};
