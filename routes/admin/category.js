const express = require('express');
const router = express.Router();
const {Category, Course} = require('../../models/');
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
            order: [['id', 'DESC'],['rank','ASC']],
            limit: pageSize,
            offset: offset,
        }
        if(query.name) {
            condition.where = {
                name: {
                    [Op.like]: `%${query.name}%`,
                }
            }
        }
        const {count,rows} = await Category.findAndCountAll(condition);
        res.json( {
            status: 'true',
            message: '查询成功',
            data: {
                categories: rows,
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
// 查找分类详情
router.get('/:id', async function(req, res, next) {
    try {
        const categories = await getArticles(req);
        success(res,'分类查找成功', {categories})
    } catch (error) {
        failure(res, error);
    }
})
// 新增分类
router.post('/', async function(req, res, next) {
    try {
        // 将新增参数进行过滤
        const body = getbody(req)
        const category = await Category.create(body);
        success(res, '分类新增成功', {category}, 201)

    } catch (error) {
        failure(res, error);
    }

})
// 删除分类
router.delete('/:id', async function(req, res, next) {
    try{
        // const {id} = req.params;
        const categories = await getArticles(req)
        // 用当前的分类id 去
        const count = await Course.count({where: {id: req.params.id}});
        if(count > 0) {
            throw new Error('当前分类有课程，无法删除');
        }
        // 查询到执行删除
        await categories.destroy()
        success(res, '分类删除成功')

    } catch (error) {
        failure(res, error);
    }
})
// 修改分类
router.put('/:id', async function(req, res, next) {
    try{
        const categories = await getArticles(req)
        const body = getbody(req)
        await categories.update(body)
        success(res, '分类更新成功', {categories}, 201)
    } catch (error) {
        failure(res, error);
    }
})
// 公共查询方法
async function getArticles(req) {
    const {id} = req.params;
    const categories = await Category.findByPk(id)
    if(!categories) {
        throw new NotFoundError(`ID:${id}的分类未找到`)
    }
    return categories;
}
// 提取用户请求的参数
function getbody(req) {
    return {
        name: req.body.name,
        rank: req.body.rank,
    }
}
module.exports = router;
