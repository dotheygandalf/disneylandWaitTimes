var mongoose = require('mongoose')
  , config = require('./config')
  , recordWaitTimes = require('./server/src/service/recordWaitTimes');

mongoose.connect(config.mongodb.url);
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
	recordWaitTimes.start();
});
