"use strict";

var tinyNDArray = require('./tiny-ndarray'),
    moore = require('moore'),
    sphereRandom = require('./sphere-random');

/**
 * Get the squared euclidean distance from two points of arbitrary, but equal, dimensions
 * @param {Array} point1
 * @param {Array} point2
 * @returns {number} Squared euclidean distance
 */
var squaredEuclideanDistance = function squaredEuclideanDistance (point1, point2) {
    var result = 0,
        i = 0;

    for (; i < point1.length; i++) {
        result += Math.pow(point1[i] - point2[i], 2);
    }

    return result;
};

/**
 * Get the neighbourhood ordered by distance, including the origin point
 * @param {int} dimensionNumber Number of dimensions
 * @returns {Array} Neighbourhood
 */
var getNeighbourhood = function getNeighbourhood (dimensionNumber) {
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
 * PoissonDiskSampling constructor
 * @param {Array} shape Shape of the space
 * @param {float} minDistance Minimum distance between each points
 * @param {float} [maxDistance] Maximum distance between each points, defaults to minDistance * 2
 * @param {int} [maxTries] Number of times the algorithm has to try to place a point in the neighbourhood of another points, defaults to 30
 * @param {function} distanceFunction Some function to calculate the distance, must return a number between 0 and 1, should be pure.
 * @param {function|null} [rng] RNG function, defaults to Math.random
 * @constructor
 */
var PoissonDiskSampling = function PoissonDiskSampling (shape, minDistance, maxDistance, maxTries, distanceFunction, rng) {
    maxDistance = maxDistance || minDistance * 2;

    this.shape = shape;
    this.dimension = this.shape.length;
    this.minDistance = minDistance;
    this.squaredMinDistance = minDistance * minDistance;
    this.deltaDistance = maxDistance - minDistance;
    this.cellSize = minDistance / Math.sqrt(this.dimension);
    this.maxTries = maxTries || 30;
    this.rng = rng || Math.random;

    this.distanceFunction = distanceFunction;

    this.neighbourhood = getNeighbourhood(this.dimension);

    this.currentPoint = null;
    this.processList = [];
    this.samplePoints = [];

    // cache grid

    this.gridShape = [];

    for (var i = 0; i < this.dimension; i++) {
        this.gridShape.push(Math.ceil(shape[i] / this.cellSize));
    }

    this.grid = tinyNDArray(this.gridShape); //will store references to samplePoints
};

PoissonDiskSampling.prototype.shape = null;
PoissonDiskSampling.prototype.dimension = null;
PoissonDiskSampling.prototype.minDistance = null;
PoissonDiskSampling.prototype.squaredMinDistance = null;
PoissonDiskSampling.prototype.deltaDistance = null;
PoissonDiskSampling.prototype.cellSize = null;
PoissonDiskSampling.prototype.maxTries = null;
PoissonDiskSampling.prototype.rng = null;
PoissonDiskSampling.prototype.neighbourhood = null;

PoissonDiskSampling.prototype.currentPoint = null;
PoissonDiskSampling.prototype.processList = null;
PoissonDiskSampling.prototype.samplePoints = null;
PoissonDiskSampling.prototype.gridShape = null;
PoissonDiskSampling.prototype.grid = null;

/**
 * Add a totally random point in the grid
 * @returns {Array} The point added to the grid
 */
PoissonDiskSampling.prototype.addRandomPoint = function () {
    var point = new Array(this.dimension);

    for (var i = 0; i < this.dimension; i++) {
        point[i] = this.rng() * this.shape[i];
    }

    return this.directAddPoint(point);
};

/**
 * Add a given point to the grid
 * @param {Array} point Point
 * @returns {Array|null} The point added to the grid, null if the point is out of the bound or not of the correct dimension
 */
PoissonDiskSampling.prototype.addPoint = function (point) {
    var dimension,
        valid = true;

    if (point.length === this.dimension) {
        for (dimension = 0; dimension < this.dimension && valid; dimension++) {
            valid = (point[dimension] >= 0 && point[dimension] <= this.shape[dimension]);
        }
    } else {
        valid = false;
    }

    return valid ? this.directAddPoint(point) : null;
};

/**
 * Add a given point to the grid, without any check
 * @param {Array} point Point
 * @returns {Array} The point added to the grid
 * @protected
 */
PoissonDiskSampling.prototype.directAddPoint = function (point) {
    var internalArrayIndex = 0,
        stride = this.grid.stride,
        dimension;

    this.processList.push(point);
    this.samplePoints.push(point);

    for (dimension = 0; dimension < this.dimension; dimension++) {
        internalArrayIndex += ((point[dimension] / this.cellSize) | 0) * stride[dimension];
    }

    this.grid.data[internalArrayIndex] = this.samplePoints.length; // store the point reference

    return point;
};

/**
 * Check whether a given point is in the neighbourhood of existing points
 * @param {Array} point Point
 * @returns {boolean} Whether the point is in the neighbourhood of another point
 * @protected
 */
PoissonDiskSampling.prototype.inNeighbourhood = function (point) {
    var dimensionNumber = this.dimension,
        stride = this.grid.stride,
        neighbourIndex,
        internalArrayIndex,
        dimension,
        currentDimensionValue,
        existingPoint;

    for (neighbourIndex = 0; neighbourIndex < this.neighbourhood.length; neighbourIndex++) {
        internalArrayIndex = 0;

        for (dimension = 0; dimension < dimensionNumber; dimension++) {
            currentDimensionValue = ((point[dimension] / this.cellSize) | 0) + this.neighbourhood[neighbourIndex][dimension];

            if (currentDimensionValue >= 0 && currentDimensionValue < this.gridShape[dimension]) {
                internalArrayIndex += currentDimensionValue * stride[dimension];
            }
        }

        if (this.grid.data[internalArrayIndex] !== 0) {
            existingPoint = this.samplePoints[this.grid.data[internalArrayIndex] - 1];

            if (squaredEuclideanDistance(point, existingPoint) < this.squaredMinDistance + this.deltaDistance * this.distanceFunction(existingPoint)) {
                return true;
            }
        }
    }

    return false;
};

/**
 * Try to generate a new point in the grid, returns null if it wasn't possible
 * @returns {Array|null} The added point or null
 */
PoissonDiskSampling.prototype.next = function () {
    var tries,
        angle,
        distance,
        currentPoint,
        newPoint,
        inShape,
        i;

    while (this.processList.length > 0) {
        if (this.currentPoint === null) {
            this.currentPoint = this.processList.shift();
        }

        currentPoint = this.currentPoint;

        for (tries = 0; tries < this.maxTries; tries++) {
            inShape = true;
            distance = this.minDistance + this.deltaDistance * (this.distanceFunction(currentPoint));

            if (this.dimension === 2) {
                angle = this.rng() * Math.PI * 2;
                newPoint = [
                    Math.cos(angle),
                    Math.sin(angle)
                ];
            } else {
                newPoint = sphereRandom(this.dimension, this.rng);
            }

            for (i = 0; inShape && i < this.dimension; i++) {
                newPoint[i] = currentPoint[i] + newPoint[i] * distance;
                inShape = (newPoint[i] >= 0 && newPoint[i] <= this.shape[i] - 1)
            }

            if (inShape && !this.inNeighbourhood(newPoint)) {
                return this.directAddPoint(newPoint);
            }
        }

        if (tries === this.maxTries) {
            this.currentPoint = null;
        }
    }

    return null;
};

/**
 * Automatically fill the grid, adding a random point to start the process if needed.
 * Will block the thread, probably best to use it in a web worker or child process.
 * @returns {Array[]} Sample points
 */
PoissonDiskSampling.prototype.fill = function () {
    if (this.samplePoints.length === 0) {
        this.addRandomPoint();
    }

    while(this.next()) {}

    return this.samplePoints;
};

/**
 * Get all the points in the grid.
 * @returns {Array[]} Sample points
 */
PoissonDiskSampling.prototype.getAllPoints = function () {
    return this.samplePoints;
};

/**
 * Reinitialize the grid as well as the internal state
 */
PoissonDiskSampling.prototype.reset = function () {
    var gridData = this.grid.data,
        i = 0;

    // reset the cache grid
    for (i = 0; i < gridData.length; i++) {
        gridData[i] = 0;
    }

    // new array for the samplePoints as it is passed by reference to the outside
    this.samplePoints = [];

    // reset the internal state
    this.currentPoint = null;
    this.processList.length = 0;
};

module.exports = PoissonDiskSampling;
