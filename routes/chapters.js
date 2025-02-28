const express = require('express');
const router = express.Router();
const {Chapter, User, Course, Category} = require('../models');
const {success, failure} = require('../utils/responses')
const {NotFoundError} = require('../utils/errors');
// 获取章节详情
router.get('/:id', async (req, res) => {
    try{
        const {id} = req.params;
        const condition = {
            attributes: {exclude: ['CourseId']},
            include: [
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'username', 'nickname', 'avatar', 'company']
                        }
                    ]
                }
            ]
        }
        const chapter = await Chapter.findByPk(id, condition);
        if (!chapter) {
            throw new NotFoundError(`ID: ${ id }的章节未找到。`)
        }
        // 同一个课程的所有章节
        const chapters = await Chapter.findAll({
            attributes: { exclude: ['CourseId', 'content'] },
            where: { courseId: chapter.courseId },
            order: [['rank', 'ASC'], ['id', 'DESC']]
        })
        success(res, '章节查找成功', {chapter,chapters})
    } catch (error) {
        failure(res, error);
    }
})
module.exports = router;