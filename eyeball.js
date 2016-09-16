"use strict";

var Poisson = require('./'),
    save = require('save-pixels'),
    zeros = require('zeros');

var dimensions = process.argv.length > 2 ? parseInt(process.argv[2], 10) : 2;

if (dimensions === 3) {
    var outputPng = function (sampling) {
        var array = zeros([sampling.shape[0], sampling.shape[1]], 'float32');

        sampling.samplePoints.forEach(function (point) {
            array.set(Math.round(point[0]), Math.round(point[1]), 255 * Math.pow((1 + point[2]) / sampling.shape[2], 2));
        });

        save(array, 'png').pipe(process.stdout);
    };

    var p = new Poisson([500, 200, 200], 20, 30, 10);
    p.fill();

    outputPng(p);
} else {
    var outputPng = function (sampling) {
        var array = zeros([sampling.shape[0], sampling.shape[1]], 'float32');

        sampling.samplePoints.forEach(function (point) {
            array.set(Math.round(point[0]), Math.round(point[1]), 255);
        });

        save(array, 'png').pipe(process.stdout);
    };

    var p = new Poisson([500, 200], 20, 30, 10);
    p.fill();

    outputPng(p);
}








