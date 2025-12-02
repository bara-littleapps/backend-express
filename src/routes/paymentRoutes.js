const express = require('express');
const {
  attachPaymentProofHandler,
  verifyEventPaymentHandler,
  getMyPaymentsHandler,
  getEventPaymentsForCreatorHandler,
} = require('../controllers/paymentController');
const { authRequired, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// User: attach proof to payment (screenshot + reference)
router.patch('/:id/proof', authRequired, attachPaymentProofHandler);

// Admin: verify / reject payment
router.patch(
  '/admin/:id/verify',
  authRequired,
  requireRole('ADMIN'),
  verifyEventPaymentHandler
);

// User: list payments for self
router.get('/me/list', authRequired, getMyPaymentsHandler);

// Event creator: list payments for own event
router.get('/events/:eventId', authRequired, getEventPaymentsForCreatorHandler);

module.exports = router;
