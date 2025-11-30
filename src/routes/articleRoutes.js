// src/routes/articleRoutes.js

const express = require('express');
const {
  getArticles,
  getArticleDetail,
  getMyArticlesHandler,
  createArticleHandler,
  updateArticleHandler,
  changeArticleStatusHandler,
} = require('../controllers/articleController');
const { authRequired, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public: list articles
// GET /api/articles
router.get('/', getArticles);

// Contributor: list article milik sendiri
// GET /api/articles/me/list
router.get('/me/list/my', authRequired, getMyArticlesHandler);

// Public: article detail (by slug / id)
// GET /api/articles/:idOrSlug
router.get('/:idOrSlug', getArticleDetail);

// Contributor: create article (auto publish)
// POST /api/articles
router.post('/', authRequired, createArticleHandler);

// Contributor: update article milik sendiri
// PATCH /api/articles/:id
router.patch('/:id', authRequired, updateArticleHandler);

// Admin: ubah status artikel (PUBLISHED / SUSPENDED / ARCHIVED)
// PATCH /api/articles/:id/status
router.patch(
  '/:id/status',
  authRequired,
  requireRole('ADMIN'),
  changeArticleStatusHandler
);

module.exports = router;
