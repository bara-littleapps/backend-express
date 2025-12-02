const prisma = require('../prisma/client');

async function applyContributor(userId, payload) {
  const existing = await prisma.contributorProfile.findUnique({
    where: { userId },
  });

  if (existing) {
    const error = new Error('Contributor profile already exists');
    error.code = 409;
    error.errorCode = 'CONFLICT';
    throw error;
  }

  const contributor = await prisma.contributorProfile.create({
    data: {
      userId,
      bio: payload.bio || null,
      socialLinks: payload.socialLinks || null,
      status: 'ACTIVE', // article auto publish
    },
  });

  return contributor;
}

async function getMyContributorProfile(userId) {
  const contributor = await prisma.contributorProfile.findUnique({
    where: { userId },
  });

  if (!contributor) {
    const error = new Error('Contributor profile not found');
    error.code = 404;
    error.errorCode = 'CONTRIBUTOR_PROFILE_NOT_FOUND';
    throw error;
  }

  return contributor;
}

async function ensureActiveContributor(userId) {
  const contributor = await prisma.contributorProfile.findUnique({
    where: { userId },
  });

  if (!contributor) {
    const error = new Error('Contributor profile not found');
    error.code = 404;
    error.errorCode = 'CONTRIBUTOR_PROFILE_NOT_FOUND';
    throw error;
  }

  if (contributor.status !== 'ACTIVE') {
    const error = new Error('Contributor is not active');
    error.code = 403;
    error.errorCode = 'CONTRIBUTOR_NOT_ACTIVE';
    throw error;
  }

  return contributor;
}

module.exports = {
  applyContributor,
  getMyContributorProfile,
  ensureActiveContributor,
};
