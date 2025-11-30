const express = require('express');
const authRoutes = require('./authRoutes');
const businessRoutes = require('./businessRoutes');
const jobRoutes = require('./jobRoutes');
const jobApplicationRoutes = require('./jobApplicationRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/businesses', businessRoutes);
router.use('/jobs', jobRoutes);
router.use('/', jobApplicationRoutes); // /jobs/:jobId/applications, /job-applications/:id

module.exports = router;
