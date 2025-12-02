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
router.get('/', getArticles);

// Contributor: list my articles
router.get('/me/list/my', authRequired, getMyArticlesHandler);

// Public: article detail (by slug / id)
router.get('/:idOrSlug', getArticleDetail);

// Contributor: create article (auto publish)
router.post('/', authRequired, createArticleHandler);

// Contributor: update article by id
router.patch('/:id', authRequired, updateArticleHandler);

// Admin: edit article status
router.patch(
  '/:id/status',
  authRequired,
  requireRole('ADMIN'),
  changeArticleStatusHandler
);

module.exports = router;
