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

    var p = new Poisson([800, 400, 200], 20, 25, 10);
    p.fill();

    outputPng(p);
} else {
    var outputPng = function (sampling) {
        var array = zeros([sampling.shape[0], sampling.shape[1]], 'float32');
        var i = 0;

        sampling.samplePoints.forEach(function (point) {
            i++;
            array.set(Math.round(point[0]), Math.round(point[1]), 50 + (Math.cos(i / 50) + 1) * 205 / 2 | 0 /*(50 + (i % 600) / 3 | 0)*/);
        });

        save(array, 'png').pipe(process.stdout);
    };

    var p = new Poisson([900, 400], 8, 8, 20);
    p.fill();

    outputPng(p);
}








