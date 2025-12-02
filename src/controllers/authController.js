const { successResponse, errorResponse } = require('../utils/response');
const { registerUser, loginUser, refreshToken } = require('../services/authService');

async function register(req, res, next) {
  try {
    const { name, username, email, password } = req.body;

    const missingFields = [];
    if (!name) missingFields.push({ field: 'name', message: 'Name is required' });
    if (!username) missingFields.push({ field: 'username', message: 'Username is required' });
    if (!email) missingFields.push({ field: 'email', message: 'Email is required' });
    if (!password) missingFields.push({ field: 'password', message: 'Password is required' });

    if (missingFields.length > 0) {
      return errorResponse(res, {
        code: 422,
        errorCode: 'VALIDATION_ERROR',
        details: missingFields,
      });
    }

    const user = await registerUser({ name, username, email, password });

    return successResponse(res, {
      code: 201,
      message: 'User registered successfully',
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
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

async function login(req, res, next) {
  try {
    const { emailOrUsername, password } = req.body;

    const missingFields = [];
    if (!emailOrUsername) {
      missingFields.push({
        field: 'emailOrUsername',
        message: 'Email or username is required',
      });
    }
    if (!password) {
      missingFields.push({
        field: 'password',
        message: 'Password is required',
      });
    }

    if (missingFields.length > 0) {
      return errorResponse(res, {
        code: 422,
        errorCode: 'VALIDATION_ERROR',
        details: missingFields,
      });
    }

    const { user, accessToken, refreshToken: refreshTokenRaw, roles } = await loginUser({
      emailOrUsername,
      password,
    });

    return successResponse(res, {
      code: 200,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          roles,
        },
        token: accessToken,
        refreshToken: refreshTokenRaw,
      },
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

async function refresh(req, res, next) {
  try {
    const { refreshToken: refreshTokenRaw } = req.body;

    if (!refreshTokenRaw) {
      return errorResponse(res, {
        code: 422,
        errorCode: 'VALIDATION_ERROR',
        details: [
          { field: 'refreshToken', message: 'Refresh token is required' },
        ],
      });
    }

    const { user, accessToken } = await refreshToken({ refreshToken: refreshTokenRaw });

    return successResponse(res, {
      code: 200,
      message: 'Token refreshed successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
        },
        token: accessToken,
      },
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
  register,
  login,
  refresh,
};
