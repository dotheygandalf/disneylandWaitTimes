db.getCollection('waittimes').aggregate([{
        $match: {
            id: '353355'
        }
    }, {
        $project: {
            id: 1,
            name: 1,
            minutes: 1,
            localTime: {
                $subtract: [ '$date', 8 * 60 * 60 * 1000] //convert to pacific time
            }
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
                $avg: '$minutes'
            },
            minimum: {
                $min: '$minutes'
            },
            maximum: {
                $max: '$minutes'
            }
        }
    }]);