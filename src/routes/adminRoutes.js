const express = require('express');
const {
  getAdminUsers,
  getAdminUserDetail,
  updateAdminUserStatus,
  getAdminBusinesses,
  updateAdminBusinessStatus,
  getAdminJobs,
  updateAdminJobStatus,
  getAdminArticles,
  updateAdminArticleStatus,
  getAdminEvents,
  updateAdminEventStatus,
  getAdminPayments,
  getAdminPaymentDetail,
} = require('../controllers/adminController');
const { authRequired, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Middleware admin
router.use(authRequired, requireRole('ADMIN'));

// USERS
router.get('/users', getAdminUsers);
router.get('/users/:id', getAdminUserDetail);
router.patch('/users/:id/status', updateAdminUserStatus);

// BUSINESSES
router.get('/businesses', getAdminBusinesses);
router.patch('/businesses/:id/status', updateAdminBusinessStatus);

// JOBS
router.get('/jobs', getAdminJobs);
router.patch('/jobs/:id/status', updateAdminJobStatus);

// ARTICLES
router.get('/articles', getAdminArticles);
router.patch('/articles/:id/status', updateAdminArticleStatus);

// EVENTS
router.get('/events', getAdminEvents);
router.patch('/events/:id/status', updateAdminEventStatus);

// PAYMENTS
router.get('/payments', getAdminPayments);
router.get('/payments/:id', getAdminPaymentDetail);

module.exports = router;
