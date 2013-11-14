//core libraries
var express = require('express');
var http = require('http');
var path = require('path');
var connect = require('connect');
var app = express();

//this route will serve as the data API (whether it is the API itself or a proxy to one)
var api = require('./routes/api');

//express configuration
app.set('port', process.env.PORT || 3000);

//Express.js intended for use as data style api so we don't need jade, only going to load index html file, everything else will be handled by angular
//app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.errorHandler({
  dumpExceptions: true, showStack: true
}));
app.use(connect.compress());

//setup url mappings
app.use('/components', express.static(__dirname + '/components'));
app.use('/app', express.static(__dirname + '/app'));

app.use(app.router);

require('./api-setup.js').setup(app, api);

app.get('*', function(req, res) {
  res.sendfile("index-dev.html");
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
