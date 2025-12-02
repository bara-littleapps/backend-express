const { successResponse, errorResponse } = require('../utils/response');
const {
  attachPaymentProof,
  verifyEventPayment,
  listMyPayments,
  listEventPaymentsForCreator,
} = require('../services/paymentService');

async function attachPaymentProofHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { referenceCode, screenshotUrl } = req.body;

    if (!referenceCode && !screenshotUrl) {
      return errorResponse(res, {
        code: 422,
        errorCode: 'VALIDATION_ERROR',
        details: [
          {
            field: 'referenceCode',
            message: 'Reference code or screenshot is required',
          },
        ],
      });
    }

    const payment = await attachPaymentProof({
      paymentId: id,
      userId: req.user.id,
      payload: { referenceCode, screenshotUrl },
    });

    return successResponse(res, {
      code: 200,
      message: 'Payment proof attached successfully',
      data: payment,
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

async function verifyEventPaymentHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, {
        code: 422,
        errorCode: 'VALIDATION_ERROR',
        details: [{ field: 'status', message: 'Status is required' }],
      });
    }

    const payment = await verifyEventPayment({
      paymentId: id,
      adminId: req.user.id,
      status,
    });

    return successResponse(res, {
      code: 200,
      message: 'Payment status updated successfully',
      data: payment,
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

async function getMyPaymentsHandler(req, res, next) {
  try {
    const { page, limit } = req.query;

    const result = await listMyPayments(req.user.id, { page, limit });

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

async function getEventPaymentsForCreatorHandler(req, res, next) {
  try {
    const { eventId } = req.params;

    const payments = await listEventPaymentsForCreator({
      eventId,
      creatorId: req.user.id,
    });

    return successResponse(res, {
      code: 200,
      message: 'Event payments fetched successfully',
      data: payments,
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
  attachPaymentProofHandler,
  verifyEventPaymentHandler,
  getMyPaymentsHandler,
  getEventPaymentsForCreatorHandler,
};
