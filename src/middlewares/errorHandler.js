// src/middlewares/errorHandler.js

const { errorResponse } = require('../utils/response');

function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  return errorResponse(res, {
    code: 500,
    errorCode: 'INTERNAL_SERVER_ERROR',
    details: process.env.NODE_ENV === 'development' ? err.message : null,
  });
}

module.exports = errorHandler;
