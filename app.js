
'use strict';

var mongoose = require('mongoose')
  , express = require('express')
  , config = require('./config')
  , recordWaitTimes = require('./server/src/service/recordWaitTimes')
  , path = require('path');

mongoose.connect(config.mongodb.url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
	if(app.get('env') === 'production') {
		recordWaitTimes.start();
	}
});

var app = express();
var server = require('http').createServer(app);
app.set('appPath', path.join(config.root, 'client'));
app.use('/bower_components', express.static('bower_components'));
app.use('/client', express.static('client'));

server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

require('./server/src/routes')(app);
