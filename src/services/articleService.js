// src/services/articleService.js

const prisma = require('../prisma/client');
const { ensureActiveContributor } = require('./contributorService');

async function generateArticleSlug(title) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const slug = `${base}-${Date.now()}`;
  return slug;
}

// Public list articles
async function listArticles({ page = 1, limit = 10, q }) {
  const take = Number(limit) || 10;
  const skip = (Number(page) - 1) * take;

  const where = {
    status: 'PUBLISHED',
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { content: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [items, totalItems] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take,
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        author: true,
      },
    }),
    prisma.article.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / take);

  return {
    items,
    meta: {
      page: Number(page),
      limit: take,
      totalItems,
      totalPages,
    },
  };
}

// Contributor: list article milik sendiri
async function listMyArticles(userId, { page = 1, limit = 10 }) {
  const take = Number(limit) || 10;
  const skip = (Number(page) - 1) * take;

  const where = {
    authorId: userId,
  };

  const [items, totalItems] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.article.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / take);

  return {
    items,
    meta: {
      page: Number(page),
      limit: take,
      totalItems,
      totalPages,
    },
  };
}

// Contributor: create article (auto publish)
async function createArticle({ authorId, payload }) {
  await ensureActiveContributor(authorId);

  const { title, content } = payload;

  const slug = await generateArticleSlug(title);

  const article = await prisma.article.create({
    data: {
      authorId,
      title,
      slug,
      excerpt: payload.excerpt || null,
      content,
      coverImageUrl: payload.coverImageUrl || null,
      status: 'PUBLISHED', // auto publish
      publishedAt: new Date(),
    },
  });

  return article;
}

// Public detail (by slug or id)
async function getArticlePublic(idOrSlug) {
  let article = null;

  if (idOrSlug.includes('-') && idOrSlug.length > 20) {
    // kemungkinan besar UUID → coba by id
    article = await prisma.article.findUnique({
      where: { id: idOrSlug },
      include: { author: true },
    });
  } else {
    // coba slug dulu
    article = await prisma.article.findFirst({
      where: { slug: idOrSlug },
      include: { author: true },
    });

    if (!article) {
      // fallback id
      article = await prisma.article.findUnique({
        where: { id: idOrSlug },
        include: { author: true },
      });
    }
  }

  if (!article || article.status !== 'PUBLISHED') {
    const error = new Error('Article not found');
    error.code = 404;
    error.errorCode = 'ARTICLE_NOT_FOUND';
    throw error;
  }

  return article;
}

// Contributor: update article milik sendiri
async function updateArticle({ authorId, articleId, payload }) {
  const existing = await prisma.article.findFirst({
    where: {
      id: articleId,
      authorId,
    },
  });

  if (!existing) {
    const error = new Error('Article not found');
    error.code = 404;
    error.errorCode = 'ARTICLE_NOT_FOUND';
    throw error;
  }

  const article = await prisma.article.update({
    where: { id: articleId },
    data: {
      title: payload.title ?? existing.title,
      excerpt: payload.excerpt ?? existing.excerpt,
      content: payload.content ?? existing.content,
      coverImageUrl: payload.coverImageUrl ?? existing.coverImageUrl,
    },
  });

  return article;
}

// Admin: ubah status article (PUBLISHED / SUSPENDED / ARCHIVED)
async function changeArticleStatus({ articleId, status }) {
  const allowed = ['PUBLISHED', 'SUSPENDED', 'ARCHIVED'];

  if (!allowed.includes(status)) {
    const error = new Error('Invalid status value');
    error.code = 422;
    error.errorCode = 'VALIDATION_ERROR';
    error.details = [
      {
        field: 'status',
        message: 'Status must be one of PUBLISHED, SUSPENDED, ARCHIVED',
      },
    ];
    throw error;
  }

  const existing = await prisma.article.findUnique({
    where: { id: articleId },
  });

  if (!existing) {
    const error = new Error('Article not found');
    error.code = 404;
    error.errorCode = 'ARTICLE_NOT_FOUND';
    throw error;
  }

  const data = {
    status,
  };

  if (status === 'PUBLISHED' && !existing.publishedAt) {
    data.publishedAt = new Date();
  }

  const updated = await prisma.article.update({
    where: { id: articleId },
    data,
  });

  return updated;
}

module.exports = {
  listArticles,
  listMyArticles,
  createArticle,
  getArticlePublic,
  updateArticle,
  changeArticleStatus,
};
