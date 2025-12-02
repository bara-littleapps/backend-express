const prisma = require('../prisma/client');

async function createPaymentForEventRegistration({ userId, event, registration }) {
  if (!event.isPaid) {
    return null;
  }

  const payment = await prisma.payment.create({
    data: {
      userId,
      paymentType: 'EVENT_REGISTRATION',
      amount: registration.totalAmount,
      referenceCode: null,
      screenshotUrl: null,
      status: 'PENDING',
      eventRegistrationId: registration.id,
      eventId: event.id,
    },
  });

  return payment;
}

// User: upload proof transaction (screenshot + reference)
async function attachPaymentProof({ paymentId, userId, payload }) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    const error = new Error('Payment not found');
    error.code = 404;
    error.errorCode = 'PAYMENT_NOT_FOUND';
    throw error;
  }

  if (payment.userId !== userId) {
    const error = new Error('Forbidden');
    error.code = 403;
    error.errorCode = 'FORBIDDEN';
    throw error;
  }

  if (payment.status === 'VERIFIED') {
    const error = new Error('Payment already verified');
    error.code = 400;
    error.errorCode = 'VALIDATION_ERROR';
    error.details = [
      { field: 'paymentId', message: 'Payment already verified' },
    ];
    throw error;
  }

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      referenceCode: payload.referenceCode || payment.referenceCode,
      screenshotUrl: payload.screenshotUrl || payment.screenshotUrl,
    },
  });

  return updated;
}

// Admin: verify / reject payment for event registration
async function verifyEventPayment({ paymentId, adminId, status }) {
  const allowed = ['VERIFIED', 'REJECTED'];

  if (!allowed.includes(status)) {
    const error = new Error('Invalid status value');
    error.code = 422;
    error.errorCode = 'VALIDATION_ERROR';
    error.details = [
      { field: 'status', message: 'Status must be VERIFIED or REJECTED' },
    ];
    throw error;
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      eventRegistration: true,
    },
  });

  if (!payment) {
    const error = new Error('Payment not found');
    error.code = 404;
    error.errorCode = 'PAYMENT_NOT_FOUND';
    throw error;
  }

  if (!payment.eventRegistrationId) {
    const error = new Error('Payment is not related to an event registration');
    error.code = 400;
    error.errorCode = 'VALIDATION_ERROR';
    throw error;
  }

  const data = {
    status,
    verifiedById: adminId,
    verifiedAt: new Date(),
  };

  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data,
  });

  if (status === 'VERIFIED') {
    await prisma.eventRegistration.update({
      where: { id: payment.eventRegistrationId },
      data: {
        status: 'CONFIRMED',
      },
    });
  }

  if (status === 'REJECTED') {
    await prisma.eventRegistration.update({
      where: { id: payment.eventRegistrationId },
      data: {
        status: 'REJECTED',
      },
    });
  }

  return updatedPayment;
}

// User: view my payments (paginated)
async function listMyPayments(userId, { page = 1, limit = 10 }) {
  const take = Number(limit) || 10;
  const skip = (Number(page) - 1) * take;

  const where = {
    userId,
  };

  const [items, totalItems] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        event: true,
        eventRegistration: true,
        business: true,
        jobPost: true,
      },
    }),
    prisma.payment.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / take);

  return {
    items,
    meta: {
      page: Number(page),
      limit: take,
      totalItems,
      totalPages,
    },
  };
}

// Creator: view payments for their event
async function listEventPaymentsForCreator({ eventId, creatorId }) {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      creatorId,
    },
  });

  if (!event) {
    const error = new Error('Event not found');
    error.code = 404;
    error.errorCode = 'EVENT_NOT_FOUND';
    throw error;
  }

  const payments = await prisma.payment.findMany({
    where: {
      eventId,
      paymentType: 'EVENT_REGISTRATION',
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: true,
      eventRegistration: true,
    },
  });

  return payments;
}

module.exports = {
  createPaymentForEventRegistration,
  attachPaymentProof,
  verifyEventPayment,
  listMyPayments,
  listEventPaymentsForCreator,
};
