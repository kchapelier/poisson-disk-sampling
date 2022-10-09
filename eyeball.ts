'use strict';

import Poisson from './mod.ts';
import { PNG } from 'https://deno.land/x/imagescript@v1.2.14/utils/png.js';

function outputPng(sampling, drawFunc) {
	var png = new PNG({
		width: sampling.shape[0],
		height: sampling.shape[1],
		colortype: 6,
		inputHasAlpha: true,
		filterType: 4,
	});

	var pngData = new Uint8Array(png.data);

	drawFunc(sampling, pngData);

	for (var i = 3; i < pngData.length; i += 4) {
		pngData[i] = 255;
	}

	png.data = pngData;

	png.pack().pipe(Deno.stdout);
}

var dimensions = Deno.args.length ? parseInt(Deno.args[0], 10) : 2;

if (dimensions === 3) {
	var sampling = new Poisson({
		shape: [800, 400, 200],
		minDistance: 20,
		maxDistance: 25,
		tries: 20,
	});
	sampling.fill();

	outputPng(sampling, function (sampling, pngData) {
		sampling.getAllPoints().forEach(function (point) {
			var pixelIndex = (Math.ceil(point[0]) + Math.ceil(point[1]) * sampling.shape[0]) * 4;
			var intensity = (255 - 255 * Math.pow((1 + point[2]) / sampling.shape[2], 1.5)) | 0;
			pngData[pixelIndex] = pngData[pixelIndex + 1] = pngData[pixelIndex + 2] = intensity;
		});
	});
} else {
	var sampling = new Poisson({
		shape: [600, 600],
		minDistance: 8,
		maxDistance: 8,
		tries: 20,
	});
	sampling.fill();

	outputPng(sampling, function (sampling, pngData) {
		var i = 0;

		sampling.getAllPoints().forEach(function (point) {
			i++;
			var pixelIndex = (Math.floor(point[0]) + Math.floor(point[1]) * sampling.shape[0]) * 4;
			var intensity = (50 + ((Math.cos(i / 50) + 1) / 2) * 205) | 0;
			pngData[pixelIndex] = pngData[pixelIndex + 1] = pngData[pixelIndex + 2] = intensity;
		});
	});
}
