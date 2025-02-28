const express = require('express');
const router = express.Router();
const {Article} = require('../../models/');
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
            order: [['id', 'DESC']],
            limit: pageSize,
            offset: offset,
        }
        if(query.title) {
            condition.where = {
                title: {
                    [Op.like]: `%${query.title}%`,
                }
            }
        }
        const {count,rows} = await Article.findAndCountAll(condition);
        res.json( {
            status: 'true',
            message: '查询成功',
            data: {
                articles: rows,
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
// 查找文章详情
router.get('/:id', async function(req, res, next) {
    try {
        const articles = await getArticles(req);
        success(res,'文章查找成功', {articles})
    } catch (error) {
        failure(res, error);
    }
})
// 新增文章
router.post('/', async function(req, res, next) {
    try {
        // 将新增参数进行过滤
        const body = getbody(req)
        const article = await Article.create(body);
        success(res, '文章新增成功', {article}, 201)

    } catch (error) {
        failure(res, error);
    }

})
// 删除文章
router.delete('/:id', async function(req, res, next) {
    try{
        // const {id} = req.params;
        const articles = await getArticles(req)
            // 查询到执行删除
            await articles.destroy()
            success(res, '文章删除成功')

    } catch (error) {
        failure(res, error);
    }
})
// 修改文章
router.put('/:id', async function(req, res, next) {
    try{
        const articles = await getArticles(req)
        const body = getbody(req)
        await articles.update(body)
        success(res, '文章更新成功', {articles}, 201)
    } catch (error) {
        failure(res, error);
    }
})
// 公共查询方法
async function getArticles(req) {
    const {id} = req.params;
    const articles = await Article.findByPk(id)
    if(!articles) {
        throw new NotFoundError(`ID:${id}的文章未找到`)
    }
    return articles;
}
// 提取用户请求的参数
function getbody(req) {
    return {
        title: req.body.title,
        content: req.body.content,
    }
}
module.exports = router;
