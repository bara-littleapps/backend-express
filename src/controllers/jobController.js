// src/controllers/jobController.js

const { successResponse, errorResponse } = require('../utils/response');
const {
  listJobs,
  listMyJobs,
  createJob,
  getJobById,
  getJobBySlug,
  updateJob,
  changeJobStatus,
} = require('../services/jobService');

async function getJobs(req, res, next) {
  try {
    const { page, limit, q, location, employmentType } = req.query;

    const result = await listJobs({ page, limit, q, location, employmentType });

    return successResponse(res, {
      code: 200,
      message: 'Jobs fetched successfully',
      data: result.items,
      meta: result.meta,
    });
  } catch (err) {
    return next(err);
  }
}

async function getMyJobsHandler(req, res, next) {
  try {
    const { page, limit } = req.query;

    const result = await listMyJobs(req.user.id, { page, limit });

    return successResponse(res, {
      code: 200,
      message: 'Jobs fetched successfully',
      data: result.items,
      meta: result.meta,
    });
  } catch (err) {
    return next(err);
  }
}

async function createJobHandler(req, res, next) {
  try {
    const {
      businessId,
      title,
      locationType,
      employmentType,
      description,
    } = req.body;

    const missingFields = [];
    if (!businessId) missingFields.push({ field: 'businessId', message: 'Business ID is required' });
    if (!title) missingFields.push({ field: 'title', message: 'Title is required' });
    if (!locationType) missingFields.push({ field: 'locationType', message: 'Location type is required' });
    if (!employmentType) missingFields.push({ field: 'employmentType', message: 'Employment type is required' });
    if (!description) missingFields.push({ field: 'description', message: 'Description is required' });

    if (missingFields.length > 0) {
      return errorResponse(res, {
        code: 422,
        errorCode: 'VALIDATION_ERROR',
        details: missingFields,
      });
    }

    const job = await createJob({
      userId: req.user.id,
      businessId,
      payload: req.body,
    });

    return successResponse(res, {
      code: 201,
      message: 'Job created successfully',
      data: job,
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

async function getJobDetail(req, res, next) {
  try {
    const { idOrSlug } = req.params;

    // kalau bentuknya UUID, pakai findById, kalau bukan, try slug
    let job;
    if (idOrSlug.includes('-') && idOrSlug.length > 20) {
      job = await getJobById(idOrSlug);
    } else {
      try {
        job = await getJobBySlug(idOrSlug);
      } catch (e) {
        job = await getJobById(idOrSlug);
      }
    }

    return successResponse(res, {
      code: 200,
      message: 'Job fetched successfully',
      data: job,
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

async function updateJobHandler(req, res, next) {
  try {
    const { id } = req.params;

    const job = await updateJob({
      userId: req.user.id,
      jobId: id,
      payload: req.body,
    });

    return successResponse(res, {
      code: 200,
      message: 'Job updated successfully',
      data: job,
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

async function changeJobStatusHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, {
        code: 422,
        errorCode: 'VALIDATION_ERROR',
        details: [
          { field: 'status', message: 'Status is required' },
        ],
      });
    }

    const job = await changeJobStatus({
      userId: req.user.id,
      jobId: id,
      status,
    });

    return successResponse(res, {
      code: 200,
      message: 'Job status updated successfully',
      data: job,
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

module.exports = {
  getJobs,
  getMyJobsHandler,
  createJobHandler,
  getJobDetail,
  updateJobHandler,
  changeJobStatusHandler,
};
