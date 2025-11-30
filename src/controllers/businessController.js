// src/controllers/businessController.js

const { successResponse, errorResponse } = require('../utils/response');
const {
  listMyBusinesses,
  createBusiness,
  getBusinessById,
} = require('../services/businessService');

async function getMyBusinesses(req, res, next) {
  try {
    const businesses = await listMyBusinesses(req.user.id);

    return successResponse(res, {
      code: 200,
      message: 'Businesses fetched successfully',
      data: businesses,
    });
  } catch (err) {
    return next(err);
  }
}

async function createBusinessHandler(req, res, next) {
  try {
    const { name, logoUrl, websiteUrl, description } = req.body;

    const missingFields = [];
    if (!name) missingFields.push({ field: 'name', message: 'Name is required' });

    if (missingFields.length > 0) {
      return errorResponse(res, {
        code: 422,
        errorCode: 'VALIDATION_ERROR',
        details: missingFields,
      });
    }

    const business = await createBusiness({
      ownerId: req.user.id,
      name,
      logoUrl,
      websiteUrl,
      description,
    });

    return successResponse(res, {
      code: 201,
      message: 'Business created successfully',
      data: business,
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

async function getBusinessDetail(req, res, next) {
  try {
    const { id } = req.params;

    const business = await getBusinessById(id, req.user.id);

    return successResponse(res, {
      code: 200,
      message: 'Business fetched successfully',
      data: business,
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

module.exports = {
  getMyBusinesses,
  createBusinessHandler,
  getBusinessDetail,
};
