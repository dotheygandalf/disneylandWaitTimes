'use strict';

var WaitTime = require('./waitTime.model')
  , moment = require('moment');

exports.index = function(req, res) {
  WaitTime.aggregate([{
      $match: {
          date: {
              $gt: new Date(new Date().setHours(0,0,0,0)),
              $lte: new Date(new Date().setHours(23,59,59,999))
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
