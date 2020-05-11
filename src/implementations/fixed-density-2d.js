"use strict";

/**
 * The code below is experimental and not shipped to NPM.
 *
 * This is a baseline implementation for a 2d-only fixed density poisson disk sampling.
 *
 */

var tinyNDArray = require('../tiny-ndarray').integer,
    getNeighbourhood = require('../neighbourhood');

const epsilon = 2e-14;

/**
 * FixedDensityPDS constructor
 * @param {object} options Options
 * @param {Array} options.shape Shape of the space
 * @param {float} options.minDistance Minimum distance between each points
 * @param {int} [options.tries] Number of times the algorithm will try to place a point in the neighbourhood of another points, defaults to 30
 * @param {function|null} [rng] RNG function, defaults to Math.random
 * @constructor
 */
function FixedDensityPDS (options, rng) {
    if (typeof options.distanceFunction === 'function') {
        throw new Error('PoissonDiskSampling: Tried to instantiate the fixed density implementation with a distanceFunction');
    }

    this.shape = options.shape;
    this.minDistance = options.minDistance;
    this.maxTries = Math.ceil(Math.max(1, options.tries || 30));

    this.rng = rng || Math.random;

    this.squaredMinDistance = this.minDistance * this.minDistance;
    this.minDistancePlusEpsilon = this.minDistance + epsilon;
    this.cellSize = this.minDistance / Math.sqrt(2);

    this.neighbourhood = getNeighbourhood(2);

    //console.log(this.neighbourhood);

    this.currentPoint = null;
    this.processList = [];
    this.samplePoints = [];

    // cache grid

    this.gridShape = [
        Math.ceil(this.shape[0] / this.cellSize),
        Math.ceil(this.shape[1] / this.cellSize)
    ];

    this.grid = tinyNDArray(this.gridShape); //will store references to samplePoints
}

FixedDensityPDS.prototype.shape = null;
FixedDensityPDS.prototype.minDistance = null;
FixedDensityPDS.prototype.minDistancePlusEpsilon = null;
FixedDensityPDS.prototype.squaredMinDistance = null;
FixedDensityPDS.prototype.cellSize = null;
FixedDensityPDS.prototype.maxTries = null;
FixedDensityPDS.prototype.rng = null;
FixedDensityPDS.prototype.neighbourhood = null;

FixedDensityPDS.prototype.currentPoint = null;
FixedDensityPDS.prototype.processList = null;
FixedDensityPDS.prototype.samplePoints = null;
FixedDensityPDS.prototype.gridShape = null;
FixedDensityPDS.prototype.grid = null;

/**
 * Add a totally random point in the grid
 * @returns {Array} The point added to the grid
 */
FixedDensityPDS.prototype.addRandomPoint = function () {
    return this.directAddPoint([
        this.rng() * this.shape[0],
        this.rng() * this.shape[1]
    ]);
};

/**
 * Add a given point to the grid
 * @param {Array} point Point
 * @returns {Array|null} The point added to the grid, null if the point is out of the bound or not of the correct dimension
 */
FixedDensityPDS.prototype.addPoint = function (point) {
    var valid = point.length === 2 && point[0] >= 0 && point[0] <= this.shape[0] && point[1] >= 0 && point[1] <= this.shape[1];

    return valid ? this.directAddPoint(point) : null;
};

/**
 * Add a given point to the grid, without any check
 * @param {Array} point Point
 * @returns {Array} The point added to the grid
 * @protected
 */
FixedDensityPDS.prototype.directAddPoint = function (point) {
    this.processList.push(point);
    this.samplePoints.push(point);

    var internalArrayIndex = ((point[0] / this.cellSize) | 0) * this.grid.stride[0] + ((point[1] / this.cellSize) | 0);

    this.grid.data[internalArrayIndex] = this.samplePoints.length; // store the point reference

    return point;
};

/**
 * Check whether a given point is in the neighbourhood of existing points
 * @param {Array} point Point
 * @returns {boolean} Whether the point is in the neighbourhood of another point
 * @protected
 */
FixedDensityPDS.prototype.inNeighbourhood = function (point) {
    var dimensionNumber = 2,
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

            if (currentDimensionValue < 0 || currentDimensionValue >= this.gridShape[dimension]) {
                internalArrayIndex = -1;
                break;
            }

            internalArrayIndex += currentDimensionValue * stride[dimension];
        }

        if (internalArrayIndex !== -1 && this.grid.data[internalArrayIndex] !== 0) {
            existingPoint = this.samplePoints[this.grid.data[internalArrayIndex] - 1];

            if (Math.pow(point[0] - existingPoint[0], 2) + Math.pow(point[1] - existingPoint[1], 2) < this.squaredMinDistance) {
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
FixedDensityPDS.prototype.next = function () {
    var tries,
        angle,
        distance,
        currentPoint,
        newPoint,
        inShape,
        i;

    var pi2 = Math.PI * 2;
    var angleIncrement = 1 / this.maxTries * pi2;

    while (this.processList.length > 0) {
        if (this.currentPoint === null) {
            this.currentPoint = this.processList.shift();
        }

        currentPoint = this.currentPoint;

        angle = this.rng() * pi2;

        for (tries = 0; tries < this.maxTries; tries++) {
            inShape = true;

            newPoint = [
                Math.cos(angle),
                Math.sin(angle)
            ];

            for (i = 0; inShape && i < 2; i++) {
                newPoint[i] = currentPoint[i] + newPoint[i] * this.minDistancePlusEpsilon;
                inShape = (newPoint[i] >= 0 && newPoint[i] <= this.shape[i] - 1)
            }

            if (inShape && !this.inNeighbourhood(newPoint)) {
                return this.directAddPoint(newPoint);
            }

            angle += angleIncrement;
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
FixedDensityPDS.prototype.fill = function () {
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
FixedDensityPDS.prototype.getAllPoints = function () {
    return this.samplePoints;
};

/**
 * Get all the points in the grid along with the result of the distance function.
 * @throws Will always throw an error.
 */
FixedDensityPDS.prototype.getAllPointsWithDistance = function () {
    throw new Error('PoissonDiskSampling: getAllPointsWithDistance() is not available in fixed-density implementation');
};

/**
 * Reinitialize the grid as well as the internal state
 */
FixedDensityPDS.prototype.reset = function () {
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

module.exports = FixedDensityPDS;
