const express = require('express');
const {
  createJobApplicationHandler,
  getJobApplicationsForJob,
  getJobApplicationsStats,
  getMyJobApplications,
  getJobApplicationDetail,
} = require('../controllers/jobApplicationController');
const { authRequired, authOptional } = require('../middlewares/authMiddleware');

const router = express.Router();

// Guest / login: apply job (PLATFORM / EXTERNAL)
router.post('/jobs/:jobId/applications', authOptional, createJobApplicationHandler);

// Owner: list all applications for a job
router.get('/jobs/:jobId/applications', authRequired, getJobApplicationsForJob);

// Owner: stats applications for a job
router.get('/jobs/:jobId/applications/stats', authRequired, getJobApplicationsStats);

// Login user: list my job applications
router.get('/me/job-applications', authRequired, getMyJobApplications);

// Detail job application
router.get('/job-applications/:id', authRequired, getJobApplicationDetail);

module.exports = router;
