'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var WaitTimeSchema = new mongoose.Schema({
  fastPass: Boolean,
  active: Boolean,
  minutes: Number,
  temperature: Number,
  humidity: Number,
  date: Date
});

module.exports = mongoose.model('WaitTime', WaitTimeSchema);