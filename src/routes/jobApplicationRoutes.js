// src/routes/jobApplicationRoutes.js

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

// Owner: list semua aplikasi untuk satu job
router.get('/jobs/:jobId/applications', authRequired, getJobApplicationsForJob);

// Owner: statistik lamaran job
router.get('/jobs/:jobId/applications/stats', authRequired, getJobApplicationsStats);

// Login user: list semua lamarannya sendiri
router.get('/me/job-applications', authRequired, getMyJobApplications);

// Detail lamaran (pelamar / owner)
router.get('/job-applications/:id', authRequired, getJobApplicationDetail);

module.exports = router;
