const express = require("express");
const router = express.Router();
const { User } = require("../../models");
const { or } = require("sequelize");
const { Op } = require("sequelize");
const { off } = require("../../app");
const { NotFoundError, success, failure } = require("../../utils/response");

/**
 * 查询用户列表
 * GET /admin/users
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

    // 模糊搜索
    if (query.email) {
      condition.where = {
        email: {
          [Op.eq]: query.email,
        },
      };
    }

    if (query.username) {
      condition.where = {
        username: {
          [Op.eq]: query.username,
        },
      };
    }

    if (query.nickname) {
      condition.where = {
        nickname: {
          [Op.like]: `%${query.nickname}%`,
        },
      };
    }

    if (query.role) {
      condition.where = {
        role: {
          [Op.eq]: query.role,
        },
      };
    }

    // 查询用户列表
    const { count, rows } = await User.findAndCountAll(condition);

    success(res, "查询用户列表成功", {
      users: rows,
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
 * 查询用户详情
 * GET /admin/users/1
 */
router.get("/:id", async function (req, res, next) {
  try {
    const user = await getUser(req);

    success(res, "查询用户成功", {
      user,
    });
  } catch (error) {
    failure(res, error);
  }
});

/** 创建用户
 * POST /admin/users
 */
router.post("/", async function (req, res, next) {
  try {
    //白名单过滤

    const body = filterBody(req);
    console.log(body);
    const user = await User.create(body);

    success(res, "创建用户成功", { user }, 201);
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
        message: "创建用户失败",
        error: error.message,
      });
    }
  }
});

/**
 * 删除用户
 * DELETE /admin/users/1
 */
router.delete("/:id", async function (req, res, next) {
  try {
    const user = await getUser(req);

    await user.destroy();

    success(res, "删除用户成功");
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 更新用户
 * PUT /admin/users/1
 */
router.put("/:id", async function (req, res, next) {
  try {
    const user = await getUser(req);

    const body = filterBody(req);

    await user.update(body);
    success(res, "更新用户成功", { user });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 公共方法：查询当前用户
 * @param {*} req
 * @returns
 */
async function getUser(req) {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError("用户不存在");
  }
  return user;
}

/**
 * 公共方法：白名单过滤请求体
 * @param {*} body
 * @returns
 */
function filterBody(req) {
  return {
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    nickname: req.body.nickname,
    sex: req.body.sex,
    company: req.body.company,
    introduce: req.body.introduce,
    role: req.body.role,
    avatar: req.body.avatar,
  };
}

module.exports = router;
