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
        if(user.role != '100') {
            throw new UnauthorizedError('您没有权限使用当前接口。')
        }
        // 通过验证 将user挂载到路由上
        req.user = user;
        next();
    } catch (error) {
        failure(res, error);
    }
};
