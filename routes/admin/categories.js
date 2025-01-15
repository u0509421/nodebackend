const express = require("express");
const router = express.Router();
const { Category } = require("../../models");
const { or } = require("sequelize");
const { Op } = require("sequelize");
const { off } = require("../../app");
const { NotFoundError, success, failure } = require("../../utils/response");

/**
 * 查询分类列表
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

    if (query.name) {
      condition.where = {
        name: {
          [Op.like]: `%${query.name}%`,
        },
      };
    }
    // 查询分类列表
    const { count, rows } = await Category.findAndCountAll(condition);

    success(res, "查询分类列表成功", {
      categories: rows,
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
 * 查询分类详情
 * GET /admin/articles/1
 */
router.get("/:id", async function (req, res, next) {
  try {
    const category = await getCategory(req);

    success(res, "查询分类成功", {
      category,
    });
  } catch (error) {
    failure(res, error);
  }
});

/** 创建分类
 * POST /admin/articles
 */
router.post("/", async function (req, res, next) {
  try {
    //白名单过滤
    const body = filterBody(req.body);
    const category = await Category.create(body);

    success(res, "创建分类成功", { category }, 201);
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
        message: "创建分类失败",
        error: error.message,
      });
    }
  }
});

/**
 * 删除分类
 * DELETE /admin/articles/1
 */
router.delete("/:id", async function (req, res, next) {
  try {
    const category = await getCategory(req);

    await category.destroy();

    success(res, "删除分类成功");
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 更新分类
 * PUT /admin/articles/1
 */
router.put("/:id", async function (req, res, next) {
  try {
    const category = await getCategory(req);

    const body = filterBody(req.body);

    await category.update(body);

    success(res, "更新分类成功", { category });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 公共方法：查询当前分类
 * @param {*} req
 * @returns
 */
async function getCategory(req) {
  const { id } = req.params;
  const category = await Category.findByPk(id);
  if (!category) {
    throw new NotFoundError("分类不存在");
  }
  return category;
}

/**
 * 公共方法：过滤请求体
 * @param {*} body
 * @returns
 */
function filterBody(body) {
  return {
    name: body.name,
    rank: body.rank,
  };
}

module.exports = router;
