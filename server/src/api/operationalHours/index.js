'use strict';

var express = require('express');
var controller = require('./operationalHours.controller');

var router = express.Router();

router.get('/', controller.todaysHours);
router.get('/:date', controller.show);

module.exports = router;
