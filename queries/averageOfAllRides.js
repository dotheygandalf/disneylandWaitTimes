db.getCollection('rides').aggregate([{
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
            },
            waitTimes: {
                $push: '$waitTimes'
            }
        }
    }, {
        $sort: {
            'average': -1
        }
    }]);