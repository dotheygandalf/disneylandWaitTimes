db.getCollection('rides').aggregate([{
    $project: {
        waitTimes: 1,
        id: 1,
        name: 1
    },
}/*, {
    $match: {
        id: '353355'
    }
}*/, {
    $unwind: '$waitTimes'
}, {
    $project: {
        id: 1,
        name: 1,
        waitTimes: 1,
        dayOfWeek: {
            $dayOfWeek: {
                $subtract: [ '$waitTimes.date', 8 * 60 * 60 * 1000]
            }
        },
        week: { 
            $week: {
                $subtract: [ '$waitTimes.date', 8 * 60 * 60 * 1000]
            }
        }
    }
}, {
    $match: {
        'dayOfWeek': {
            $eq: 3
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
}])