const express = require("express");
const router = express.Router();
const { Setting } = require("../../models");
const { or } = require("sequelize");

const { off } = require("../../app");
const { NotFoundError, success, failure } = require("../../utils/response");

/**
 * 查询系统设置详情
 * GET /admin/settings/1
 */
router.get("/", async function (req, res, next) {
  try {
    const setting = await getSetting();

    success(res, "查询系统设置成功", {
      setting,
    });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 更新系统设置
 * PUT /admin/settings/1
 */
router.put("/", async function (req, res, next) {
  try {
    const setting = await getSetting();

    await setting.update(req.body);

    success(res, "更新系统设置成功", { setting });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 公共方法：查询当前系统设置
 * @param {*} req
 * @returns
 */
async function getSetting() {
  const setting = await Setting.findOne();
  if (!setting) {
    throw new NotFoundError("初始系统设置不存在，请运行种子文件");
  }
  return setting;
}

function filterBody(body) {
  return {
    title: body.title,
    content: body.content,
  };
}

module.exports = router;
