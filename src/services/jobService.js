// src/services/jobService.js

const prisma = require('../prisma/client');

async function listJobs({ page = 1, limit = 10, q, location, employmentType }) {
  const take = Number(limit) || 10;
  const skip = (Number(page) - 1) * take;

  const where = {
    status: 'ACTIVE',
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (location) {
    where.locationText = { contains: location, mode: 'insensitive' };
  }

  if (employmentType) {
    where.employmentType = employmentType;
  }

  const [items, totalItems] = await Promise.all([
    prisma.jobPost.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        business: true,
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

// list jobs milik business yang dimiliki user login
async function listMyJobs(userId, { page = 1, limit = 10 }) {
  const take = Number(limit) || 10;
  const skip = (Number(page) - 1) * take;

  const where = {
    business: {
      ownerId: userId,
    },
  };

  const [items, totalItems] = await Promise.all([
    prisma.jobPost.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        business: true,
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

async function createJob({ userId, businessId, payload }) {
  const business = await prisma.business.findFirst({
    where: {
      id: businessId,
      ownerId: userId,
    },
  });

  if (!business) {
    const error = new Error('Business not found or not owned by user');
    error.code = 404;
    error.errorCode = 'BUSINESS_NOT_FOUND';
    throw error;
  }

  if (business.status !== 'APPROVED') {
    const error = new Error('Business is not approved');
    error.code = 403;
    error.errorCode = 'BUSINESS_NOT_APPROVED';
    throw error;
  }

  const { title } = payload;
  const slugBase = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const slug = `${slugBase}-${Date.now()}`;

  const job = await prisma.jobPost.create({
    data: {
      businessId: business.id,
      title,
      slug,
      locationType: payload.locationType,
      locationText: payload.locationText,
      employmentType: payload.employmentType,
      salaryMin: payload.salaryMin,
      salaryMax: payload.salaryMax,
      currency: payload.currency,
      description: payload.description,
      requirements: payload.requirements,
      applicationOptionPlatform: payload.applicationOptionPlatform,
      applicationOptionExternal: payload.applicationOptionExternal,
      externalApplyUrl: payload.externalApplyUrl,
      externalApplyEmail: payload.externalApplyEmail,
      status: 'ACTIVE',
      publishedAt: new Date(),
      expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
    },
  });

  return job;
}

async function getJobById(id) {
  const job = await prisma.jobPost.findUnique({
    where: { id },
    include: {
      business: true,
    },
  });

  if (!job) {
    const error = new Error('Job not found');
    error.code = 404;
    error.errorCode = 'JOB_NOT_FOUND';
    throw error;
  }

  return job;
}

async function getJobBySlug(slug) {
  const job = await prisma.jobPost.findFirst({
    where: { slug },
    include: {
      business: true,
    },
  });

  if (!job) {
    const error = new Error('Job not found');
    error.code = 404;
    error.errorCode = 'JOB_NOT_FOUND';
    throw error;
  }

  return job;
}

// update job milik business owner (simple update)
async function updateJob({ userId, jobId, payload }) {
  const existing = await prisma.jobPost.findFirst({
    where: {
      id: jobId,
      business: {
        ownerId: userId,
      },
    },
  });

  if (!existing) {
    const error = new Error('Job not found');
    error.code = 404;
    error.errorCode = 'JOB_NOT_FOUND';
    throw error;
  }

  const job = await prisma.jobPost.update({
    where: { id: jobId },
    data: {
      title: payload.title ?? existing.title,
      locationType: payload.locationType ?? existing.locationType,
      locationText: payload.locationText ?? existing.locationText,
      employmentType: payload.employmentType ?? existing.employmentType,
      salaryMin: payload.salaryMin ?? existing.salaryMin,
      salaryMax: payload.salaryMax ?? existing.salaryMax,
      currency: payload.currency ?? existing.currency,
      description: payload.description ?? existing.description,
      requirements: payload.requirements ?? existing.requirements,
      applicationOptionPlatform:
        typeof payload.applicationOptionPlatform === 'boolean'
          ? payload.applicationOptionPlatform
          : existing.applicationOptionPlatform,
      applicationOptionExternal:
        typeof payload.applicationOptionExternal === 'boolean'
          ? payload.applicationOptionExternal
          : existing.applicationOptionExternal,
      externalApplyUrl: payload.externalApplyUrl ?? existing.externalApplyUrl,
      externalApplyEmail:
        payload.externalApplyEmail ?? existing.externalApplyEmail,
      expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : existing.expiresAt,
    },
  });

  return job;
}

// ubah status job: ACTIVE / SUSPENDED / ARCHIVED
async function changeJobStatus({ userId, jobId, status }) {
  const allowedStatuses = ['ACTIVE', 'SUSPENDED', 'ARCHIVED'];

  if (!allowedStatuses.includes(status)) {
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

  const job = await prisma.jobPost.findFirst({
    where: {
      id: jobId,
      business: {
        ownerId: userId,
      },
    },
  });

  if (!job) {
    const error = new Error('Job not found');
    error.code = 404;
    error.errorCode = 'JOB_NOT_FOUND';
    throw error;
  }

  const updated = await prisma.jobPost.update({
    where: { id: jobId },
    data: {
      status,
    },
  });

  return updated;
}

module.exports = {
  listJobs,
  listMyJobs,
  createJob,
  getJobById,
  getJobBySlug,
  updateJob,
  changeJobStatus,
};
