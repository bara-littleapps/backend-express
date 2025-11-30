// src/routes/contributorRoutes.js

const express = require('express');
const {
  applyContributorHandler,
  getMyContributorProfileHandler,
} = require('../controllers/contributorController');
const { authRequired } = require('../middlewares/authMiddleware');

const router = express.Router();

// User login apply jadi contributor
// POST /api/contributors/apply
router.post('/apply', authRequired, applyContributorHandler);

// Lihat contributor profile milik sendiri
// GET /api/contributors/me
router.get('/me', authRequired, getMyContributorProfileHandler);

module.exports = router;
