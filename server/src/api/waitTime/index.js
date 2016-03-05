'use strict';

var express = require('express');
var controller = require('./waitTime.controller');

var router = express.Router();

router.get('/rides', controller.index);
router.get('/rides/summary', controller.ridesWithWaitTimes);
router.get('/rides/optimal', controller.optimalFastPass);
router.get('/rides/:id', controller.dailyWaitTimes);
router.get('/rides/:id/days/:dayOfWeek', controller.waitTimeAveragesByDayOfWeek);
router.get('/rides/:id/days', controller.allWaitTimeAveragesByDayOfWeek);
router.get('/rides/:id', controller.show);
router.get('/parks', controller.averageParkWaitTime);

module.exports = router;
