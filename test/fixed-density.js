"use strict";

var PDS = require('../'),
    should = require('chai').should(),
    verifyResultPoints = require('./utils/verify-result-points');

function makeDimensionArray(dimensions, value) {
    var array = [],
        dimension;

    for (dimension = 0; dimension < dimensions; dimension++) {
        array.push(value);
    }

    return array;
}

describe('PDS with fixed density', function () {
    describe('fill()', function () {
        it('should return an array of points', function () {
            var pds = new PDS({ shape: [50, 30], minDistance: 4, maxDistance: 8, tries: 10 }),
                points = pds.fill();

            points.should.be.instanceof(Array);
            points.length.should.be.at.least(1);
            points[0].should.be.instanceof(Array);
        });

        it('should only generate points within the provided grid size', function () {
            var pds = new PDS({ shape: [50, 30], minDistance: 4, maxDistance: 8, tries: 10 }),
                points = pds.fill();

            for (var i = 0; i < points.length; i++) {
                points[i][0].should.be.within(0, 50);
                points[i][1].should.be.within(0, 30);
            }
        });
    });

    describe('getAllPoints()', function () {
        it('should return an empty array after the instantiation', function () {
            var pds = new PDS({ shape: [50, 30], minDistance: 4, maxDistance: 8, tries: 10 }),
                points = pds.getAllPoints();

            points.should.be.instanceof(Array);
            points.length.should.be.equal(0);
        });

        it('should return an array of points after fill', function () {
            var pds = new PDS({ shape: [50, 30], minDistance: 4, maxDistance: 8, tries: 10 });

            pds.fill();

            var points = pds.getAllPoints();

            points.should.be.instanceof(Array);
            points.length.should.be.at.least(1);
            points[0].should.be.instanceof(Array);
        });
    });

    describe('getAllPointsWithDistance()', function () {
        it('should throw an error', function () {
            var pds = new PDS({ shape: [50, 30], minDistance: 4, maxDistance: 8, tries: 10 });

            pds.fill();

            (function () {
                pds.getAllPointsWithDistance();
            }).should.throw(Error, /is not available in fixed-density implementation/);
        });
    });

    describe('addRandomPoint()', function () {
        it('should return a point within the provided grid size', function () {
            var pds = new PDS({ shape: [50, 30], minDistance: 4, maxDistance: 8, tries: 10 }),
                point = pds.addRandomPoint();

            point.should.be.instanceof(Array);
            point[0].should.be.within(0, 50);
            point[1].should.be.within(0, 30);
        });

        it('should create a new point for each call', function () {
            var pds = new PDS({ shape: [50, 30], minDistance: 4, maxDistance: 8, tries: 10 }),
                point1 = pds.addRandomPoint(),
                point2 = pds.addRandomPoint();

            point1.should.not.equal(point2); // not deep equal because the points MAY have the same coordinates
        });

        it('should ignore the distance constraints', function () {
            var pds = new PDS({ shape: [2, 2], minDistance: 8, maxDistance: 8, tries: 10 });

            // there is not enough room in this grid for two points satisfying the distance constraints
            // however addRandomPoint doesn't check those constraints, therefore two points should be generated

            pds.addRandomPoint();
            pds.addRandomPoint();

            var points = pds.getAllPoints();

            points.length.should.equal(2);
        });

        it('should be using the provided rng function', function () {
            var riggedRngCounter = 0;
            var riggedRng = function () {
                riggedRngCounter++;
                return 0.5;
            };

            var pds = new PDS({ shape: [50, 30], minDistance: 4, maxDistance: 8, tries: 10 }, riggedRng),
                point1 = pds.addRandomPoint(),
                point2 = pds.addRandomPoint();

            riggedRngCounter.should.be.above(0); // confirm riggedRng was used
            point1.should.not.equal(point2); // not the same instance
            point1.should.deep.equal(point2); // but the same values

        });

        it('should support any dimensions', function () {
            var point,
                pds;

            // test dimensions 1 to 5

            for (var i = 1; i <= 5; i++) {
                pds = new PDS({ shape: makeDimensionArray(i, 10), minDistance: 8, maxDistance: 8, tries: 10 });

                point = pds.addRandomPoint();

                point.length.should.equal(i);
            }
        });
    });

    describe('addPoint()', function () {
        it('should return the added point', function () {
            var pds = new PDS({ shape: [50, 30], minDistance: 8, maxDistance: 8, tries: 10 }),
                point = pds.addPoint([10, 15]);

            point.should.be.instanceof(Array);
            point.length.should.be.equal(2);
            point[0].should.be.equal(10);
            point[1].should.be.equal(15);
        });

        it('should not allow to add points of a different dimension', function () {
            var pds = new PDS({ shape: [50, 30], minDistance: 8, maxDistance: 8, tries: 10 });

            // those 1D and 3D points should not be accepted in this 2D grid

            var point1 = pds.addPoint([10]);
            var point2 = pds.addPoint([10, 10, 10]);

            should.equal(point1, null);
            should.equal(point2, null);

            var points = pds.getAllPoints();

            points.length.should.equal(0);
        });

        it('should not allow to add points outside of the provided grid size', function () {
            var pds = new PDS({ shape: [50, 30], minDistance: 8, maxDistance: 8, tries: 10 });

            // none of those points are within the bounds, they should be ignored

            var point1 = pds.addPoint([-5, 10]);
            var point2 = pds.addPoint([55, 10]);
            var point3 = pds.addPoint([10, -10]);
            var point4 = pds.addPoint([10, 50]);

            should.equal(point1, null);
            should.equal(point2, null);
            should.equal(point3, null);
            should.equal(point4, null);

            var points = pds.getAllPoints();

            points.length.should.equal(0);
        });

        it('should not allow to add a point with a coordinate on the outer bound of the shape', function () {
            var pds = new PDS({ shape: [50, 30], radius: 8, tries: 10 });

            var point1 = pds.addPoint([5, 30]);
            var point2 = pds.addPoint([50, 2]);

            should.equal(point1, null);
            should.equal(point2, null);

            var points = pds.getAllPoints();

            points.length.should.equal(0);
        });

        it('should ignore the distance constraints', function () {
            var pds = new PDS({ shape: [2, 2], minDistance: 8, maxDistance: 8, tries: 10 });

            // there is not enough room in this grid for two points satisfying the distance constraints
            // however addPoint doesn't check those constraints, therefore two points should be generated

            pds.addPoint([0,0]);
            pds.addPoint([1,1]);

            var points = pds.getAllPoints();

            points.length.should.equal(2);
        });
    });

    describe('next()', function () {
        it('should return the point it successfully placed in the grid', function () {
            var pds = new PDS({ shape: [50, 30], minDistance: 4, maxDistance: 8, tries: 10 });

            pds.addPoint([10,10]);

            var newPoint = pds.next();
            var points = pds.getAllPoints();

            newPoint.should.be.instanceof(Array);
            newPoint.length.should.be.equal(2);

            points.length.should.be.equal(2);

            points[1].should.be.deep.equal(newPoint);
        });

        it('should check the distance constraints and return null if it cannot place any point', function () {
            var pds = new PDS({ shape: [2, 2], minDistance: 8, maxDistance: 8, tries: 20 });

            pds.addPoint([1,1]);

            var newPoint = pds.next();
            var points = pds.getAllPoints();

            should.equal(newPoint, null);
            points.length.should.equal(1);
        });
    });

    describe('reset()', function () {
        it('should clear the state of the PDS instance', function () {
            var pds = new PDS({ shape: [50, 30], minDistance: 4, maxDistance: 8, tries: 10 });

            pds.fill();

            var points = pds.getAllPoints();

            points.length.should.be.above(0);

            pds.reset();

            points = pds.getAllPoints();

            points.length.should.be.equal(0);
        });

        it('should not affect previously retrieved point collection', function () {
            var pds = new PDS({ shape: [50, 30], minDistance: 4, maxDistance: 8, tries: 10 });

            pds.fill();

            var points = pds.getAllPoints();

            pds.reset();

            points.length.should.be.above(0);
        });
    });

    describe('general behavior', function () {
        it('should respect the min and max distance', function () {
            var pds = new PDS({
                shape: [50, 50],
                minDistance: 4,
                maxDistance: 10,
                tries: 10
            });

            var points = pds.fill();

            verifyResultPoints(points, 2, 4, 10);
        });

        it('should be able to spaw point in a shape with dimensions of 1', function () {
            var pds = new PDS({
                shape: [1, 1],
                minDistance: 0.2,
                maxDistance: 0.4,
                tries: 20
            });

            var points = pds.fill();

            points.length.should.be.above(1);
        });
    });
});
