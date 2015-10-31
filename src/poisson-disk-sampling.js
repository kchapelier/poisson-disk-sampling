"use strict";

var manhattanDistanceN = require('mathp/functions/manhattanDistanceN'),
    chebyshevDistanceN = require('mathp/functions/chebyshevDistanceN'),
    euclideanDistanceN = require('mathp/functions/euclideanDistanceN'),
    zeros = require('zeros'),
    moore = require('moore'),
    sphereRandom = require('sphere-random');

/**
 *
 * @param shape
 * @param minDistance
 * @param maxTries
 * @param rng
 * @constructor
 */
var Poisson = function (shape, minDistance, maxTries, rng) {
    this.shape = shape;
    this.minDistance = minDistance;
    this.cellSize = minDistance / Math.sqrt(shape.length);
    this.maxTries = maxTries || 30;
    this.rng = rng || Math.random;
    this.randomDistAmount = 1;

    this.distanceFunction = euclideanDistanceN;
    //this.distanceFunction = manhattanDistanceN; //FIXME does not work correctly, why ?

    this.neighbourhood = moore(2, this.shape.length);
    var origin = [];
    for (var dimension = 0; dimension < this.shape.length; dimension++) {
        origin.push(0);
    }
    this.neighbourhood.push(origin);

    this.currentPoint = null;
    this.processList = [];
    this.samplePoints = [];

    /* multidimension grid thing */
    this.gridShape = [];

    for (var i = 0; i < shape.length; i++) {
        this.gridShape.push(Math.ceil(shape[i] / this.cellSize));
    }
    //console.log(this.gridShape);
    this.grid = zeros(this.gridShape, 'uint32'); //first float is a flag for point presence
};

/**
 * Add a totally random point in the grid
 * @returns {*} The point added to the grid
 */
Poisson.prototype.addRandomPoint = function () {
    var point = new Array(this.shape.length);

    for (var i = 0; i < this.shape.length; i++) {
        point[i] = this.rng() * this.shape[i];
    }

    return this.addPoint(point);
};

/**
 * Add a given point to the grid
 * @param {array} point Point
 * @returns {*} The point added to the grid
 * @protected
 */
Poisson.prototype.addPoint = function (point) {
    this.processList.push(point);
    this.samplePoints.push(point);

    var internalArrayIndex = 0,
        stride = this.grid.stride,
        dimension,
        currentDimensionValue;

    for (dimension = 0; dimension < this.shape.length; dimension++) {
        internalArrayIndex += ((point[dimension] / this.cellSize) | 0) * stride[dimension];
    }

    this.grid.data[internalArrayIndex] = this.samplePoints.length; // store the point reference

    return point;
};

/**
 * Check whether a given is in the neighbourhood of existing points
 * @param {array} point Point
 * @param {number} minDist Minimum distance
 * @returns {boolean} Whether the point is in the neighbourhood of another point
 * @protected
 */
Poisson.prototype.inNeighbourhood = function (point, minDist) {

    /* */
    var dimensionNumber = this.shape.length,
        stride = this.grid.stride,
        neighbourIndex,
        internalArrayIndex,
        dimension,
        currentDimensionValue,
        existingPoint;

    //console.log('- - -');

    for (neighbourIndex = 0; neighbourIndex < this.neighbourhood.length; neighbourIndex++) {
        internalArrayIndex = 0;

        for (dimension = 0; dimension < dimensionNumber; dimension++) {
            currentDimensionValue = ((point[dimension] / this.cellSize) | 0) + this.neighbourhood[neighbourIndex][dimension];

            //console.log(point[dimension], currentDimensionValue, this.gridShape[dimension]);
            //console.log((point[dimension] / this.cellSize) | 0, this.neighbourhood[neighbourIndex][dimension], currentDimensionValue);

            if (currentDimensionValue >= 0 && currentDimensionValue < this.gridShape[dimension]) {
                internalArrayIndex += currentDimensionValue * stride[dimension];
            }
        }

        if (this.grid.data[internalArrayIndex] !== 0) {
            existingPoint = this.samplePoints[this.grid.data[internalArrayIndex] - 1];
            //console.log(internalArrayIndex, this.grid.data[internalArrayIndex], this.samplePoints.length, existingPoint);

            //console.log(point, existingPoint, this.distanceFunction(point, existingPoint), this.distanceFunction(point, existingPoint) < minDist);
            if (this.distanceFunction(point, existingPoint) < minDist) {
                return true;
            }
        }
    }



    /*/
    var i = (point[0] / this.cellSize) | 0,
        j = (point[1] / this.cellSize) | 0;

    var startI = Math.max(i - 2, 0),
        endI = Math.min(i + 2, this.gridWidth);

    var startJ = Math.max(j - 2, 0),
        endJ = Math.min(j + 2, this.gridHeight);

    for (i = startI; i <= endI; i++) {
        for (j = startJ; j <= endJ; j++) {
            var existingPoint = this.grid[j * this.gridWidth + i];

            if (existingPoint && this.distanceFunction(point, existingPoint) < minDist) {
                return true;
            }
        }
    }
    /* */

    return false;
};

// http://devmag.org.za/2009/05/03/poisson-disk-sampling/
// http://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf

/**
 * Try to place a new point in the grid, returns null if it wasn't possible
 * @returns {array|null} The added point or null
 */
Poisson.prototype.next = function () {
    var tries,
        angle,
        distance,
        currentPoint,
        newPoint,
        inShape;

    while (this.processList.length > 0) {
        if (this.currentPoint === null) {
            this.currentPoint = this.processList.shift(); //might want to extract randomly
        }

        currentPoint = this.currentPoint;

        for (tries = 0; tries < this.maxTries; tries++) {
            inShape = true;
            newPoint = sphereRandom(this.shape.length);
            distance = this.minDistance * (1 + this.rng());

            for (var i = 0; inShape && i < this.shape.length; i++) {
                newPoint[i] = currentPoint[i] + newPoint[i] * distance;
                inShape = (newPoint[i] >= 0 && newPoint[i] <= this.shape[i] - 1)
            }

            if (inShape && !this.inNeighbourhood(newPoint, this.minDistance)) {
                return this.addPoint(newPoint);
            }
        }

        if (tries >= this.maxTries) {
            this.currentPoint = null;
        }
    }

    return null;
};

/**
 * Automatically fill the grid, adding a random point to start the process if needed.
 * Will block the thread, probably best to use it in a web worker or child process.
 */
Poisson.prototype.fill = function () {
    if (this.processList.length === 0) {
        this.addRandomPoint();
    }

    while(this.next()) {}
};

Poisson.prototype.shape = null;
Poisson.prototype.minDistance = null;
Poisson.prototype.cellSize = null;
Poisson.prototype.processList = null;
Poisson.prototype.samplePoints = null;

module.exports = Poisson;
