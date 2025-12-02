const express = require('express');
const {
  applyContributorHandler,
  getMyContributorProfileHandler,
} = require('../controllers/contributorController');
const { authRequired } = require('../middlewares/authMiddleware');

const router = express.Router();

//User register for contributor role
router.post('/apply', authRequired, applyContributorHandler);

//View my contributor profile
router.get('/me', authRequired, getMyContributorProfileHandler);

module.exports = router;
