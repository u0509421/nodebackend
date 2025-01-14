const express = require("express");
const router = express.Router();
const { Article } = require("../../models");
const { or } = require("sequelize");

/* GET articles listing. */
router.get("/", async function (req, res, next) {
  try {
    const condition = {
      order: [["id", "DESC"]],
    };
    const articles = await Article.findAll(condition);
    res.json({
      status: true,
      message: "查询文章列表成功",
      data: {
        articles,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "查询文章列表失败",
      error: error.message,
    });
  }
});

module.exports = router;
