var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');

var authRouter = require('./routes/auth');
var adminRouter = require('./routes/admin');
var studentRouter = require('./routes/student');
var auth = function(req,res,next) {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
};
var app = express();
var cors = require('cors');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
    secret: 'secretBoy',
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 10000}
}));

app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/student',studentRouter);

module.exports = app;
