const { successResponse, errorResponse } = require('../utils/response');
const {
  listArticles,
  listMyArticles,
  createArticle,
  getArticlePublic,
  updateArticle,
  changeArticleStatus,
} = require('../services/articleService');

async function getArticles(req, res, next) {
  try {
    const { page, limit, q } = req.query;

    const result = await listArticles({ page, limit, q });

    return successResponse(res, {
      code: 200,
      message: 'Articles fetched successfully',
      data: result.items,
      meta: result.meta,
    });
  } catch (err) {
    return next(err);
  }
}

async function getArticleDetail(req, res, next) {
  try {
    const { idOrSlug } = req.params;

    const article = await getArticlePublic(idOrSlug);

    return successResponse(res, {
      code: 200,
      message: 'Article fetched successfully',
      data: article,
    });
  } catch (err) {
    if (err.code && err.errorCode) {
      return errorResponse(res, {
        code: err.code,
        errorCode: err.errorCode,
      });
    }
    return next(err);
  }
}

async function getMyArticlesHandler(req, res, next) {
  try {
    const { page, limit } = req.query;

    const result = await listMyArticles(req.user.id, { page, limit });

    return successResponse(res, {
      code: 200,
      message: 'Articles fetched successfully',
      data: result.items,
      meta: result.meta,
    });
  } catch (err) {
    return next(err);
  }
}

async function createArticleHandler(req, res, next) {
  try {
    const { title, content } = req.body;

    const missingFields = [];
    if (!title) missingFields.push({ field: 'title', message: 'Title is required' });
    if (!content) missingFields.push({ field: 'content', message: 'Content is required' });

    if (missingFields.length > 0) {
      return errorResponse(res, {
        code: 422,
        errorCode: 'VALIDATION_ERROR',
        details: missingFields,
      });
    }

    const article = await createArticle({
      authorId: req.user.id,
      payload: req.body,
    });

    return successResponse(res, {
      code: 201,
      message: 'Article created successfully',
      data: article,
    });
  } catch (err) {
    if (err.code && err.errorCode) {
      return errorResponse(res, {
        code: err.code,
        errorCode: err.errorCode,
        details: err.details || null,
      });
    }
    return next(err);
  }
}

async function updateArticleHandler(req, res, next) {
  try {
    const { id } = req.params;

    const article = await updateArticle({
      authorId: req.user.id,
      articleId: id,
      payload: req.body,
    });

    return successResponse(res, {
      code: 200,
      message: 'Article updated successfully',
      data: article,
    });
  } catch (err) {
    if (err.code && err.errorCode) {
      return errorResponse(res, {
        code: err.code,
        errorCode: err.errorCode,
        details: err.details || null,
      });
    }
    return next(err);
  }
}

async function changeArticleStatusHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, {
        code: 422,
        errorCode: 'VALIDATION_ERROR',
        details: [{ field: 'status', message: 'Status is required' }],
      });
    }

    const article = await changeArticleStatus({
      articleId: id,
      status,
    });

    return successResponse(res, {
      code: 200,
      message: 'Article status updated successfully',
      data: article,
    });
  } catch (err) {
    if (err.code && err.errorCode) {
      return errorResponse(res, {
        code: err.code,
        errorCode: err.errorCode,
        details: err.details || null,
      });
    }
    return next(err);
  }
}

module.exports = {
  getArticles,
  getArticleDetail,
  getMyArticlesHandler,
  createArticleHandler,
  updateArticleHandler,
  changeArticleStatusHandler,
};
