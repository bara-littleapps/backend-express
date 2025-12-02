const prisma = require('../prisma/client');

async function createJobApplication({ userId, jobPostId, payload }) {
  const job = await prisma.jobPost.findUnique({
    where: { id: jobPostId },
    include: {
      business: true,
      jobStatus: true,
    },
  });

  if (!job || job.jobStatus.code !== 'ACTIVE') {
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
    error.details = [
      { field: 'applicationMethod', message: 'Application method is required' },
    ];
    throw error;
  }
  if (applicationMethod === 'PLATFORM' && !job.applicationOptionPlatform) {
    const error = new Error('Platform applications are not allowed for this job');
    error.code = 400;
    error.errorCode = 'VALIDATION_ERROR';
    error.details = [
      { field: 'applicationMethod', message: 'PLATFORM is not allowed for this job' },
    ];
    throw error;
  }
  if (applicationMethod === 'EXTERNAL' && !job.applicationOptionExternal) {
    const error = new Error('External applications are not allowed for this job');
    error.code = 400;
    error.errorCode = 'VALIDATION_ERROR';
    error.details = [
      { field: 'applicationMethod', message: 'EXTERNAL is not allowed for this job' },
    ];
    throw error;
  }

  let applicantName = payload.applicantName;
  let applicantEmail = payload.applicantEmail;
  let applicantPhone = payload.applicantPhone;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const error = new Error('User not found');
      error.code = 404;
      error.errorCode = 'USER_NOT_FOUND';
      throw error;
    }

    applicantName = applicantName || user.name;
    applicantEmail = applicantEmail || user.email;
    applicantPhone = applicantPhone || user.phone || null;
  } else {
    const details = [];
    if (!applicantName) {
      details.push({
        field: 'applicantName',
        message: 'Applicant name is required for guest user',
      });
    }
    if (!applicantEmail) {
      details.push({
        field: 'applicantEmail',
        message: 'Applicant email is required for guest user',
      });
    }

    if (details.length > 0) {
      const error = new Error('Missing applicant info');
      error.code = 422;
      error.errorCode = 'VALIDATION_ERROR';
      error.details = details;
      throw error;
    }
  }

  if (applicationMethod === 'PLATFORM') {
    const details = [];
    if (!payload.cvUrl) {
      details.push({ field: 'cvUrl', message: 'CV URL is required for platform application' });
    }
    if (!payload.portfolioUrl) {
      details.push({
        field: 'portfolioUrl',
        message: 'Portfolio URL is required for platform application',
      });
    }

    if (details.length > 0) {
      const error = new Error('Missing required fields for platform application');
      error.code = 422;
      error.errorCode = 'VALIDATION_ERROR';
      error.details = details;
      throw error;
    }
  }

  if (applicationMethod === 'EXTERNAL') {
    const details = [];
    if (!payload.externalTarget) {
      details.push({ field: 'externalTarget', message: 'External target is required' });
    }
    if (!payload.externalDestination) {
      details.push({
        field: 'externalDestination',
        message: 'External destination is required',
      });
    }

    if (details.length > 0) {
      const error = new Error('Missing external target or destination');
      error.code = 422;
      error.errorCode = 'VALIDATION_ERROR';
      error.details = details;
      throw error;
    }
  }

  const app = await prisma.jobApplication.create({
    data: {
      jobPostId: job.id,
      userId: userId || null,
      applicationMethod,
      applicantName,
      applicantEmail,
      applicantPhone,
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

// Job stats
async function getJobStatsForOwner({ jobPostId, ownerId }) {
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

  const grouped = await prisma.jobApplication.groupBy({
    by: ['status'],
    where: {
      jobPostId,
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

  const byMethod = await prisma.jobApplication.groupBy({
    by: ['applicationMethod'],
    where: {
      jobPostId,
    },
    _count: {
      _all: true,
    },
  });

  const byMethodMap = byMethod.reduce((acc, item) => {
    acc[item.applicationMethod] = item._count._all;
    return acc;
  }, {});

  return {
    jobId: jobPostId,
    totalApplications: total,
    byStatus,
    byMethod: byMethodMap,
  };
}

async function listMyApplications(userId, { page = 1, limit = 10 }) {
  const take = Number(limit) || 10;
  const skip = (Number(page) - 1) * take;

  const where = {
    userId,
  };

  const [items, totalItems] = await Promise.all([
    prisma.jobApplication.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        jobPost: {
          include: {
            business: true,
          },
        },
      },
    }),
    prisma.jobApplication.count({ where }),
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
  getJobStatsForOwner,
  listMyApplications,
  getJobApplicationById,
};
