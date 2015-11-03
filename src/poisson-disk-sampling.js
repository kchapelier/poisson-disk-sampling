"use strict";

var manhattanDistanceN = require('mathp/functions/manhattanDistanceN'),
    chebyshevDistanceN = require('mathp/functions/chebyshevDistanceN'),
    euclideanDistanceN = require('mathp/functions/euclideanDistanceN'),
    zeros = require('zeros'),
    moore = require('moore'),
    sphereRandom = require('sphere-random');

var getNeighbourhood = function (dimensionNumber) {
    var neighbourhood = moore(2, dimensionNumber),
        origin = [],
        dimension;

    for (dimension = 0; dimension < dimensionNumber; dimension++) {
        origin.push(0);
    }

    neighbourhood.push(origin);

    // sort by ascending distance to optimize proximity checks
    // see point 5.1 in Parallel Poisson Disk Sampling by Li-Yi Wei, 2008
    // http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.460.3061&rank=1
    neighbourhood.sort(function (n1, n2) {
        var squareDist1 = 0,
            squareDist2 = 0;

        for (var dimension = 0; dimension < dimensionNumber; dimension++) {
            squareDist1 += Math.pow(n1[dimension], 2);
            squareDist2 += Math.pow(n2[dimension], 2);
        }

        if (squareDist1 < squareDist2) {
            return -1;
        } else if(squareDist1 > squareDist2) {
            return 1;
        } else {
            return 0;
        }
    });

    return neighbourhood;
};


/**
 *
 * @param shape
 * @param minDistance
 * @param maxTries
 * @param rng
 * @constructor
 */
var Poisson = function (shape, minDistance, maxDistance, maxTries, rng) {
    this.shape = shape;
    this.dimension = this.shape.length;
    this.minDistance = minDistance;
    this.maxDistance = maxDistance || minDistance * 2;
    this.deltaDistance = maxDistance - minDistance;
    this.cellSize = minDistance / Math.sqrt(this.dimension);
    this.maxTries = maxTries || 30;
    this.rng = rng || Math.random;
    this.randomDistAmount = 1;

    this.distanceFunction = euclideanDistanceN;
    //this.distanceFunction = manhattanDistanceN; //FIXME does not work correctly, why ?

    this.neighbourhood = getNeighbourhood(this.dimension);

    this.currentPoint = null;
    this.processList = [];
    this.samplePoints = [];

    /* multidimension grid thing */
    this.gridShape = [];

    for (var i = 0; i < this.dimension; i++) {
        this.gridShape.push(Math.ceil(shape[i] / this.cellSize));
    }

    this.grid = zeros(this.gridShape, 'uint32'); //will store references to samplePoints
};

/**
 * Add a totally random point in the grid
 * @returns {*} The point added to the grid
 */
Poisson.prototype.addRandomPoint = function () {
    var point = new Array(this.dimension);

    for (var i = 0; i < this.dimension; i++) {
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

    for (dimension = 0; dimension < this.dimension; dimension++) {
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
Poisson.prototype.inNeighbourhood = function (point) {
    var dimensionNumber = this.dimension,
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
            if (this.distanceFunction(point, existingPoint) < this.minDistance) {
                return true;
            }
        }
    }

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
            distance = this.minDistance + this.deltaDistance * this.rng();

            if (this.dimension === 2) {
                angle = this.rng() * Math.PI * 2;
                newPoint = [
                    Math.cos(angle),
                    Math.sin(angle)
                ]; // avoiding creating an array at each tries would be nice but would require changing the sphereRandom API
            } else {
                newPoint = sphereRandom(this.dimension);
            }

            for (var i = 0; inShape && i < this.dimension; i++) {
                newPoint[i] = currentPoint[i] + newPoint[i] * distance;
                inShape = (newPoint[i] >= 0 && newPoint[i] <= this.shape[i] - 1)
            }

            if (inShape && !this.inNeighbourhood(newPoint)) {
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
