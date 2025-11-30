// src/routes/businessRoutes.js

const express = require('express');
const {
  getMyBusinesses,
  createBusinessHandler,
  getBusinessDetail,
} = require('../controllers/businessController');
const { authRequired } = require('../middlewares/authMiddleware');

const router = express.Router();

// GET /api/businesses/me  → list bisnis milik user login
router.get('/me', authRequired, getMyBusinesses);

// POST /api/businesses    → create business baru
router.post('/', authRequired, createBusinessHandler);

// GET /api/businesses/:id → detail business milik user
router.get('/:id', authRequired, getBusinessDetail);

module.exports = router;
