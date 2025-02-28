const express = require('express');
const router = express.Router();
const { Setting } = require('../models');
const {success, failure} = require('../utils/responses');
const { NotFoundError } = require("../utils/errors");
router.get('/', async (req, res) => {
    try {
        const settings = await Setting.findOne();
        if (!settings) {
            throw new NotFoundError('暂时没找到系统设置信息');
        }
        success(res, '查询成功', settings);
    } catch (error) {
        failure(res, error);
    }
})
module.exports = router;