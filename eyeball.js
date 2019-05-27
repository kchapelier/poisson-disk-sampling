"use strict";

var Poisson = require('./');
var PNG = require('pngjs-nozlib').PNG;

function outputPng (sampling, drawFunc) {
  var png = new PNG({
    width: sampling.shape[0],
    height: sampling.shape[1],
    colortype: 6,
    inputHasAlpha: true,
    filterType: 4
  });

  var pngData = new Uint8Array(png.data);

  drawFunc(sampling, pngData);

  for (var i = 3; i < pngData.length; i+=4) {
    pngData[i] = 255;
  }

  png.data = pngData;

  png.pack().pipe(process.stdout);
}

var dimensions = process.argv.length > 2 ? parseInt(process.argv[2], 10) : 2;

if (dimensions === 3) {
  var sampling = new Poisson([800, 400, 200], 20, 25, 20);
  sampling.fill();

  outputPng(sampling, function (sampling, pngData) {
    sampling.samplePoints.forEach(function (point) {
      var idx = (Math.round(point[0]) + Math.round(point[1]) * sampling.shape[0]) * 4;
      var gray = 255 - 255 * Math.pow((1 + point[2]) / sampling.shape[2], 1.5) | 0;
      pngData[idx] = pngData[idx + 1] = pngData[idx + 2] = gray;
    });
  });
} else {
  var sampling = new Poisson([600, 600], 8, 8, 20);
  sampling.fill();

  outputPng(sampling, function (sampling, pngData) {
    var i = 0;

    sampling.samplePoints.forEach(function (point) {
      i++;
      var idx = (Math.round(point[0]) + Math.round(point[1]) * sampling.shape[0]) * 4;
      var gray = 50 + (Math.cos(i / 50) + 1) * 205 / 2 | 0;
      pngData[idx] = pngData[idx + 1] = pngData[idx + 2] = gray;
    });
  });
}








