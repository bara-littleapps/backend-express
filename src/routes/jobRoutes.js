const express = require('express');
const {
  getJobs,
  getMyJobsHandler,
  createJobHandler,
  getJobDetail,
  updateJobHandler,
  changeJobStatusHandler,
} = require('../controllers/jobController');
const { authRequired } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public: list jobs
// GET /api/jobs
router.get('/', getJobs);

// Owner: list jobs milik semua business milik user login
// GET /api/jobs/me/list
router.get('/me/list', authRequired, getMyJobsHandler);

// Public: job detail by id atau slug
// GET /api/jobs/:idOrSlug
router.get('/:idOrSlug', getJobDetail);

// Owner: create job
// POST /api/jobs
router.post('/', authRequired, createJobHandler);

// Owner: update job detail
// PATCH /api/jobs/:id
router.patch('/:id', authRequired, updateJobHandler);

// Owner: change job status
// PATCH /api/jobs/:id/status
router.patch('/:id/status', authRequired, changeJobStatusHandler);

module.exports = router;
