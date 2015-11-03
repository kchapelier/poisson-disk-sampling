"use strict";

var Poisson = require('./'),
    save = require('save-pixels'),
    ndarray = require('ndarray');

var outputPng = function (sampling) {
    var data = new Float32Array(sampling.shape[0] * sampling.shape[1]),
        array = ndarray(data, [sampling.shape[0], sampling.shape[1]]);

    if (sampling.dimension === 2) {
        sampling.samplePoints.forEach(function (point) {
            array.set(Math.round(point[0]), Math.round(point[1]), 255);
        });
    } else {
        sampling.samplePoints.forEach(function (point) {
            array.set(Math.round(point[0]), Math.round(point[1]), 255 * Math.pow((1 + point[2]) / sampling.shape[2], 2));
        });
    }


    save(array, 'png').pipe(process.stdout);
};


var p = new Poisson([1000, 1000, 200], 29, 29.3, 3);

p.addRandomPoint();


var now = Date.now();

p.fill();

/*
console.log(Date.now() - now, 'ms');
console.log(p.samplePoints.length);
process.exit();
*/

outputPng(p);











