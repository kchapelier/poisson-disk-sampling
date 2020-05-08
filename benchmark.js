"use strict";

function toMs (time) {
    return (time[0] * 1000 + time[1] / 1000000);
}

var Poisson = require('./'),
    time, p, i, s;

// warmup
s = 0;
for (i = 0; i < 10; i++) {
    p = new Poisson({
        shape: [800, 400],
        minDistance: 10,
        maxDistance: 12,
        tries: 10
    });
    s+= p.fill().length;
}

console.log();

/*
// [125x125x125x125 minDist 8 maxDist 8 retries 20]
time = process.hrtime();
s = 0;
for (i = 0; i < 8; i++) {
    p = new Poisson({
        shape: [125, 125, 125, 125],
        minDistance: 8,
        maxDistance: 8,
        tries: 20,
        noCheckOrder: false
    });
    p.addPoint([50, 50, 50, 50]);
    s+= p.fill().length;
}
time = process.hrtime(time);
console.log('[125x125x125x125 minDist 8 maxDist 8 retries 20 checkorder]: ' + (toMs(time) / 8).toFixed(3) + 'ms for ~' + (s/8|0)+' points');

// [125x125x125x125 minDist 8 maxDist 8 retries 20]
time = process.hrtime();
s = 0;
for (i = 0; i < 8; i++) {
    p = new Poisson({
        shape: [125, 125, 125, 125],
        minDistance: 8,
        maxDistance: 8,
        tries: 20,
        noCheckOrder: true
    });
    p.addPoint([50, 50, 50, 50]);
    s+= p.fill().length;
}
time = process.hrtime(time);
console.log('[125x125x125x125 minDist 8 maxDist 8 retries 20 nocheckorder]: ' + (toMs(time) / 8).toFixed(3) + 'ms for ~' + (s/8|0)+' points');
*/

/*
// [400x400x400 minDist 8 maxDist 8 retries 20]
time = process.hrtime();
s = 0;
for (i = 0; i < 8; i++) {
    p = new Poisson({
        shape: [400, 400, 400],
        minDistance: 8,
        maxDistance: 8,
        tries: 20,
        noCheckOrder: false
    });
    p.addPoint([200, 200, 200]);
    s+= p.fill().length;
}
time = process.hrtime(time);
console.log('[400x400x400 minDist 8 maxDist 8 retries 20 checkorder]: ' + (toMs(time) / 8).toFixed(3) + 'ms for ~' + (s/8|0)+' points');

// [400x400x400 minDist 8 maxDist 8 retries 20]
time = process.hrtime();
s = 0;
for (i = 0; i < 8; i++) {
    p = new Poisson({
        shape: [400, 400, 400],
        minDistance: 8,
        maxDistance: 8,
        tries: 20,
        noCheckOrder: true
    });
    p.addPoint([200, 200, 200]);
    s+= p.fill().length;
}
time = process.hrtime(time);
console.log('[400x400x400 minDist 8 maxDist 8 retries 20 nocheckorder]: ' + (toMs(time) / 8).toFixed(3) + 'ms for ~' + (s/8|0)+' points');
*/

// [800x800 minDist 8 maxDist 8 retries 20]
time = process.hrtime();
s = 0;
for (i = 0; i < 8; i++) {
    p = new Poisson({
        shape: [4000, 4000],
        minDistance: 8.9471,
        maxDistance: 8.9471,
        tries: 20,
        noCheckOrder: false
    });
    p.addPoint([2000, 2000]);
    s+= p.fill().length;
}
time = process.hrtime(time);
console.log('[4000x4000 minDist 8 maxDist 8 retries 20 checkorder]: ' + (toMs(time) / 8).toFixed(3) + 'ms for ~' + (s/8|0)+' points');

//544.598ms for ~154830 points
/*
// [800x800 minDist 8 maxDist 8 retries 20]
time = process.hrtime();
s = 0;
for (i = 0; i < 8; i++) {
    p = new Poisson({
        shape: [4000, 4000],
        minDistance: 8,
        maxDistance: 8,
        tries: 20,
        noCheckOrder: true
    });
    p.addPoint([2000, 2000]);
    s+= p.fill().length;
}
time = process.hrtime(time);
console.log('[4000x4000 minDist 8 maxDist 8 retries 20 nocheckorder]: ' + (toMs(time) / 8).toFixed(3) + 'ms for ~' + (s/8|0)+' points');
*/


var Poisson2D = require('./src/implementations/fixed-density-2d')

// [800x800 minDist 8 maxDist 8 retries 20]
time = process.hrtime();
s = 0;
for (i = 0; i < 8; i++) {
    p = new Poisson2D({
        shape: [4000, 4000],
        minDistance: 9.115,
        maxDistance: 9.115,
        tries: 20,
        noCheckOrder: false
    });
    p.addPoint([2000, 2000]);
    s+= p.fill().length;
}
time = process.hrtime(time);
console.log('[4000x4000 minDist 8 maxDist 8 retries 20 checkorder]: ' + (toMs(time) / 8).toFixed(3) + 'ms for ~' + (s/8|0)+' points');


console.log();