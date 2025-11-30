// src/routes/paymentRoutes.js

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
// PATCH /api/payments/:id/proof
router.patch('/:id/proof', authRequired, attachPaymentProofHandler);

// Admin: verify / reject payment terkait event registration
// PATCH /api/admin/payments/:id/verify
router.patch(
  '/admin/:id/verify',
  authRequired,
  requireRole('ADMIN'),
  verifyEventPaymentHandler
);

// User: list payments miliknya
// GET /api/payments/me/list
router.get('/me/list', authRequired, getMyPaymentsHandler);

// Event creator: list payments untuk event tertentu
// GET /api/payments/events/:eventId
router.get('/events/:eventId', authRequired, getEventPaymentsForCreatorHandler);

module.exports = router;
