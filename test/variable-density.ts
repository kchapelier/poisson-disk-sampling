'use strict';

import PDS from '../mod.ts';
import { expect, it, describe, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import verifyResultPoints from './utils/verify-result-points.ts';
import { PointI } from '../src/types.ts';

function makeDimensionArray<P>(dimensions: number, value: P): P[] {
	var array = [],
		dimension;

	for (dimension = 0; dimension < dimensions; dimension++) {
		array.push(value);
	}

	return array;
}

describe('PDS with variable density', function () {
	describe('Facade constructor', function () {
		it('should use the variable density implementation even if minDistance and maxDistance are equal', function () {
			var pds = new PDS({
				shape: [20, 20],
				minDistance: 4,
				maxDistance: 4,
				tries: 10,
				distanceFunction: Math.random,
			});
			pds.fill();

			expect(() => pds.getAllPointsWithDistance()).not.toThrow();
		});
	});

	describe('fill()', function () {
		it('should return an array of points', function () {
			var pds = new PDS({
					shape: [50, 30],
					minDistance: 4,
					maxDistance: 8,
					tries: 10,
					distanceFunction: Math.random,
				}),
				points = pds.fill();

			expect(points).toBeInstanceOf(Array);
			expect(points.length).toBeGreaterThan(1);
			expect(points[0]).toBeInstanceOf(Array);
		});

		it('should only generate points within the provided grid size', function () {
			var pds = new PDS({
					shape: [50, 30],
					minDistance: 4,
					maxDistance: 8,
					tries: 10,
					distanceFunction: Math.random,
				}),
				points = pds.fill();

			for (var i = 0; i < points.length; i++) {
				expect(points[i][0]).toBeGreaterThanOrEqual(0);
				expect(points[i][0]).toBeLessThanOrEqual(50);
				expect(points[i][1]).toBeGreaterThanOrEqual(0);
				expect(points[i][1]).toBeLessThanOrEqual(30);
			}
		});
	});

	describe('getAllPoints()', function () {
		it('should return an empty array after the instantiation', function () {
			var pds = new PDS({
					shape: [50, 30],
					minDistance: 4,
					maxDistance: 8,
					tries: 10,
					distanceFunction: Math.random,
				}),
				points = pds.getAllPoints();

			expect(points).toBeInstanceOf(Array);
			expect(points).toHaveLength(0);
		});

		it('should return an array of points after fill', function () {
			var pds = new PDS({
				shape: [50, 30],
				minDistance: 4,
				maxDistance: 8,
				tries: 10,
				distanceFunction: Math.random,
			});

			pds.fill();

			var points = pds.getAllPoints();

			expect(points).toBeInstanceOf(Array);
			expect(points.length).toBeGreaterThan(1);
			expect(points[0]).toBeInstanceOf(Array);
		});
	});

	describe('getAllPointsWithDistance()', function () {
		it('should return an empty array after the instantiation', function () {
			var pds = new PDS({
					shape: [30, 30],
					minDistance: 4,
					maxDistance: 8,
					tries: 10,
					distanceFunction: Math.random,
				}),
				points = pds.getAllPointsWithDistance();

			expect(points).toBeInstanceOf(Array);
			expect(points).toHaveLength(0);
		});

		it('should return the distance function result after the points coordinates on points added using fill()', function () {
			var pds = new PDS({
				shape: [30, 30],
				minDistance: 4,
				maxDistance: 8,
				tries: 10,
				distanceFunction: function () {
					return 0.4;
				},
			});

			var basePoints = pds.fill();

			var points = pds.getAllPointsWithDistance();

			expect(points).toHaveLength(basePoints.length);

			for (var i = 0; i < points.length; i++) {
				expect(points[i]).toHaveLength(3);
				expect(points[i][0]).toBe(basePoints[i][0]);
				expect(points[i][1]).toBe(basePoints[i][1]);
				expect(points[i][2]).toBe(0.4);
			}
		});

		it('should return the distance function result on points added manually', function () {
			var pds = new PDS({
				shape: [30, 30],
				minDistance: 4,
				maxDistance: 8,
				tries: 10,
				distanceFunction: function () {
					return 0.6;
				},
			});

			pds.addPoint([10, 10]);

			var points = pds.getAllPointsWithDistance();

			expect(points).toHaveLength(1);
			expect(points[0][2]).toBe(0.6);
		});
	});

	describe('addRandomPoint()', function () {
		it('should return a point within the provided grid size', function () {
			var pds = new PDS({
					shape: [50, 30],
					minDistance: 4,
					maxDistance: 8,
					tries: 10,
					distanceFunction: Math.random,
				}),
				point = pds.addRandomPoint();

			expect(point).toBeInstanceOf(Array);
			expect(point[0]).toBeGreaterThanOrEqual(0);
			expect(point[0]).toBeLessThanOrEqual(50);
			expect(point[1]).toBeGreaterThanOrEqual(0);
			expect(point[1]).toBeLessThanOrEqual(30);
		});

		it('should create a new point for each call', function () {
			var pds = new PDS({
					shape: [50, 30],
					minDistance: 4,
					maxDistance: 8,
					tries: 10,
					distanceFunction: Math.random,
				}),
				point1 = pds.addRandomPoint(),
				point2 = pds.addRandomPoint();

			expect(point1).not.toBe(point2); // not deep equal because the points MAY have the same coordinates
		});

		it('should ignore the distance constraints', function () {
			var pds = new PDS({
				shape: [2, 2],
				minDistance: 8,
				maxDistance: 8,
				tries: 10,
				distanceFunction: Math.random,
			});

			// there is not enough room in this grid for two points satisfying the distance constraints
			// however addRandomPoint doesn't check those constraints, therefore two points should be generated

			pds.addRandomPoint();
			pds.addRandomPoint();

			var points = pds.getAllPoints();

			expect(points).toHaveLength(2);
		});

		it('should be using the provided rng function', function () {
			var riggedRngCounter = 0;
			var riggedRng = function () {
				riggedRngCounter++;
				return 0.5;
			};

			var pds = new PDS(
					{
						shape: [50, 30],
						minDistance: 4,
						maxDistance: 8,
						tries: 10,
						distanceFunction: Math.random,
					},
					riggedRng,
				),
				point1 = pds.addRandomPoint(),
				point2 = pds.addRandomPoint();

			expect(riggedRngCounter).toBeGreaterThan(0); // confirm riggedRng was used
			expect(point1).not.toBe(point2); // not the same instance
			expect(point1).toEqual(point2); // but the same values
		});

		it('should support any dimensions', function () {
			var point, pds;

			// test dimensions 1 to 5

			for (var i = 1; i <= 5; i++) {
				pds = new PDS({
					shape: makeDimensionArray(i, 10),
					minDistance: 8,
					maxDistance: 8,
					tries: 10,
					distanceFunction: Math.random,
				});

				point = pds.addRandomPoint();

				expect(point).toHaveLength(i);
			}
		});
	});

	describe('addPoint()', function () {
		it('should return the added point', function () {
			var pds = new PDS({
					shape: [50, 30],
					minDistance: 8,
					maxDistance: 8,
					tries: 10,
					distanceFunction: Math.random,
				}),
				point = pds.addPoint([10, 15]) as PointI;

			expect(point).toBeInstanceOf(Array);
			expect(point).toHaveLength(2);
			expect(point[0]).toBe(10);
			expect(point[1]).toBe(15);
		});

		it('should not allow to add points of a different dimension', function () {
			var pds = new PDS({
				shape: [50, 30],
				minDistance: 8,
				maxDistance: 8,
				tries: 10,
				distanceFunction: Math.random,
			});

			// those 1D and 3D points should not be accepted in this 2D grid

			var point1 = pds.addPoint([10]);
			var point2 = pds.addPoint([10, 10, 10]);

			expect(point1).toBeNull();
			expect(point2).toBeNull();

			var points = pds.getAllPoints();

			expect(points).toHaveLength(0);
		});

		it('should not allow to add points outside of the provided grid size', function () {
			var pds = new PDS({
				shape: [50, 30],
				minDistance: 8,
				maxDistance: 8,
				tries: 10,
				distanceFunction: Math.random,
			});

			// none of those points are within the bounds, they should be ignored

			var point1 = pds.addPoint([-5, 10]);
			var point2 = pds.addPoint([55, 10]);
			var point3 = pds.addPoint([10, -10]);
			var point4 = pds.addPoint([10, 50]);

			expect(point1).toBeNull();
			expect(point2).toBeNull();
			expect(point3).toBeNull();
			expect(point4).toBeNull();

			var points = pds.getAllPoints();

			expect(points).toHaveLength(0);
		});

		it('should not allow to add a point with a coordinate on the outer bound of the shape', function () {
			var pds = new PDS({ shape: [50, 30], minDistance: 8, tries: 10 });

			var point1 = pds.addPoint([5, 30]);
			var point2 = pds.addPoint([50, 2]);

			expect(point1).toBeNull();
			expect(point2).toBeNull();

			var points = pds.getAllPoints();

			expect(points).toHaveLength(0);
		});

		it('should ignore the distance constraints', function () {
			var pds = new PDS({
				shape: [2, 2],
				minDistance: 8,
				maxDistance: 8,
				tries: 10,
				distanceFunction: Math.random,
			});

			// there is not enough room in this grid for two points satisfying the distance constraints
			// however addPoint doesn't check those constraints, therefore two points should be generated

			pds.addPoint([0, 0]);
			pds.addPoint([1, 1]);

			var points = pds.getAllPoints();

			expect(points).toHaveLength(2);
		});
	});

	describe('next()', function () {
		it('should return the point it successfully placed in the grid', function () {
			var pds = new PDS({
				shape: [50, 30],
				minDistance: 4,
				maxDistance: 8,
				tries: 10,
				distanceFunction: Math.random,
			});

			pds.addPoint([10, 10]);

			var newPoint = pds.next();
			var points = pds.getAllPoints();

			expect(newPoint).toBeInstanceOf(Array);
			expect(newPoint).toHaveLength(2);

			expect(points).toHaveLength(2);

			expect(points[1]).toBe(newPoint);
		});

		it('should check the distance constraints and return null if it cannot place any point', function () {
			var pds = new PDS({
				shape: [2, 2],
				minDistance: 8,
				maxDistance: 8,
				tries: 20,
				distanceFunction: Math.random,
			});

			pds.addPoint([1, 1]);

			var newPoint = pds.next();
			var points = pds.getAllPoints();

			expect(newPoint).toBeNull();
			expect(points).toHaveLength(1);
		});
	});

	describe('reset()', function () {
		it('should clear the state of the PDS instance', function () {
			var pds = new PDS({
				shape: [50, 30],
				minDistance: 4,
				maxDistance: 8,
				tries: 10,
				distanceFunction: Math.random,
			});

			pds.fill();

			var points = pds.getAllPoints();

			expect(points.length).toBeGreaterThan(0);

			pds.reset();

			points = pds.getAllPoints();

			expect(points).toHaveLength(0);
		});

		it('should not affect previously retrieved point collection', function () {
			var pds = new PDS({
				shape: [50, 30],
				minDistance: 4,
				maxDistance: 8,
				tries: 10,
				distanceFunction: Math.random,
			});

			pds.fill();

			var points = pds.getAllPoints();

			pds.reset();

			expect(points.length).toBeGreaterThan(0);
		});
	});

	describe('general behavior', function () {
		it('should respect the min and max distance', function () {
			var pds = new PDS({
				shape: [50, 50],
				minDistance: 4,
				maxDistance: 10,
				tries: 10,
				distanceFunction: function () {
					return Math.random();
				},
			});

			var points = pds.fill();

			verifyResultPoints(points, 2, 4, 10);
		});

		it('should be able to spaw point in a shape with dimensions of 1', function () {
			var pds = new PDS({
				shape: [1, 1],
				minDistance: 0.2,
				maxDistance: 0.4,
				tries: 20,
				distanceFunction: function () {
					return Math.random();
				},
			});

			var points = pds.fill();

			expect(points.length).toBeGreaterThan(1);
		});

		it('should respect the distance function', function () {
			var pds = new PDS({
				shape: [50, 50],
				minDistance: 4,
				maxDistance: 10,
				tries: 10,
				distanceFunction: function () {
					return 0;
				},
			});

			var points = pds.fill();

			verifyResultPoints(points, 2, 4, 4);

			pds = new PDS({
				shape: [50, 50],
				minDistance: 4,
				maxDistance: 10,
				tries: 10,
				distanceFunction: function () {
					return 0.5;
				},
			});

			points = pds.fill();

			verifyResultPoints(points, 2, 7, 7);

			pds = new PDS({
				shape: [50, 50],
				minDistance: 4,
				maxDistance: 10,
				tries: 10,
				distanceFunction: function () {
					return 1;
				},
			});

			points = pds.fill();

			verifyResultPoints(points, 2, 10, 10);
		});
	});
});
run();
