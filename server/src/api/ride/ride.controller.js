'use strict';

var _ = require('lodash')
  , Ride = require('./ride.model')
  , moment = require('moment');

exports.index = function(req, res) {
  if (req.query.metrics === 'true') {
    Ride.aggregate([{
      $unwind: '$waitTimes'
    }, {
      $project: {
        id: 1,
        name: 1,
        waitTimes: 1
      }
    }, {
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
      if (err) {
        return handleError(res, err);
      }
      return res.status(200).json(rides);
    });
  } else {
    Ride.find({}).select('-_id -waitTimes -__v').exec(function(err, rides) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(200).json(rides);
    });
  }
};

exports.show = function(req, res) {
  if (!req.params.id) {
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
          $subtract: ['$waitTimes.date', 8 * 60 * 60 * 1000] //convert to pacific time
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
      if (err) {
        return handleError(res, err);
      }
      return res.status(200).json(days);
    });
  }
};

exports.statistics = function(req, res) {
  var dayOfWeek = parseInt(req.params.dayOfWeek, 10);
  if(!_.isNumber(dayOfWeek) || _.isNaN(dayOfWeek)) {
    return handleError(res, {
      error: 'Must be a number between 1-7.'
    });
  } else {
    Ride.aggregate([{
        $project: {
          waitTimes: 1,
          id: 1,
          name: 1
        },
      }, {
        $unwind: '$waitTimes'
      }, {
        $project: {
          id: 1,
          name: 1,
          waitTimes: 1,
          dayOfWeek: {
            $dayOfWeek: {
              $subtract: ['$waitTimes.date', 8 * 60 * 60 * 1000]
            }
          },
          week: {
            $week: {
              $subtract: ['$waitTimes.date', 8 * 60 * 60 * 1000]
            }
          }
        }
      }, {
        $match: {
          'dayOfWeek': {
            $eq: dayOfWeek
          }
        }
      }, {
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
          min: {
            $min: '$waitTimes.minutes'
          },
          max: {
            $max: '$waitTimes.minutes'
          }
        }
      }, {
        $sort: {
          'average': -1
        }
      }
    ]).exec(function(err, rides) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(200).json(rides);
    });
  }
}

exports.sparkline = function(req, res) {
  var daysFromToday = parseInt(req.query.daysFromToday);
  if(!_.isNumber(daysFromToday) || _.isNaN(daysFromToday)) {
    daysFromToday = 0;
  }
  Ride.aggregate([{
    $unwind: '$waitTimes'
  }, {
    $project: {
      id: 1,
      name: 1,
      waitTimes: 1
    }
  }, {
    $match: {
      'waitTimes.date': {
        $gte: moment().tz('America/Los_Angeles').subtract(daysFromToday, 'day').startOf('day').toDate(),
        $lte: moment().tz('America/Los_Angeles').subtract(daysFromToday, 'day').endOf('day').toDate()
      }
    }
  }, {
    $group: {
      _id: '$id',
      id: {
        $first: '$id'
      },
      name: {
        $first: '$name'
      },
      waitTime: {
        $push: '$waitTimes'
      },
      maxWaitTime: {
        $max: '$waitTimes.minutes'
      },
      active: {
        $last: '$waitTimes.active'
      },
      fastPass: {
        $last: '$waitTimes.fastPass'
      }
    }
  }, {
    $sort: {
      maxWaitTime: -1,
      active: 1
    }
  }]).exec(function(err, rides) {
    if (err) {
      return handleError(res, err);
    }
    return res.status(200).json(rides);
  });
}

function handleError(res, err, status) {
  return res.status(status || 500).json(err);
}
