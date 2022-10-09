'use strict';

import FixedDensityPDS from './implementations/fixed-density.ts';
import VariableDensityPDS from './implementations/variable-density.ts';
import { ImplementationI, OptionsI, PointI, RandomFloatFn } from './types.ts';

class PoissonDiskSampling implements ImplementationI {
	shape: number[];
	implementation: ImplementationI;

	/**
	 * PoissonDiskSampling constructor
	 * @param {object} options Options
	 * @param {Array} options.shape Shape of the space
	 * @param {float} options.minDistance Minimum distance between each points
	 * @param {float} [options.maxDistance] Maximum distance between each points, defaults to minDistance * 2
	 * @param {int} [options.tries] Number of times the algorithm will try to place a point in the neighbourhood of another points, defaults to 30
	 * @param {function|null} [options.distanceFunction] Function to control the distance between each point depending on their position, must return a value between 0 and 1
	 * @param {function|null} [options.bias] When using a distanceFunction, will indicate which point constraint takes priority when evaluating two points (0 for the lowest distance, 1 for the highest distance), defaults to 0
	 * @param {function|null} [rng] RNG function, defaults to Math.random
	 * @constructor
	 */
	constructor(options: OptionsI, rng: RandomFloatFn = Math.random) {
		this.shape = options.shape;
		if (typeof options.distanceFunction === 'function') {
			this.implementation = new VariableDensityPDS(options, rng);
		} else {
			this.implementation = new FixedDensityPDS(options, rng);
		}
	}

	/**
	 * Add a totally random point in the grid
	 * @returns {Array} The point added to the grid
	 */
	addRandomPoint() {
		return this.implementation.addRandomPoint();
	}

	/**
	 * Add a given point to the grid
	 * @param {Array} point Point
	 * @returns {Array|null} The point added to the grid, null if the point is out of the bound or not of the correct dimension
	 */
	addPoint(point: PointI) {
		return this.implementation.addPoint(point);
	}

	/**
	 * Try to generate a new point in the grid, returns null if it wasn't possible
	 * @returns {Array|null} The added point or null
	 */
	next() {
		return this.implementation.next();
	}

	/**
	 * Automatically fill the grid, adding a random point to start the process if needed.
	 * Will block the thread, probably best to use it in a web worker or child process.
	 * @returns {Array[]} Sample points
	 */
	fill() {
		return this.implementation.fill();
	}

	/**
	 * Get all the points in the grid.
	 * @returns {Array[]} Sample points
	 */
	getAllPoints() {
		return this.implementation.getAllPoints();
	}

	/**
	 * Get all the points in the grid along with the result of the distance function.
	 * @throws Will throw an error if a distance function was not provided to the constructor.
	 * @returns {Array[]} Sample points with their distance function result
	 */
	getAllPointsWithDistance() {
		return this.implementation.getAllPointsWithDistance();
	}

	/**
	 * Reinitialize the grid as well as the internal state
	 */
	reset() {
		this.implementation.reset();
	}
}

export default PoissonDiskSampling;
