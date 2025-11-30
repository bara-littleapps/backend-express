// src/routes/jobApplicationRoutes.js

const express = require('express');
const {
  createJobApplicationHandler,
  getJobApplicationsForJob,
  getJobApplicationDetail,
} = require('../controllers/jobApplicationController');
const { authRequired } = require('../middlewares/authMiddleware');

const router = express.Router();

// apply job (platform / external)
router.post('/jobs/:jobId/applications', authRequired, createJobApplicationHandler);

// list applications for a job (business owner only)
router.get('/jobs/:jobId/applications', authRequired, getJobApplicationsForJob);

// detail satu job application
router.get('/job-applications/:id', authRequired, getJobApplicationDetail);

module.exports = router;
