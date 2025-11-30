// src/constants/errorMessages.js

const errorMessages = {
  VALIDATION_ERROR: 'Validation error',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Conflict',
  INTERNAL_SERVER_ERROR: 'Internal server error',

  // Auth-specific
  INVALID_CREDENTIALS: 'Invalid credentials',
  EMAIL_OR_USERNAME_TAKEN: 'Email or username is already taken',

  // User / Role
  USER_NOT_FOUND: 'User not found',
  ROLE_NOT_FOUND: 'Role not found',

  // Business / Job
  BUSINESS_NOT_FOUND: 'Business not found',
  BUSINESS_NOT_APPROVED: 'Business is not approved',
  JOB_NOT_FOUND: 'Job not found',
  JOB_APPLICATION_NOT_FOUND: 'Job application not found',

  // Event
  EVENT_NOT_FOUND: 'Event not found',
  EVENT_REGISTRATION_NOT_FOUND: 'Event registration not found',

  // Payment
  PAYMENT_NOT_FOUND: 'Payment not found',
};

module.exports = errorMessages;
