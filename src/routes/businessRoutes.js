const express = require('express');
const {
  getMyBusinesses,
  createBusinessHandler,
  getBusinessDetail,
} = require('../controllers/businessController');
const { authRequired } = require('../middlewares/authMiddleware');

const router = express.Router();

//List business for owner
router.get('/me', authRequired, getMyBusinesses);

//Create business
router.post('/', authRequired, createBusinessHandler);

//Detail business
router.get('/:id', authRequired, getBusinessDetail);

module.exports = router;
