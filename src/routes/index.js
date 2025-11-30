// src/routes/index.js

const express = require('express');
const authRoutes = require('./authRoutes');
const businessRoutes = require('./businessRoutes');
const jobRoutes = require('./jobRoutes');
const jobApplicationRoutes = require('./jobApplicationRoutes');
const contributorRoutes = require('./contributorRoutes');
const articleRoutes = require('./articleRoutes');
const eventRoutes = require('./eventRoutes');
const paymentRoutes = require('./paymentRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/businesses', businessRoutes);
router.use('/jobs', jobRoutes);
router.use('/contributors', contributorRoutes);
router.use('/articles', articleRoutes);
router.use('/events', eventRoutes);
router.use('/payments', paymentRoutes);

// Admin dashboard
router.use('/admin', adminRoutes);

// Job application routes (apply / my applications / detail)
router.use('/', jobApplicationRoutes);

module.exports = router;
