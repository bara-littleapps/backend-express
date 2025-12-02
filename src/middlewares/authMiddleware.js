const { verifyAccessToken } = require('../config/jwtConfig');
const { errorResponse } = require('../utils/response');

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return errorResponse(res, {
      code: 401,
      errorCode: 'UNAUTHORIZED',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      roles: decoded.roles || [],
    };
    return next();
  } catch (err) {
    return errorResponse(res, {
      code: 401,
      errorCode: 'UNAUTHORIZED',
    });
  }
}

function requireRole(roleName) {
  return function (req, res, next) {
    if (!req.user || !Array.isArray(req.user.roles)) {
      return errorResponse(res, {
        code: 403,
        errorCode: 'FORBIDDEN',
      });
    }

    const hasRole = req.user.roles.includes(roleName);
    if (!hasRole) {
      return errorResponse(res, {
        code: 403,
        errorCode: 'FORBIDDEN',
      });
    }

    return next();
  };
}

//Auth optional middleware
function authOptional(req, res, next) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      roles: decoded.roles || [],
    };
  } catch (err) {
    req.user = null;
  }

  return next();
}

module.exports = {
  authRequired,
  requireRole,
  authOptional,
};
