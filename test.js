var moment = require('moment');

require('moment-timezone');
console.log('Check time at:' + new moment().tz('America/Los_Angeles').format('ddd, h:mmA'));