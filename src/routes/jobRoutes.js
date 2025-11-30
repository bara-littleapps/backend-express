// src/routes/jobRoutes.js

const express = require('express');
const {
  getJobs,
  createJobHandler,
  getJobDetail,
} = require('../controllers/jobController');
const { authRequired } = require('../middlewares/authMiddleware');

const router = express.Router();

// public list job
router.get('/', getJobs);

// public job detail
router.get('/:id', getJobDetail);

// create job (butuh login + business approved)
router.post('/', authRequired, createJobHandler);

module.exports = router;
