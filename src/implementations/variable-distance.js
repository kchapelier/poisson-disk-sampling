"use strict";

var tinyNDArray = require('./../tiny-ndarray').array,
    moore = require('moore'),
    sphereRandom = require('./../sphere-random');

/**
 * Get the euclidean distance from two points of arbitrary, but equal, dimensions
 * @param {Array} point1
 * @param {Array} point2
 * @returns {number} Euclidean distance
 */
function euclideanDistance (point1, point2) {
    var result = 0,
        i = 0;

    for (; i < point1.length; i++) {
        result += Math.pow(point1[i] - point2[i], 2);
    }

    return Math.sqrt(result);
}

/**
 * Get the neighbourhood ordered by distance, including the origin point
 * @param {int} dimensionNumber Number of dimensions
 * @returns {Array} Neighbourhood
 */
function getNeighbourhood (dimensionNumber) {
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
}


/**
 * VariableDistancePDS constructor
 * @param {object} options Options
 * @param {Array} options.shape Shape of the space
 * @param {float} options.minDistance Minimum distance between each points
 * @param {float} options.maxDistance Maximum distance between each points, defaults to minDistance * 2
 * @param {int} options.tries Number of times the algorithm will try to place a point in the neighbourhood of another points, defaults to 30
 * @param {function} options.distanceFunction Function
 * @param {float} options.bias Bias
 * @param {function} rng RNG function, defaults to Math.random
 * @constructor
 */
function VariableDistancePDS (options, rng) {
    this.shape = options.shape;
    this.minDistance = options.minDistance;
    this.maxDistance = options.maxDistance;
    this.maxTries = options.tries;
    this.distanceFunction = options.distanceFunction;
    this.bias = options.bias;

    this.rng = rng;

    this.dimension = this.shape.length;
    this.deltaDistance = this.maxDistance - this.minDistance;
    this.cellSize = this.maxDistance / Math.sqrt(this.dimension);

    this.neighbourhood = getNeighbourhood(this.dimension);

    this.currentPoint = null;
    this.currentDistance = 0;
    this.processList = [];
    this.samplePoints = [];
    this.sampleDistance = []; // used to store the distance for a given point

    // cache grid

    this.gridShape = [];

    for (var i = 0; i < this.dimension; i++) {
        this.gridShape.push(Math.ceil(this.shape[i] / this.cellSize));
    }

    this.grid = tinyNDArray(this.gridShape); //will store references to samplePoints and sampleDistance
}

VariableDistancePDS.prototype.shape = null;
VariableDistancePDS.prototype.dimension = null;
VariableDistancePDS.prototype.minDistance = null;
VariableDistancePDS.prototype.deltaDistance = null;
VariableDistancePDS.prototype.cellSize = null;
VariableDistancePDS.prototype.maxTries = null;
VariableDistancePDS.prototype.rng = null;
VariableDistancePDS.prototype.neighbourhood = null;

VariableDistancePDS.prototype.currentPoint = null;
VariableDistancePDS.prototype.currentDistance = null;
VariableDistancePDS.prototype.processList = null;
VariableDistancePDS.prototype.samplePoints = null;
VariableDistancePDS.prototype.gridShape = null;
VariableDistancePDS.prototype.grid = null;

/**
 * Add a totally random point in the grid
 * @returns {Array} The point added to the grid
 */
VariableDistancePDS.prototype.addRandomPoint = function () {
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
VariableDistancePDS.prototype.addPoint = function (point) {
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
VariableDistancePDS.prototype.directAddPoint = function (point) {
    var internalArrayIndex = 0,
        stride = this.grid.stride,
        pointIndex = this.samplePoints.length,
        dimension;

    this.processList.push(pointIndex);
    this.samplePoints.push(point);
    this.sampleDistance.push(this.distanceFunction(point));

    for (dimension = 0; dimension < this.dimension; dimension++) {
        internalArrayIndex += ((point[dimension] / this.cellSize) | 0) * stride[dimension];
    }

    this.grid.data[internalArrayIndex].push(pointIndex); // store the point reference

    return point;
};

/**
 * Check whether a given point is in the neighbourhood of existing points
 * @param {Array} point Point
 * @returns {boolean} Whether the point is in the neighbourhood of another point
 * @protected
 */
VariableDistancePDS.prototype.inNeighbourhood = function (point) {
    var dimensionNumber = this.dimension,
        stride = this.grid.stride,
        bias = this.bias,
        neighbourIndex,
        internalArrayIndex,
        dimension,
        currentDimensionValue,
        existingPoint,
        existingPointDistance;

    for (neighbourIndex = 0; neighbourIndex < this.neighbourhood.length; neighbourIndex++) {
        internalArrayIndex = 0;

        for (dimension = 0; dimension < dimensionNumber; dimension++) {
            currentDimensionValue = ((point[dimension] / this.cellSize) | 0) + this.neighbourhood[neighbourIndex][dimension];

            if (currentDimensionValue >= 0 && currentDimensionValue < this.gridShape[dimension]) {
                internalArrayIndex += currentDimensionValue * stride[dimension];
            }
        }

        if (this.grid.data[internalArrayIndex].length > 0) {
            for (var i = 0; i < this.grid.data[internalArrayIndex].length; i++) {
                existingPoint = this.samplePoints[this.grid.data[internalArrayIndex][i]];
                existingPointDistance = this.sampleDistance[this.grid.data[internalArrayIndex][i]];

                if (euclideanDistance(point, existingPoint) < this.minDistance + this.deltaDistance * existingPointDistance) { // apply bias and use 'point' distance
                    return true;
                }
            }
        }
    }

    return false;
};

/**
 * Try to generate a new point in the grid, returns null if it wasn't possible
 * @returns {Array|null} The added point or null
 */
VariableDistancePDS.prototype.next = function () {
    var tries,
        angle,
        distance,
        currentPoint,
        currentDistance,
        newPoint,
        inShape,
        i;

    while (this.processList.length > 0) {
        if (this.currentPoint === null) {
            var sampleIndex = this.processList.shift();
            this.currentPoint = this.samplePoints[sampleIndex];
            this.currentDistance = this.sampleDistance[sampleIndex];
        }

        currentPoint = this.currentPoint;
        currentDistance = this.currentDistance;

        for (tries = 0; tries < this.maxTries; tries++) {
            inShape = true;
            distance = this.minDistance + this.deltaDistance * currentDistance;

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
VariableDistancePDS.prototype.fill = function () {
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
VariableDistancePDS.prototype.getAllPoints = function () {
    return this.samplePoints;
};

/**
 * Reinitialize the grid as well as the internal state
 */
VariableDistancePDS.prototype.reset = function () {
    var gridData = this.grid.data,
        i = 0;

    // reset the cache grid
    for (i = 0; i < gridData.length; i++) {
        gridData[i] = [];
    }

    // new array for the samplePoints as it is passed by reference to the outside
    this.samplePoints = [];

    // reset the internal state
    this.currentPoint = null;
    this.processList.length = 0;
};

module.exports = VariableDistancePDS;
