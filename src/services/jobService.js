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

module.exports = {
  listJobs,
  createJob,
  getJobById,
};
