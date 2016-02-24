'use strict';

var WaitTime = require('./waitTime.model')
  , moment = require('moment');

exports.index = function(req, res) {
  WaitTime.aggregate([{
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
          }
      }
  }, {
    $sort: {
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
