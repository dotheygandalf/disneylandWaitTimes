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
    }, {
        $match: {
            id: '353355'
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
            }
        }
    }, {
        $sort: {
            maximum: -1
        }
    }]);