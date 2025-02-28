const express = require('express');
const router = express.Router();
const {success, failure} = require('../utils/responses');
// 所需要的模块
const { Course, Category, User } = require('../models');
/* GET home page. */
router.get('/', async function(req, res, next) {
  // 焦点图（推荐的课程）
  const recommendedCourses = await Course.findAll({
    attributes: { exclude: ['CategoryId', 'UserId', 'content'] },
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'nickname', 'avatar', 'company'],
      }
    ],
    where: { recommended: true },
    order: [['id', 'desc']],
    limit: 10
  });
  // 人气课程
  const likesCourses = await Course.findAll({
    attributes: { exclude: ['CategoryId', 'UserId', 'content'] },
    order: [['likesCount', 'desc'], ['id', 'desc']],
    limit: 10
  });
  // 入门课程
  const introductoryCourses = await Course.findAll({
    attributes: { exclude: ['CategoryId', 'UserId', 'content'] },
    where: { introductory: true },
    order: [['id', 'desc']],
    limit: 10
  });
  success(res, '查询成功',{recommendedCourses,likesCourses,introductoryCourses})
});
module.exports = router;
