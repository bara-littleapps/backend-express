// src/controllers/adminController.js

const { successResponse, errorResponse } = require('../utils/response');
const {
  listUsers,
  getUserAdmin,
  updateUserStatusAdmin,
  listBusinessesAdmin,
  updateBusinessStatusAdmin,
  listJobsAdmin,
  adminChangeJobStatus,
  listArticlesAdmin,
  adminChangeArticleStatus,
  listEventsAdmin,
  adminChangeEventStatus,
  listPaymentsAdmin,
  getPaymentAdmin,
} = require('../services/adminService');

// ---------- USERS ----------

async function getAdminUsers(req, res, next) {
  try {
    const { page, limit, q, isActive } = req.query;

    const result = await listUsers({ page, limit, q, isActive });

    return successResponse(res, {
      code: 200,
      message: 'Users fetched successfully',
      data: result.items,
      meta: result.meta,
    });
  } catch (err) {
    return next(err);
  }
}

async function getAdminUserDetail(req, res, next) {
  try {
    const { id } = req.params;

    const user = await getUserAdmin(id);

    return successResponse(res, {
      code: 200,
      message: 'User fetched successfully',
      data: user,
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

async function updateAdminUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive === 'undefined') {
      return errorResponse(res, {
        code: 422,
        errorCode: 'VALIDATION_ERROR',
        details: [
          { field: 'isActive', message: 'isActive is required' },
        ],
      });
    }

    const updated = await updateUserStatusAdmin({
      userId: id,
      isActive: Boolean(isActive),
    });

    return successResponse(res, {
      code: 200,
      message: 'User status updated successfully',
      data: updated,
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

// ---------- BUSINESSES ----------

async function getAdminBusinesses(req, res, next) {
  try {
    const { page, limit, q, status } = req.query;

    const result = await listBusinessesAdmin({ page, limit, q, status });

    return successResponse(res, {
      code: 200,
      message: 'Businesses fetched successfully',
      data: result.items,
      meta: result.meta,
    });
  } catch (err) {
    return next(err);
  }
}

async function updateAdminBusinessStatus(req, res, next) {
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

    const updated = await updateBusinessStatusAdmin({
      businessId: id,
      status,
    });

    return successResponse(res, {
      code: 200,
      message: 'Business status updated successfully',
      data: updated,
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

// ---------- JOBS ----------

async function getAdminJobs(req, res, next) {
  try {
    const { page, limit, q, status, businessId } = req.query;

    const result = await listJobsAdmin({ page, limit, q, status, businessId });

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

async function updateAdminJobStatus(req, res, next) {
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

    const updated = await adminChangeJobStatus({
      jobId: id,
      statusCode: status,
    });

    return successResponse(res, {
      code: 200,
      message: 'Job status updated successfully',
      data: updated,
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

// ---------- ARTICLES ----------

async function getAdminArticles(req, res, next) {
  try {
    const { page, limit, q, status, authorId } = req.query;

    const result = await listArticlesAdmin({
      page,
      limit,
      q,
      status,
      authorId,
    });

    return successResponse(res, {
      code: 200,
      message: 'Articles fetched successfully',
      data: result.items,
      meta: result.meta,
    });
  } catch (err) {
    return next(err);
  }
}

async function updateAdminArticleStatus(req, res, next) {
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

    const updated = await adminChangeArticleStatus({
      articleId: id,
      status,
    });

    return successResponse(res, {
      code: 200,
      message: 'Article status updated successfully',
      data: updated,
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

// ---------- EVENTS ----------

async function getAdminEvents(req, res, next) {
  try {
    const { page, limit, q, status, creatorId } = req.query;

    const result = await listEventsAdmin({
      page,
      limit,
      q,
      status,
      creatorId,
    });

    return successResponse(res, {
      code: 200,
      message: 'Events fetched successfully',
      data: result.items,
      meta: result.meta,
    });
  } catch (err) {
    return next(err);
  }
}

async function updateAdminEventStatus(req, res, next) {
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

    const updated = await adminChangeEventStatus({
      eventId: id,
      status,
    });

    return successResponse(res, {
      code: 200,
      message: 'Event status updated successfully',
      data: updated,
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

// ---------- PAYMENTS ----------

async function getAdminPayments(req, res, next) {
  try {
    const {
      page,
      limit,
      status,
      paymentType,
      userId,
      eventId,
      businessId,
      jobPostId,
    } = req.query;

    const result = await listPaymentsAdmin({
      page,
      limit,
      status,
      paymentType,
      userId,
      eventId,
      businessId,
      jobPostId,
    });

    return successResponse(res, {
      code: 200,
      message: 'Payments fetched successfully',
      data: result.items,
      meta: result.meta,
    });
  } catch (err) {
    return next(err);
  }
}

async function getAdminPaymentDetail(req, res, next) {
  try {
    const { id } = req.params;

    const payment = await getPaymentAdmin(id);

    return successResponse(res, {
      code: 200,
      message: 'Payment fetched successfully',
      data: payment,
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
  getAdminUsers,
  getAdminUserDetail,
  updateAdminUserStatus,
  getAdminBusinesses,
  updateAdminBusinessStatus,
  getAdminJobs,
  updateAdminJobStatus,
  getAdminArticles,
  updateAdminArticleStatus,
  getAdminEvents,
  updateAdminEventStatus,
  getAdminPayments,
  getAdminPaymentDetail,
};
