"use strict";

var Poisson = require('./');

var p = new Poisson([2500, 2500], 17, 30);

p.addRandomPoint();


//var now = Date.now();

p.fill();

//console.log(Date.now() - now, 'ms');


//console.log(p.samplePoints);

//process.exit();

/*
 console.log(p.samplePoints);
 console.log(p.samplePoints.length);
 */

var save = require('save-pixels'),
    ndarray = require('ndarray');

var data = new Float32Array(p.shape[0] * p.shape[1]);
var array = ndarray(data, [p.shape[0], p.shape[1]]);

p.samplePoints.forEach(function (point) {
    array.set(Math.round(point[0]), Math.round(point[1]), 255); //255 * Math.pow((1 + point[2]) / p.shape[2], 2));
});

save(array, 'png').pipe(process.stdout);








