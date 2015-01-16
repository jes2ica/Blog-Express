
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var settings = require('./settings');
var flash = require('connect-flash');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var methodOverride = require('method-override');
var multer = require('multer');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
// 设置视图模板引擎为 ejs
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.cookieParser());
app.use(session({
  secret: settings.cookieSecret,
  saveUninitialized: true,
  resave: true,
  key: settings.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  store: new MongoStore({
    db: settings.db,
    host: settings.host,
    port: settings.port
  })
}));
app.use(flash());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(multer({
  dest: './public/images',
  rename: function (fieldname, filename) {
    return filename;
  }
}))

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

app.get('/reg',routes.checkNotLogin);
app.get('/reg',routes.reg);
app.post('/reg',routes.checkNotLogin);
app.post('/reg',routes.reg_post);

app.get('/login',routes.checkNotLogin);
app.get('/login',routes.login);
app.post('/login',routes.checkNotLogin);
app.post('/login',routes.login_post);

app.get('/post',routes.checkLogin);
app.get('/post',routes.post);

app.post('/post',routes.checkLogin);
app.post('/post',routes.post_post);

app.get('/logout',routes.checkLogin);
app.get('/logout',routes.logout);

app.get('/upload',routes.checkLogin);
app.get('/upload',routes.upload);
app.post('/upload',routes.checkLogin);
app.post('/upload',routes.upload_post);

app.get('/u/:name', routes.user_posts);
app.get('/u/:name/:day/:title', routes.title_post);

app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
