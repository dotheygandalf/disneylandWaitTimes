'use strict';

var express = require('express');
var controller = require('./ride.controller');

var router = express.Router();

router.get('/', controller.sparkline);
router.get('/statistics/:dayOfWeek', controller.statistics);
router.get('/:id', controller.show);

module.exports = router;
