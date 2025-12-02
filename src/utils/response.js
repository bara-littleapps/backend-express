const errorMessages = require('../constants/errorMessages');

function successResponse(res, { code = 200, message = 'Success', data = null, meta = null }) {
  return res.status(code).json({
    success: true,
    code,
    message,
    data,
    meta,
  });
}

function errorResponse(res, { code = 500, message, errorCode = 'INTERNAL_SERVER_ERROR', details = null }) {
  const finalMessage = message || errorMessages[errorCode] || 'Internal server error';

  return res.status(code).json({
    success: false,
    code,
    message: finalMessage,
    error: {
      code: errorCode,
      details,
    },
  });
}

module.exports = {
  successResponse,
  errorResponse,
};
