const express = require('express');
const router = express.Router();
const {User} = require('../../models/');
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
        if(query.email) {
            condition.where = {
                email: {
                    // eq是精确查找
                    [Op.eq]: `%${query.email}%`,
                }
            }
        }
        if (query.username) {
            condition.where = {
                username: {
                    [Op.eq]: query.username
                }
            };
        }
        if (query.nickname) {
            condition.where = {
                nickname: {
                    [Op.like]: `%${ query.nickname }%`
                }
            };
        }
        if (query.role) {
            condition.where = {
                role: {
                    [Op.eq]: query.role
                }
            };
        }
        const {count,rows} = await User.findAndCountAll(condition);
        res.json( {
            status: 'true',
            message: '查询成功',
            data: {
                users: rows,
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
// 查找用户详情
router.get('/:id', async function(req, res, next) {
    try {
        const users = await getUsers(req);
        success(res,'用户查找成功', {users})
    } catch (error) {
        failure(res, error);
    }
})
// 新增用户
router.post('/', async function(req, res, next) {
    try {
        // 将新增参数进行过滤
        const body = filterBody(req)
        const user = await User.create(body);
        success(res, '用户新增成功', {user}, 201)

    } catch (error) {
        failure(res, error);
    }
})
// 修改用户
router.put('/:id', async function(req, res, next) {
    try{
        const users = await getUsers(req)
        const body = filterBody(req)
        await users.update(body)
        success(res, '用户更新成功', {users}, 201)
    } catch (error) {
        failure(res, error);
    }
})
// 公共查询方法
async function getUsers(req) {
    const {id} = req.params;
    const users = await User.findByPk(id)
    if(!users) {
        throw new NotFoundError(`ID:${id}的用户未找到`)
    }
    return users;
}
// 提取用户请求的参数
/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{password, role: (number|string|*), introduce: ({type: *}|*), sex: ({allowNull: boolean, type: *, validate: {notNull: {msg: string}, notEmpty: {msg: string}, isIn: {args: [number[]], msg: string}}}|{defaultValue: number, allowNull: boolean, type: *}|*), nickname: (string|*), company: ({type: *}|*), avatar: ({type: *, validate: {isUrl: {msg: string}}}|*), email: (string|*), username}}
 */
function filterBody(req) {
    return {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        nickname: req.body.nickname,
        sex: req.body.sex,
        company: req.body.company,
        introduce: req.body.introduce,
        role: req.body.role,
        avatar: req.body.avatar
    };
}

module.exports = router;
