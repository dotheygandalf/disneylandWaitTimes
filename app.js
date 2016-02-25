
'use strict';

var mongoose = require('mongoose')
  , express = require('express')
  , bodyParser = require('body-parser')
  , config = require('./config')
  , recordWaitTimes = require('./server/src/service/recordWaitTimes')
  , path = require('path')
  , DisneyAPI = require("wdwjs")
  , jade = require('jade')
  , MagicKingdom = new DisneyAPI.DisneylandMagicKingdom()
  , CaliforniaAdventure = new DisneyAPI.DisneylandCaliforniaAdventure();

var DISNEYLAND = 'disneyland'
  , CALIFORNIA_ADVENTURE = 'california_adventure';

mongoose.connect(config.mongodb.url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
  if(app.get('env') === 'production') {
    recordWaitTimes.start(MagicKingdom, DISNEYLAND);
    recordWaitTimes.start(CaliforniaAdventure, CALIFORNIA_ADVENTURE);
  }
});

var app = express();
var server = require('http').createServer(app);
app.set('appPath', path.join(config.root, 'bin'));
app.set('view engine', 'jade');
app.use(bodyParser.json())
app.use('/bower_components', express.static('bower_components'));
app.use('/client', express.static('client'));
app.use('/bin', express.static('bin'));

server.listen(config.port, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

require('./server/src/routes')(app);
