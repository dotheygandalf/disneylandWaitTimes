'use strict';

var _ = require('lodash');
var Ride = require('./ride.model');

exports.index = function(req, res) {
  if(req.query.metrics === 'true') {
    Ride.aggregate([{
        $unwind: '$waitTimes'
    }, {
        $project: {
            id: 1,
            name: 1,
            waitTimes: 1
        }
    },{
        $group: {
            _id: '$id',
            id: {
                $first: '$id'
            },
            name: {
                $first: '$name'
            },
            average: {
                $avg: '$waitTimes.minutes'
            },
            minimum: {
                $min: '$waitTimes.minutes'
            },
            maximum: {
                $max: '$waitTimes.minutes'
            }
        }
    }, {
        $sort: {
            'average': -1
        }
    }]).exec(function(err, rides) {
      if(err) { return handleError(res, err); }
      return res.status(200).json(rides);
    });
  } else {
    Ride.find({}).select('-_id -waitTimes -__v').exec(function (err, rides) {
      if(err) { return handleError(res, err); }
      return res.status(200).json(rides);
    });
  }
};