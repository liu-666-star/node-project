const express = require('express');
const router = express.Router();
const { sequelize, User } = require('../../models');
const { Op } = require('sequelize');
const {
    NotFoundError,
    success,
    failure
} = require('../../utils/responses');

/**
 * 统计用户性别
 * GET /admin/charts/sex
 */
router.get('/sex', async function (req, res) {
    try {
        const male = await User.count({where: {sex: 0}});
        const female = await User.count({where: {sex: 1}});
        const unknow = await User.count({where: {sex: 2}});
        const data = [{
            value: male,
            name: 'male'
        },
            {
                value: female,
                name: 'female'
            },
            {
                value: unknow,
                name: 'unknow'
            }
        ]
        success(res, '查询用户性别成功。', data);
    } catch (error) {
        failure(res, error);
    }
});
/**
 * 统计用户数量
 * GET /admin/charts/users
 */
router.get('/users', async function (req, res) {
    try{
        const [results] = await sequelize.query("SELECT DATE_FORMAT(`createdAt`,'%Y-%m') AS `month`, COUNT(*) AS `value` FROM `Users` GROUP BY `month` ORDER BY `month` ASC");
        const data =
            {
                months: [],
                values: []
            }
        results.forEach(result => {
            data.months.push(result.month);
            data.values.push(result.value);
        })
        success(res,'用户数据获取成功', {data})
    } catch (error) {
        failure(res, error)
    }
})
module.exports = router;
