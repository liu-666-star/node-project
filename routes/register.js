const express = require('express');
const router = express.Router();
const {success, failure} = require('../utils/responses');
const { NotFoundError, BadRequestError, UnauthorizedError } = require("../utils/errors");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require("sequelize");
const {User} = require('../models');
router.post('/', async (req, res) => {
    try {
        // const data = req.body;
        const body = {
            email: req.body.email,
            username: req.body.username,
            nickname: req.body.nickname,
            password: req.body.password,
            sex: 2,
            role: 0
        }
        const user = await User.create(body);
        // 删除密码字段
        delete user.dataValues.password;
        success(res, '注册成功', {user},201)
    } catch(error) {
        failure(res, error);
    }
})
module.exports = router;