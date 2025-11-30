// src/routes/index.js

const express = require('express');
const authRoutes = require('./authRoutes');
const businessRoutes = require('./businessRoutes');
const jobRoutes = require('./jobRoutes');
const jobApplicationRoutes = require('./jobApplicationRoutes');

const router = express.Router();

// /api/auth/...
router.use('/auth', authRoutes);

// /api/businesses/...
router.use('/businesses', businessRoutes);

// /api/jobs/... (list & detail & create)
router.use('/jobs', jobRoutes);

// /api/jobs/:jobId/applications & /api/job-applications/:id
router.use('/', jobApplicationRoutes);

module.exports = router;
