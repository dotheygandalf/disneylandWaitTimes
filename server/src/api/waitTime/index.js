'use strict';

var express = require('express');
var controller = require('./waitTime.controller');

var router = express.Router();

router.get('/rides', controller.index);
router.get('/rides/:id', controller.show);

module.exports = router;