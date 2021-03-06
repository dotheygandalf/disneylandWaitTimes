'use strict';

var WaitTime = require('./waitTime.model')
  , Ride = require('../ride/ride.model')
  , moment = require('moment')
  , _ = require('lodash')
  , q = require('q');

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
        $gt: moment().tz('America/Los_Angeles').startOf('day').toDate(),
        $lte: moment().tz('America/Los_Angeles').endOf('day').toDate()
      },
      active: true
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
  var limit = req.query.limit || 100;
  var offset = req.query.offset || 0;
  WaitTime.count().exec(function(error, count) {
    WaitTime.find({
      id: req.params.id
    }).sort({
      date: 1
    }).skip(offset).limit(limit).select('-_id -__v -park -id -name').exec(function(error, waitTimes) {
      if(error) {
        return handleError(res, error);
      }

      return res.status(200).json({
        id: req.params.id,
        count: count,
        limit: limit,
        offset: offset,
        waitTimes: waitTimes
      });
    });
  });
};

function waitTimesByRide(id, groupByQuery) {
  var deferred = q.defer();
  var groupBy = {};
  if(groupByQuery === 'hour') {
    groupBy.dayOfYear = {
      $dayOfYear:  '$localTime'
    };
    groupBy.year = {
      $year:  '$localTime'
    };
    groupBy.hour = {
      $hour: '$localTime'
    };
  } else if(groupByQuery === 'day') {
    groupBy.dayOfYear = {
      $dayOfYear:  '$localTime'
    };
    groupBy.year = {
      $year:  '$localTime'
    };
  } else if(groupByQuery === 'month') {
    groupBy.dayOfYear = {
      $month:  '$localTime'
    };
    groupBy.year = {
      $year:  '$localTime'
    };
  } else if(groupByQuery === undefined || groupByQuery === 'year') {
    groupBy.year = {
      $year:  '$localTime'
    };
  }

  WaitTime.aggregate([{
    $match: {
      id: id,
      active: true
    }
  }, {
    $project: {
      id: '$id',
      park: '$park',
      name: '$name',
      minutes: '$minutes',
      date: '$date',
      localTime: {
          $subtract: [ '$date', 8 * 60 * 60 * 1000] //convert to pacific time
      }
    }
  }, {
    $sort: {
        'localTime': 1
    }
  }, {
    $group: {
      _id: groupBy,
      waitTimes: {
        $push: {
          date: '$date',
          minutes: '$minutes'
        }
      },
      average: {
          $avg: '$minutes'
      },
      min: {
          $min: '$minutes'
      },
      max: {
          $max: '$minutes'
      }
    }
  }, {
    $sort: {
      '_id.year': -1,
      '_id.dayOfYear': -1
    }
  }]).exec(function(error, waitTimes) {
    if(error) {
      return deferred.reject(error);
    }
    return deferred.resolve(waitTimes);
  });
  return deferred.promise;
}

exports.dailyWaitTimes = function(req, res) {
  waitTimesByRide(req.params.id, req.query.groupBy).then(function(waitTimes) {
    return res.status(200).json(waitTimes);
  }, function(error) {
    return handleError(res, error);
  });
};

exports.ridesWithWaitTimes = function(req, res) {
  Ride.find({
    enabled: true
  }).exec(function(error, rides) {
    var promises = _.map(rides, function(ride) {
      var deferred = q.defer();
      waitTimesByRide(ride.id, 'hour').then(function(waitTimes) {
        return deferred.resolve({
          id: ride.id,
          name: ride.name,
          waitTimes: waitTimes
        });
      });
      return deferred.promise;
    });
    q.all(promises).then(function(rides) {
      return res.status(200).json(rides);
    });
  });
};

exports.waitTimeAveragesByDayOfWeek = function(req, res) {
  WaitTime.aggregate([{
    $match: {
      id: req.params.id,
      active: true
    }
  }, {
    $project: {
      id: '$id',
      park: '$park',
      name: '$name',

      minutes: '$minutes',
      date: '$date',
      localTime: {
          $subtract: [ '$date', 8 * 60 * 60 * 1000] //convert to pacific time
      },
      dayOfWeek: {
        $dayOfWeek: {
          $subtract: [ '$date', 8 * 60 * 60 * 1000] //convert to pacific time
        }
      }
    }
  }, {
    $sort: {
      localTime: 1
    }
  }, {
    $group: {
      _id: {
        '$dayOfWeek': '$localTime'
      },
      average: {
          $avg: '$minutes'
      },
      min: {
          $min: '$minutes'
      },
      max: {
          $max: '$minutes'
      }
    }
  }]).exec(function(error, dayOfWeek) {
    if(error) {
      return handleError(res, error);
    }
    return res.status(200).json(_.find(dayOfWeek, function(day) {
      return day._id == req.params.dayOfWeek;
    }));
  });
};

exports.allWaitTimeAveragesByDayOfWeek = function(req, res) {
  WaitTime.aggregate([{
    $match: {
      id: req.params.id,
      active: true
    }
  }, {
    $project: {
      id: '$id',
      park: '$park',
      name: '$name',

      minutes: '$minutes',
      date: '$date',
      localTime: {
          $subtract: [ '$date', 8 * 60 * 60 * 1000] //convert to pacific time
      }
    }
  }, {
    $sort: {
      localTime: 1
    }
  }, {
    $group: {
      _id: {
        '$dayOfWeek': '$localTime'
      },
      average: {
          $avg: '$minutes'
      },
      min: {
          $min: '$minutes'
      },
      max: {
          $max: '$minutes'
      }
    }
  }, {
    $sort: {
      _id: 1
    }
  }]).exec(function(error, dayOfWeek) {
    if(error) {
      return handleError(res, error);
    }
    return res.status(200).json(dayOfWeek);
  });
};

exports.averageParkWaitTime = function(req, res) {
  Ride.find({
    enabled: true
  }).select('id').exec(function(error, rides) {
    WaitTime.aggregate([{
      $match: {
        active: true,
        id: {
          $in: _.map(rides, 'id')
        }
      }
    }, {
      $project: {
        id: '$id',
        park: '$park',
        name: '$name',

        minutes: '$minutes',
        date: '$date',
        localTime: {
            $subtract: [ '$date', 8 * 60 * 60 * 1000] //convert to pacific time
        }
      }
    }, {
      $sort: {
        localTime: 1
      }
    }, {
      $group: {
        _id: {
          $dayOfYear: '$localTime'
        },
        average: {
            $avg: '$minutes'
        },
        min: {
            $min: '$minutes'
        },
        max: {
            $max: '$minutes'
        }
      }
    }, {
      $sort: {
        _id: 1
      }
    }]).exec(function(error, dayOfWeek) {
      if(error) {
        return handleError(res, error);
      }
      return res.status(200).json(dayOfWeek);
    });
  });
};

function handleError(res, err, status) {
  return res.status(status || 500).json(err);
}
