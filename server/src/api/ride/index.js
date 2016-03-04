'use strict';

var express = require('express');
var controller = require('./ride.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.put('/:id', controller.update);

module.exports = router;
