const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
const prisma = require('../prisma/client');
const { hashPassword, comparePassword } = require('../utils/password');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../config/jwtConfig');

async function registerUser({ name, username, email, password }) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existing) {
    const error = new Error('Email or username already taken');
    error.code = 409;
    error.errorCode = 'EMAIL_OR_USERNAME_TAKEN';
    throw error;
  }

  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      passwordHash: hashed,
    },
  });

  return user;
}

async function loginUser({ emailOrUsername, password }) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    const error = new Error('Invalid credentials');
    error.code = 401;
    error.errorCode = 'INVALID_CREDENTIALS';
    throw error;
  }

  const match = await comparePassword(password, user.passwordHash);
  if (!match) {
    const error = new Error('Invalid credentials');
    error.code = 401;
    error.errorCode = 'INVALID_CREDENTIALS';
    throw error;
  }

  const roleNames = user.roles.map((r) => r.role.name);

  const accessToken = signAccessToken({
    id: user.id,
    email: user.email,
    roles: roleNames,
  });

  const refreshTokenRaw = signRefreshToken({ id: user.id });
  const decodedRefresh = jwt.decode(refreshTokenRaw);

  await prisma.authToken.create({
    data: {
      userId: user.id,
      token: refreshTokenRaw,
      tokenType: 'REFRESH',
      expiresAt: dayjs.unix(decodedRefresh.exp).toDate(),
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
    },
  });

  return {
    user,
    accessToken,
    refreshToken: refreshTokenRaw,
    roles: roleNames,
  };
}

async function refreshToken({ refreshToken }) {
  const stored = await prisma.authToken.findFirst({
    where: {
      token: refreshToken,
      tokenType: 'REFRESH',
      isRevoked: false,
    },
    include: { user: true },
  });

  if (!stored) {
    const error = new Error('Invalid refresh token');
    error.code = 401;
    error.errorCode = 'UNAUTHORIZED';
    throw error;
  }

  try {
    verifyRefreshToken(refreshToken);
  } catch (e) {
    const error = new Error('Invalid refresh token');
    error.code = 401;
    error.errorCode = 'UNAUTHORIZED';
    throw error;
  }

  const roles = await prisma.userRole.findMany({
    where: { userId: stored.userId },
    include: { role: true },
  });

  const roleNames = roles.map((r) => r.role.name);

  const accessToken = signAccessToken({
    id: stored.user.id,
    email: stored.user.email,
    roles: roleNames,
  });

  return {
    user: stored.user,
    accessToken,
  };
}

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
};
