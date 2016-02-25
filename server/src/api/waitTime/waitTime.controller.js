'use strict';

var WaitTime = require('./waitTime.model')
  , Ride = require('../ride/ride.model')
  , moment = require('moment')
  , _ = require('lodash');

exports.index = function(req, res) {
  Ride.find({
    enabled: true
  }).select('id').exec(function(error, rides) {
    var rideMatch = _.map(rides, function(ride) {
      return {
        id: ride.id
      };
    });
    var matchQuery = {
      date: {
        $gt: moment().startOf('day').toDate(),
        $lte: moment().endOf('day').toDate()
      }
    };
    if(rideMatch.length > 0) {
      matchQuery.$or = rideMatch;
    }
    WaitTime.aggregate([{
        $match: matchQuery
      }, {
        $sort: {
          date: 1
        }
      }, {
        $group: {
          _id: '$id',
          currentWaitTime: {
            $last: '$minutes'
          },
          name: {
            $first: '$name'
          },
          active: {
            $last: '$active'
          },
          fastPass: {
            $last: '$fastPass'
          },
          fastPassWindow: {
            $last: '$fastPassWindow'
          },
          park: {
            $first: '$park'
          },
          waitTimes: {
            $push: {
              minutes: '$minutes',
              date: '$date'
            }
          }
        }
    }, {
      $sort: {
        currentWaitTime: -1,
        active: -1
      }
    }]).exec(function(error, waitTimes) {
      if(error) {
        return handleError(res, error);
      }

      return res.status(200).json(waitTimes);
    });
  });
};

exports.optimalFastPass = function(req, res) {
  WaitTime.aggregate([{
    $match: {
      date: {
        $gte: moment().tz('America/Los_Angeles').startOf('day').toDate(),
        $lte: moment().tz('America/Los_Angeles').endOf('day').toDate()
      }
    }
  }, {
    $sort: {
      date: 1
    }
  }, {
    $group: {
      _id: '$id',
      currentWaitTime: {
        $last: '$minutes'
      },
      name: {
        $first: '$name'
      },
      active: {
        $last: '$active'
      },
      fastPass: {
        $last: '$fastPass'
      },
      fastPassWindow: {
        $last: '$fastPassWindow'
      }
    }
  }, {
    $match: {
      active: true,
      fastPass: true,
      'fastPassWindow.startDate': {
        $gt: moment().tz('America/Los_Angeles').toDate(),
        $lt: moment().tz('America/Los_Angeles').add(2, 'hours').toDate()
      }
    }
  }, {
    $sort: {
      'currentWaitTime': 1,
      'fastPassWindow.startDate': 1
    }
  }]).exec(function(error, waitTimes) {
    if(error) {
      return handleError(res, error);
    }
    res.status(200).json(waitTimes);
  });
};

exports.show = function(req, res) {
  WaitTime.find({
    id: req.params.id
  }).select('-_id -__v').exec(function(error, waitTimes) {
    if(error) {
      return handleError(res, error);
    }

    return res.status(200).json(waitTimes);
  });
};

function handleError(res, err, status) {
  return res.status(status || 500).json(err);
}
