"use strict";

function toMs (time) {
    return (time[0] * 1000 + time[1] / 1000000);
}

var Poisson = require('./'),
    p, i, s;

// warmup
s = 0;
for (i = 0; i < 10; i++) {
    p = new Poisson({
        shape: [800, 400],
        minDistance: 10,
        maxDistance: 10,
        tries: 10
    });
    s+= p.fill().length;
}

function benchmark (shape, minDistance, maxDistance, tries, iterations) {
    var time = process.hrtime(),
        s = 0,
        p, i;

    for (i = 0; i < iterations; i++) {
        p = new Poisson({
            shape: shape,
            minDistance: minDistance,
            maxDistance: maxDistance,
            tries: tries
        });

        p.addPoint(shape.map(function (value) {
            return value / 2;
        }));

        s+= p.fill().length;
    }

    time = process.hrtime(time);

    console.log(
        '[' + shape.join('x') + ' minDist ' + minDistance + ' maxDist ' + maxDistance + ' retries ' + tries + ']: ' +
        (toMs(time) / iterations).toFixed(3) + 'ms for ~' + (s/iterations|0) + ' points'
    );
}

console.log();

benchmark([125, 125, 125, 125], 8, 8, 20, 8);
benchmark([400, 400, 400], 8, 8, 20, 8);
benchmark([4000, 4000], 8, 8, 20, 8);

console.log();