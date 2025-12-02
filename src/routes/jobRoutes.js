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
router.get('/', getJobs);

// Owner: list jobs for self
router.get('/me/list', authRequired, getMyJobsHandler);

// Public: job detail
router.get('/:idOrSlug', getJobDetail);

// Owner: create job
router.post('/', authRequired, createJobHandler);

// Owner: update job
router.patch('/:id', authRequired, updateJobHandler);

// Owner: change job status
router.patch('/:id/status', authRequired, changeJobStatusHandler);

module.exports = router;
