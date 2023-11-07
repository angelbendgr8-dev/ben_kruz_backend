require('dotenv').config();


require("./config/database").connect();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors =  require('cors');

var authRouter = require('./routes/authRoutes');
var homeRouter = require('./routes/homeRoute');
var videoRouter = require('./routes/VideoRoutes');
var settingRouter = require('./routes/settingsRoute');
var systemRouter = require('./routes/systemRoutes');
const errorHandler = require('./helpers/errorHandler');
const walletRouter = require('./routes/walletRoutes');
const notificationRouter = require('./routes/notifications');
const indexRouter = require('./routes');

var app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(cors({origin:'*'}))
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/',indexRouter );

app.use('/api', authRouter);
app.use('/api/home', homeRouter);
app.use('/api/videos', videoRouter);
app.use('/api/settings', settingRouter);
app.use('/api/system', systemRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/notifications', notificationRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });
app.use(errorHandler);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
