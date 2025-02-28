const express = require('express');
const router = express.Router();
const {Chapter, Course} = require('../../models/');
const {Op} = require("sequelize");
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');

/* GET home page. */
router.get('/', async function(req, res, next) {
    try {
        // 获取请求参数
        const query = req.query;
        // 当前第几页
        const currentPage = Math.abs(Number(req.query.page)) || 1 ;
        // 当前查询的条数
        const pageSize = Math.abs(Number(req.query.pageSize)) || 10;
        // 要查询的位置
        const offset = (currentPage - 1) * pageSize;
        //数据查询条件
        const condition = {
            order: [['id', 'ASC'],['rank','ASC']],
            ...getCondition(),
            limit: pageSize,
            offset: offset,
        }
        condition.where = {
            courseId: {
                [Op.eq]: query.courseId
            }
        }
        if(query.title) {
            condition.where = {
                title: {
                    [Op.like]: `%${query.title}%`,
                }
            }
        }
        const {count,rows} = await Chapter.findAndCountAll(condition);
        res.json( {
            status: 'true',
            message: '查询成功',
            data: {
                chapters: rows,
                pagination: {
                    total: count,
                    currentPage,
                    pageSize,
                }
            }
        });
    } catch (error) {
        failure(res, error);
    }

});
// 查找章节详情
router.get('/:id', async function(req, res, next) {
    try {
        const chapters = await getChapters(req);
        success(res,'章节查找成功', {chapters})
    } catch (error) {
        failure(res, error);
    }
})
// 新增章节
router.post('/', async function(req, res, next) {
    try {
        // 将新增参数进行过滤
        const body = getbody(req)
        const chapter = await Chapter.create(body);
        success(res, '章节新增成功', {chapter}, 201)

    } catch (error) {
        failure(res, error);
    }

})
// 删除章节
router.delete('/:id', async function(req, res, next) {
    try{
        // const {id} = req.params;
        const chapters = await getChapters(req)

        // 查询到执行删除
        await chapters.destroy()
        success(res, '章节删除成功')

    } catch (error) {
        failure(res, error);
    }
})
// 修改章节
router.put('/:id', async function(req, res, next) {
    try{
        const chapters = await getChapters(req)
        const body = getbody(req)
        await chapters.update(body)
        success(res, '章节更新成功', {chapters}, 201)
    } catch (error) {
        failure(res, error);
    }
})
/**
 * 公共方法：关联课程数据
 * @returns {{include: [{as: string, model, attributes: string[]}], attributes: {exclude: string[]}}}
 */
function getCondition() {
    return {
        attributes: { exclude: ['CourseId'] },
        include: [
            {
                model: Course,
                as: 'course',
                attributes: ['id', 'name']
            }
        ]
    }
}

// 公共查询方法
async function getChapters(req) {
    const {id} = req.params;
    const condition = getCondition()
    const chapters = await Chapter.findByPk(id,condition)
    if(!chapters) {
        throw new NotFoundError(`ID:${id}的章节未找到`)
    }
    return chapters;
}
// 提取用户请求的参数
function getbody(req) {
    return {
        courseId: req.body.courseId,
        title: req.body.title,
        content: req.body.content,
        video: req.body.video,
        rank: req.body.rank
    };
}
module.exports = router;
