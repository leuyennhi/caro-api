var createError = require('http-errors');
const bodyParser = require('body-parser');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var cors = require('cors');

var app = express();
app.use(cors());

require('./config/passport')(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Set up mongoose connection
var mongoose = require('mongoose');
var dev_db_url = 'mongodb+srv://user:123@cluster0-c2v3u.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect(dev_db_url, { useNewUrlParser: true }).then(() => {
  console.log("Successfully connected to the database");
}).catch(err => {
  console.log('Couldn\'t connect to the database. Exiting now...', err);
  process.exit();
});

mongoose.Promise = global.Promise;

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session()); 

require('./routes/user')(app, passport);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.get('*', (req, res) => {
  res.json({ message: 'Caro-api app' });
}); 

module.exports = app;
