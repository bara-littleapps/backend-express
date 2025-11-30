// src/controllers/jobApplicationController.js

const { successResponse, errorResponse } = require('../utils/response');
const {
  createJobApplication,
  listApplicationsForJob,
  getJobApplicationById,
} = require('../services/jobApplicationService');

async function createJobApplicationHandler(req, res, next) {
  try {
    const { jobId } = req.params;

    const app = await createJobApplication({
      userId: req.user.id,
      jobPostId: jobId,
      payload: req.body,
    });

    return successResponse(res, {
      code: 201,
      message: 'Job application created successfully',
      data: app,
    });
  } catch (err) {
    if (err.code && err.errorCode) {
      return errorResponse(res, {
        code: err.code,
        errorCode: err.errorCode,
        details: err.details || null,
      });
    }
    return next(err);
  }
}

async function getJobApplicationsForJob(req, res, next) {
  try {
    const { jobId } = req.params;

    const apps = await listApplicationsForJob({
      jobPostId: jobId,
      ownerId: req.user.id,
    });

    return successResponse(res, {
      code: 200,
      message: 'Job applications fetched successfully',
      data: apps,
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

async function getJobApplicationDetail(req, res, next) {
  try {
    const { id } = req.params;

    const app = await getJobApplicationById(id, req.user.id);

    return successResponse(res, {
      code: 200,
      message: 'Job application fetched successfully',
      data: app,
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
  createJobApplicationHandler,
  getJobApplicationsForJob,
  getJobApplicationDetail,
};
