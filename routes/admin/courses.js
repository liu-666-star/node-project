const express = require('express');
const router = express.Router();
const {Course, Category, User,Chapter} = require('../../models/');
const {Op, where} = require("sequelize");
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
            order: [['id', 'DESC']],
            ...getCondition(),
            limit: pageSize,
            offset: offset,

        }
        if (query.categoryId) {
            condition.where = {
                categoryId: {
                    [Op.eq]: query.categoryId
                }
            };
        }

        if (query.userId) {
            condition.where = {
                userId: {
                    [Op.eq]: query.userId
                }
            };
        }

        if (query.name) {
            condition.where = {
                name: {
                    [Op.like]: `%${ query.name }%`
                }
            };
        }

        if (query.recommended) {
            condition.where = {
                recommended: {
                    // 需要转布尔值
                    [Op.eq]: query.recommended === 'true'
                }
            };
        }

        if (query.introductory) {
            condition.where = {
                introductory: {
                    [Op.eq]: query.introductory === 'true'
                }
            };
        }
        const {count,rows} = await Course.findAndCountAll(condition);
        res.json( {
            status: 'true',
            message: '查询成功',
            data: {
                courses: rows,
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
// 查找课程详情
router.get('/:id', async function(req, res, next) {
    try {
        const courses = await getCourses(req);
        success(res,'课程查找成功', {courses})
    } catch (error) {
        failure(res, error);
    }
})
// 新增课程
router.post('/', async function(req, res, next) {
    try {
        // 将新增参数进行过滤
        const body = filterBody(req)
        const course = await Course.create(body);
        success(res, '课程新增成功', {course}, 201)

    } catch (error) {
        failure(res, error);
    }

})
// 删除课程
router.delete('/:id', async function(req, res, next) {
    try{
        // const {id} = req.params;
        const courses = await getCourses(req)
        const count = await Chapter.count({where: {courseId: req.params.id}})
        if(count > 0){
            throw new Error('课程存在章节，不能删除')
        }
            // 查询到执行删除
            await courses.destroy()
            success(res, '课程删除成功')

    } catch (error) {
        failure(res, error);
    }
})
// 修改课程
router.put('/:id', async function(req, res, next) {
    try{
        const courses = await getCourses(req)
        const body = filterBody(req)
        await courses.update(body)
        success(res, '课程更新成功', {courses}, 201)
    } catch (error) {
        failure(res, error);
    }
})
// 查询条件
function getCondition() {
    // 添加关联的模型 查出需要的数据
    return {
        attributes: { exclude: ['CategoryId', 'UserId'] },
        include: [{
            model: User,
            as: 'user',
            attributes: ['id','username','avatar'],
        }, {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
        }
        ],
    }
}
// 公共查询方法
async function getCourses(req) {
    const {id} = req.params;
    const  condition = {
        attributes: { exclude: ['CategoryId', 'UserId'] },
        include: [{
            model: User,
            as: 'user',
            attributes: ['id','username','avatar'],
        }, {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
        }
        ],
    }
    const courses = await Course.findByPk(id,condition)
    if(!courses) {
        throw new NotFoundError(`ID:${id}的课程未找到`)
    }
    return courses;
}
// 提取用户请求的参数
/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{image: *, name, introductory: (boolean|*), userId: (number|*), categoryId: (number|*), content, recommended: (boolean|*)}}
 */
function filterBody(req) {
    return {
        categoryId: req.body.categoryId,
        userId: req.body.userId,
        name: req.body.name,
        image: req.body.image,
        recommended: req.body.recommended,
        introductory: req.body.introductory,
        content: req.body.content
    };
}

module.exports = router;
