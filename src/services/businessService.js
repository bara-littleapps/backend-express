const prisma = require('../prisma/client');

async function listMyBusinesses(userId) {
  const businesses = await prisma.business.findMany({
    where: {
      ownerId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return businesses;
}

async function createBusiness({ ownerId, name, logoUrl, websiteUrl, description }) {
  const business = await prisma.business.create({
    data: {
      ownerId,
      name,
      logoUrl,
      websiteUrl,
      description,
      status: 'PENDING', // default waiting approval
    },
  });

  return business;
}

async function getBusinessById(id, userId) {
  // Only owner can access
  const business = await prisma.business.findFirst({
    where: {
      id,
      ownerId: userId,
    },
  });

  if (!business) {
    const error = new Error('Business not found');
    error.code = 404;
    error.errorCode = 'BUSINESS_NOT_FOUND';
    throw error;
  }

  return business;
}

module.exports = {
  listMyBusinesses,
  createBusiness,
  getBusinessById,
};
