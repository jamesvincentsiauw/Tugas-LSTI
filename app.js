var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var studentRouter = require('./routes/student');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', function (res) {
    let ret = {
        status: 200,
        message: 'Maaf, resources yang Anda cari tidak ada disini'
    };
    res.statusCode=200;
    res.message=ret;
    res.send(ret)
});
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/student',studentRouter);

module.exports = app;