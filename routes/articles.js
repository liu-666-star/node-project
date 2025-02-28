const express = require('express');
const router = express.Router();
const { Article } = require('../models');
const {success, failure} = require('../utils/responses');
const { NotFoundError } = require("../utils/errors");
// 文章列表
router.get('/', async (req, res) => {
    try {
        const query = req.query;
        const currentPage = Math.abs(Number(query.currentPage)) || 1;
        const pageSize = Math.abs(Number(query.pageSize)) || 10;
        const offset = (currentPage - 1) * pageSize;
        const condition = {
            attributes: { exclude: ['content'] },
            order: [['id', 'DESC']],
            limit: pageSize,
            offset: offset
        }
        const {count, rows} = await Article.findAndCountAll(condition)
        success(res, '获取文章列表成功', {
            articles: rows,
            total: count,
            pagination: {
                currentPage,
                pageSize
            }
        })
    } catch (error) {
        failure(res, error);
    }
})
// 获取文章详情
router.get('/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const article = await Article.findByPk(id);
        if (!article) {
            throw new NotFoundError('没有查到文章详情')
        }
        success(res, '查找成功', article);
    } catch (error) {
        failure(res, error);
    }
})
module.exports = router;