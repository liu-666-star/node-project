// 请求成功
function success(res,message,data,code = 200) {
    res.status(code).json({
        status: true,
        message,
        data
    })
}
function failure(res,error) {
    console.log(error);
    if(error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(e => e.message);
        return res.status(400).json({
            status: false,
            message: '请求参数错误',
            errors
        })
    }
    if(error.name === 'NotFoundError') {
        res.status(404).json({
            status: false,
            message: '资源不存在',
            errors: [error.message]
        })
    }
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: false,
            message: '认证失败',
            errors: ['您提交的 token 错误。']
        });
    }

    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: false,
            message: '认证失败',
            errors: ['您的 token 已过期。']
        });
    }
    res.status(500).json({
        status: false,
        message: '服务器错误',
        errors: [error.message]
    })
}
module.exports = {
    success,
    failure
}