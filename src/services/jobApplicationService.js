// src/services/jobApplicationService.js

const prisma = require('../prisma/client');

async function createJobApplication({ userId, jobPostId, payload }) {
  const job = await prisma.jobPost.findUnique({
    where: { id: jobPostId },
    include: {
      business: true,
    },
  });

  if (!job || job.status !== 'ACTIVE') {
    const error = new Error('Job not found');
    error.code = 404;
    error.errorCode = 'JOB_NOT_FOUND';
    throw error;
  }

  const { applicationMethod } = payload;

  if (!applicationMethod) {
    const error = new Error('Application method is required');
    error.code = 422;
    error.errorCode = 'VALIDATION_ERROR';
    error.details = [{ field: 'applicationMethod', message: 'Application method is required' }];
    throw error;
  }

  // Basic validation based on method
  if (applicationMethod === 'PLATFORM') {
    if (!payload.cvUrl || !payload.portfolioUrl) {
      const error = new Error('Missing required fields for platform application');
      error.code = 422;
      error.errorCode = 'VALIDATION_ERROR';
      error.details = [
        { field: 'cvUrl', message: !payload.cvUrl ? 'CV URL is required' : null },
        { field: 'portfolioUrl', message: !payload.portfolioUrl ? 'Portfolio URL is required' : null },
      ].filter((d) => d.message);
      throw error;
    }
  }

  if (applicationMethod === 'EXTERNAL') {
    if (!payload.externalTarget || !payload.externalDestination) {
      const error = new Error('Missing external target or destination');
      error.code = 422;
      error.errorCode = 'VALIDATION_ERROR';
      error.details = [
        { field: 'externalTarget', message: !payload.externalTarget ? 'External target is required' : null },
        {
          field: 'externalDestination',
          message: !payload.externalDestination ? 'External destination is required' : null,
        },
      ].filter((d) => d.message);
      throw error;
    }
  }

  const app = await prisma.jobApplication.create({
    data: {
      jobPostId: job.id,
      userId,
      applicationMethod,
      cvUrl: payload.cvUrl,
      resumeUrl: payload.resumeUrl,
      portfolioUrl: payload.portfolioUrl,
      coverLetter: payload.coverLetter,
      externalTarget: payload.externalTarget,
      externalDestination: payload.externalDestination,
      externalClickedAt: applicationMethod === 'EXTERNAL' ? new Date() : null,
      status: applicationMethod === 'EXTERNAL' ? 'CLICKED' : 'SUBMITTED',
    },
  });

  return app;
}

async function listApplicationsForJob({ jobPostId, ownerId }) {
  const job = await prisma.jobPost.findFirst({
    where: {
      id: jobPostId,
      business: {
        ownerId,
      },
    },
  });

  if (!job) {
    const error = new Error('Job not found');
    error.code = 404;
    error.errorCode = 'JOB_NOT_FOUND';
    throw error;
  }

  const apps = await prisma.jobApplication.findMany({
    where: {
      jobPostId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: true,
    },
  });

  return apps;
}

async function getJobApplicationById(id, userId) {
  const app = await prisma.jobApplication.findUnique({
    where: { id },
    include: {
      jobPost: {
        include: {
          business: true,
        },
      },
      user: true,
    },
  });

  if (!app) {
    const error = new Error('Job application not found');
    error.code = 404;
    error.errorCode = 'JOB_APPLICATION_NOT_FOUND';
    throw error;
  }

  const isApplicant = app.userId === userId;
  const isBusinessOwner = app.jobPost.business.ownerId === userId;

  if (!isApplicant && !isBusinessOwner) {
    const error = new Error('Forbidden');
    error.code = 403;
    error.errorCode = 'FORBIDDEN';
    throw error;
  }

  return app;
}

module.exports = {
  createJobApplication,
  listApplicationsForJob,
  getJobApplicationById,
};
