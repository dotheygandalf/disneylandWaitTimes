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

exports.show = function(req, res) {
  if(!req.params.id) {
    return res.status(404);
  } else {
    Ride.aggregate([{
        $unwind: '$waitTimes'
    }, {
        $project: {
            id: 1,
            name: 1,
            waitTimes: 1,
            localTime: {
                $subtract: [ '$waitTimes.date', 8 * 60 * 60 * 1000] //convert to pacific time
            }
        }
    }, {
        $match: {
            id: req.params.id
        }
    }, {
        $group: {
            _id: {
                $dayOfYear: '$localTime'
            },
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
            },
            waitTimes: {
                $push: '$waitTimes'
            }
        }
    }, {
        $sort: {
            'waitTimes.date': -1
        }
    }]).exec(function(err, days) {
      if(err) { return handleError(res, err); }
      return res.status(200).json(days);
    });
  }
};

function handleError(res, err, status) {
  return res.send(status || 500, err);
}