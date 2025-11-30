// src/controllers/contributorController.js

const { successResponse, errorResponse } = require('../utils/response');
const {
  applyContributor,
  getMyContributorProfile,
} = require('../services/contributorService');

async function applyContributorHandler(req, res, next) {
  try {
    const { bio, socialLinks } = req.body;

    const contributor = await applyContributor(req.user.id, {
      bio,
      socialLinks,
    });

    return successResponse(res, {
      code: 201,
      message: 'Contributor profile created successfully',
      data: contributor,
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

async function getMyContributorProfileHandler(req, res, next) {
  try {
    const contributor = await getMyContributorProfile(req.user.id);

    return successResponse(res, {
      code: 200,
      message: 'Contributor profile fetched successfully',
      data: contributor,
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
  applyContributorHandler,
  getMyContributorProfileHandler,
};
