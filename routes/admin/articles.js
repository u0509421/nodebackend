const express = require("express");
const router = express.Router();
const { Article } = require("../../models");
const { or } = require("sequelize");
const { Op } = require("sequelize");
const { off } = require("../../app");
const { NotFoundError, success, failure } = require("../../utils/response");

/**
 * 查询文章列表
 * GET /admin/articles
 */
router.get("/", async function (req, res, next) {
  try {
    const query = req.query;

    // 分页
    const currentPage = parseInt(query.currentPage) || 1;
    // 每页显示的条数
    const pageSize = parseInt(query.pageSize) || 10;
    // 计算偏移量
    const offset = (currentPage - 1) * pageSize;

    const condition = {
      order: [["id", "DESC"]],
      limit: pageSize,
      offset: offset,
    };

    if (query.title) {
      condition.where = {
        title: {
          [Op.like]: `%${query.title}%`,
        },
      };
    }
    // 查询文章列表
    const { count, rows } = await Article.findAndCountAll(condition);

    success(res, "查询文章列表成功", {
      articles: rows,
      pagination: {
        currentPage,
        pageSize,
        total: count,
      },
    });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 查询文章详情
 * GET /admin/articles/1
 */
router.get("/:id", async function (req, res, next) {
  try {
    const article = await getArticle(req);

    success(res, "查询文章成功", {
      article,
    });
  } catch (error) {
    failure(res, error);
  }
});

/** 创建文章
 * POST /admin/articles
 */
router.post("/", async function (req, res, next) {
  try {
    //白名单过滤
    const body = filterBody(req.body);
    const article = await Article.create(body);

    success(res, "创建文章成功", { article }, 201);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        status: false,
        message: "请求参数错误",
        error: error.errors.map((err) => err.message),
      });
    } else {
      res.status(500).json({
        status: false,
        message: "创建文章失败",
        error: error.message,
      });
    }
  }
});

/**
 * 删除文章
 * DELETE /admin/articles/1
 */
router.delete("/:id", async function (req, res, next) {
  try {
    const article = await getArticle(req);

    await article.destroy();

    success(res, "删除文章成功");
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 更新文章
 * PUT /admin/articles/1
 */
router.put("/:id", async function (req, res, next) {
  try {
    const article = await getArticle(req);

    const body = filterBody(req.body);

    await article.update(body);

    success(res, "更新文章成功", { article });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 公共方法：查询当前文章
 * @param {*} req
 * @returns
 */
async function getArticle(req) {
  const { id } = req.params;
  const article = await Article.findByPk(id);
  if (!article) {
    throw new NotFoundError("文章不存在");
  }
  return article;
}

function filterBody(body) {
  return {
    title: body.title,
    content: body.content,
  };
}

module.exports = router;
