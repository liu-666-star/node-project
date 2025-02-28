const express = require('express');
const router = express.Router();
const {Setting} = require('../../models/');
const {Op} = require("sequelize");
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');


// 查找系统设置详情
router.get('/', async function(req, res, next) {
    try {
        const settings = await getSettings();
        success(res,'系统设置查找成功', {settings})
    } catch (error) {
        failure(res, error);
    }
})

// 修改系统设置
router.put('/', async function(req, res, next) {
    try{
        const settings = await getSettings()
        const body = filterBody(req)
        await settings.update(body)
        success(res, '系统设置更新成功', {settings}, 201)
    } catch (error) {
        failure(res, error);
    }
})
// 公共查询方法
async function getSettings() {
    const settings = await Setting.findOne()
    if(!settings) {
        throw new NotFoundError(`初始系统设置未找到，请运行种子文件。`)
    }
    return settings;
}

/**
 *
 * @param req
 * @returns {{title, content: (string|string|DocumentFragment|*)}}
 */
function filterBody(req) {
    return {
        name: req.body.name,
        icp: req.body.icp,
        copyright: req.body.copyright
    };
}
module.exports = router;
