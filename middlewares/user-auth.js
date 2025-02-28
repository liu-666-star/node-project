const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { UnauthorizedError } = require('../utils/errors');
const { success, failure } = require('../utils/responses');

module.exports = async (req, res, next) => {
    try {
       const {token} = req.headers;
       if(!token) {
           throw new UnauthorizedError('当前需要验证才可以访问')
       }
    // 将token中存的数据拿出来 用于判断
        const decoded = jwt.verify(token, process.env.SECRET);
        const { userId } = decoded;
        const user = await User.findByPk(userId);
        if (!user) {
            throw new UnauthorizedError('用户不存在')
        }
        // 通过验证 将userId挂载到路由上
        req.userId = userId;
        next();
    } catch (error) {
        failure(res, error);
    }
};
