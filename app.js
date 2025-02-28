const cors = require('cors')
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();
const AdminAuth = require('./middlewares/admin-auth');
const UserAuth = require('./middlewares/user-auth');
// 前台
const indexRouter = require('./routes/index');
const categoryRouter = require('./routes/categories');
const courseRouter = require('./routes/courses');
const chapterRouter = require('./routes/chapters');
const articlesRouter = require('./routes/articles');
const settingsRouter = require('./routes/setting');
const SearchRouter = require('./routes/search');
const RegisterRouter = require('./routes/register');
const loginRouter = require('./routes/login');
const usersRouter = require('./routes/users');
const LikeRouter = require('./routes/likes');
// 后台文件
const adminArticlesRouter = require('./routes/admin/articles');
const adminCategoryRouter = require('./routes/admin/category');
const adminSettingRouter = require('./routes/admin/setting');
const adminUsersRouter = require('./routes/admin/users');
const adminCoursesRouter = require('./routes/admin/courses');
const adminChaptersRouter = require('./routes/admin/chapter');
// Echarts数据统计
const adminChartsRouter = require('./routes/admin/charts');
// 用户登陆
const adminLoginRouter = require('./routes/admin/auth');
const app = express();
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// 前台
app.use('/', indexRouter);
app.use('/category', categoryRouter);
app.use('/course', courseRouter);
app.use('/chapters', chapterRouter);
app.use('/articles', articlesRouter);
app.use('/settings', settingsRouter);
app.use('/search', SearchRouter);
app.use('/register', RegisterRouter);
app.use('/login', loginRouter);
app.use('/users', UserAuth, usersRouter);
app.use('/likes', UserAuth, LikeRouter);
// 后台文件
app.use('/admin/articles', AdminAuth, adminArticlesRouter);
app.use('/admin/category', AdminAuth, adminCategoryRouter);
app.use('/admin/settings', AdminAuth, adminSettingRouter);
app.use('/admin/users', AdminAuth, adminUsersRouter);
app.use('/admin/courses', AdminAuth, adminCoursesRouter);
app.use('/admin/chapters', AdminAuth, adminChaptersRouter);
app.use('/admin/charts',AdminAuth, adminChartsRouter);
app.use('/admin/login', adminLoginRouter);
module.exports = app;
