// src/services/adminService.js

const prisma = require('../prisma/client');

// ---------- USERS ----------

async function listUsers({ page = 1, limit = 10, q, isActive }) {
  const take = Number(limit) || 10;
  const skip = (Number(page) - 1) * take;

  const where = {};

  if (typeof isActive !== 'undefined') {
    if (isActive === 'true' || isActive === true) where.isActive = true;
    if (isActive === 'false' || isActive === false) where.isActive = false;
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { username: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [items, totalItems] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
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

async function getUserAdmin(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
      businesses: true,
      jobApplications: true,
      events: true,
      eventRegistrations: true,
    },
  });

  if (!user) {
    const error = new Error('User not found');
    error.code = 404;
    error.errorCode = 'USER_NOT_FOUND';
    throw error;
  }

  return user;
}

async function updateUserStatusAdmin({ userId, isActive }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error = new Error('User not found');
    error.code = 404;
    error.errorCode = 'USER_NOT_FOUND';
    throw error;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      isActive,
    },
  });

  return updated;
}

// ---------- BUSINESSES ----------

async function listBusinessesAdmin({ page = 1, limit = 10, q, status }) {
  const take = Number(limit) || 10;
  const skip = (Number(page) - 1) * take;

  const where = {};

  if (status) {
    where.status = status;
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { websiteUrl: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [items, totalItems] = await Promise.all([
    prisma.business.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: true,
      },
    }),
    prisma.business.count({ where }),
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

async function updateBusinessStatusAdmin({ businessId, status }) {
  const allowed = ['PENDING', 'APPROVED', 'REJECTED'];

  if (!allowed.includes(status)) {
    const error = new Error('Invalid status value');
    error.code = 422;
    error.errorCode = 'VALIDATION_ERROR';
    error.details = [
      {
        field: 'status',
        message: 'Status must be one of PENDING, APPROVED, REJECTED',
      },
    ];
    throw error;
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });

  if (!business) {
    const error = new Error('Business not found');
    error.code = 404;
    error.errorCode = 'BUSINESS_NOT_FOUND';
    throw error;
  }

  const updated = await prisma.business.update({
    where: { id: businessId },
    data: {
      status,
    },
  });

  return updated;
}

// ---------- JOBS ----------

async function listJobsAdmin({ page = 1, limit = 10, q, status, businessId }) {
  const take = Number(limit) || 10;
  const skip = (Number(page) - 1) * take;

  const where = {};

  if (status) {
    where.jobStatus = {
      code: status,
    };
  }

  if (businessId) {
    where.businessId = businessId;
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [items, totalItems] = await Promise.all([
    prisma.jobPost.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        business: true,
        jobStatus: true,
      },
    }),
    prisma.jobPost.count({ where }),
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

async function adminChangeJobStatus({ jobId, statusCode }) {
  const allowedStatuses = ['ACTIVE', 'SUSPENDED', 'ARCHIVED'];

  if (!allowedStatuses.includes(statusCode)) {
    const error = new Error('Invalid status value');
    error.code = 422;
    error.errorCode = 'VALIDATION_ERROR';
    error.details = [
      {
        field: 'status',
        message: 'Status must be one of ACTIVE, SUSPENDED, ARCHIVED',
      },
    ];
    throw error;
  }

  const job = await prisma.jobPost.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    const error = new Error('Job not found');
    error.code = 404;
    error.errorCode = 'JOB_NOT_FOUND';
    throw error;
  }

  const statusRecord = await prisma.jobStatus.findUnique({
    where: { code: statusCode },
  });

  if (!statusRecord) {
    const error = new Error('JobStatus not configured');
    error.code = 500;
    error.errorCode = 'INTERNAL_SERVER_ERROR';
    throw error;
  }

  const updated = await prisma.jobPost.update({
    where: { id: jobId },
    data: {
      jobStatusId: statusRecord.id,
    },
  });

  return updated;
}

// ---------- ARTICLES ----------

async function listArticlesAdmin({ page = 1, limit = 10, q, status, authorId }) {
  const take = Number(limit) || 10;
  const skip = (Number(page) - 1) * take;

  const where = {};

  if (status) {
    where.status = status;
  }

  if (authorId) {
    where.authorId = authorId;
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { content: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [items, totalItems] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        author: true,
      },
    }),
    prisma.article.count({ where }),
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

async function adminChangeArticleStatus({ articleId, status }) {
  const allowed = ['PUBLISHED', 'SUSPENDED', 'ARCHIVED'];

  if (!allowed.includes(status)) {
    const error = new Error('Invalid status value');
    error.code = 422;
    error.errorCode = 'VALIDATION_ERROR';
    error.details = [
      {
        field: 'status',
        message: 'Status must be one of PUBLISHED, SUSPENDED, ARCHIVED',
      },
    ];
    throw error;
  }

  const existing = await prisma.article.findUnique({
    where: { id: articleId },
  });

  if (!existing) {
    const error = new Error('Article not found');
    error.code = 404;
    error.errorCode = 'ARTICLE_NOT_FOUND';
    throw error;
  }

  const data = { status };

  if (status === 'PUBLISHED' && !existing.publishedAt) {
    data.publishedAt = new Date();
  }

  const updated = await prisma.article.update({
    where: { id: articleId },
    data,
  });

  return updated;
}

// ---------- EVENTS ----------

async function listEventsAdmin({ page = 1, limit = 10, q, status, creatorId }) {
  const take = Number(limit) || 10;
  const skip = (Number(page) - 1) * take;

  const where = {};

  if (status) {
    where.status = status;
  }

  if (creatorId) {
    where.creatorId = creatorId;
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { location: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [items, totalItems] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
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

async function adminChangeEventStatus({ eventId, status }) {
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

  const existing = await prisma.event.findUnique({
    where: { id: eventId },
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

// ---------- PAYMENTS ----------

async function listPaymentsAdmin({
  page = 1,
  limit = 10,
  status,
  paymentType,
  userId,
  eventId,
  businessId,
  jobPostId,
}) {
  const take = Number(limit) || 10;
  const skip = (Number(page) - 1) * take;

  const where = {};

  if (status) {
    where.status = status;
  }

  if (paymentType) {
    where.paymentType = paymentType;
  }

  if (userId) {
    where.userId = userId;
  }

  if (eventId) {
    where.eventId = eventId;
  }

  if (businessId) {
    where.businessId = businessId;
  }

  if (jobPostId) {
    where.jobPostId = jobPostId;
  }

  const [items, totalItems] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        verifiedBy: true,
        event: true,
        eventRegistration: true,
        business: true,
        jobPost: true,
      },
    }),
    prisma.payment.count({ where }),
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

async function getPaymentAdmin(id) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      user: true,
      verifiedBy: true,
      event: true,
      eventRegistration: true,
      business: true,
      jobPost: true,
    },
  });

  if (!payment) {
    const error = new Error('Payment not found');
    error.code = 404;
    error.errorCode = 'PAYMENT_NOT_FOUND';
    throw error;
  }

  return payment;
}

module.exports = {
  // users
  listUsers,
  getUserAdmin,
  updateUserStatusAdmin,
  // businesses
  listBusinessesAdmin,
  updateBusinessStatusAdmin,
  // jobs
  listJobsAdmin,
  adminChangeJobStatus,
  // articles
  listArticlesAdmin,
  adminChangeArticleStatus,
  // events
  listEventsAdmin,
  adminChangeEventStatus,
  // payments
  listPaymentsAdmin,
  getPaymentAdmin,
};
