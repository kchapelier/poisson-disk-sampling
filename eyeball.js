"use strict";

var Poisson = require('./'),
    save = require('save-pixels'),
    zeros = require('zeros');

var outputPng = function (sampling) {
    var array = zeros([sampling.shape[0], sampling.shape[1]], 'float32');

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

var p = new Poisson([500, 200, 200], 20, 30, 10);
p.fill();

outputPng(p);











