const express = require('express');
const router = express.Router();
const { Like, Course, User } = require('../models');
// const { Op } = require('sequelize');
const { NotFoundError } = require('../utils/errors');
const { success, failure } = require('../utils/responses');
/**
 * 点赞取消赞
 */
router.post('/', async (req, res) => {
    try {

        const userId = req.userId
        const { courseId } = req.body;
        // 先查该用户下有没有课程
        const course = await Course.findByPk(courseId);
        if (!course) {
            throw new NotFoundError('当前课程不存在');
        }
        // 将该课程进行点赞
        const like = await Like.findOne({
            where: {
                userId,
                courseId
            }
        })
        // 如果没有点赞过，那就新增。并且课程的 likesCount + 1
        if (!like) {
            await Like.create({ courseId, userId });
            // increment方法是自增
            await course.increment('likesCount');
            success(res, '点赞成功。')
        } else {
            // 如果点赞过了，那就删除。并且课程的 likesCount - 1
            await like.destroy();
            // decrement方法是自减
            await course.decrement('likesCount');
            success(res, '取消赞成功。')
        }
    } catch (error) {
      failure(res, failure);
    }
})
// 获取点赞信息
router.get('/course', async (req, res) => {
    try {
        // 需要使用分页
        const query = req.query;
        const currentPage = Math.abs(Number(query.currentPage)) || 1;
        const pageSize = Math.abs(Number(query.pageSize)) || 10;
        const offset = (currentPage - 1) * pageSize;
        // 查询当前用户
        const user = await User.findByPk(req.userId);
        // console.log(user, '我是查出来的用户数据')
        // if (!user) {
        //     throw new NotFoundError('当前用户不存在');
        // }
        // 查询用户点赞的关联课程
        const courses = await user.getLikeCourses({
            // 隐藏中间表数据
            joinTableAttributes: [],
            attributes: {exclude: ['CategoryId', 'UserId', 'content']},
            order: [['id', 'DESC']],
            limit: pageSize,
            offset: offset
        })
        // 课程的总数
        const count = await user.countLikeCourses();
        success(res, '点赞的课程查询成功', {
            courses,
            user,
            total: count,
            pageSize,
            currentPage
        })

    } catch (error) {
      failure(res, error);
    }
})
module.exports = router;