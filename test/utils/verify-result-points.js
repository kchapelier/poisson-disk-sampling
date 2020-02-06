"use strict";

module.exports = function verifyResultPoints (points, dimensions, minExpectedDistance, maxExpectedDistance) {
    // minor (float) precision error can and will happen, this is deemed acceptable in the context of this project
    var acceptableError = 0.00000000000005;

    var maxMinDistance = 0;
    var minMinDistance = Number.MAX_VALUE;

    for(var i = 0; i < points.length; i++) {
        var pointMinDistance = Number.MAX_VALUE;

        for (var k = 0; k < points.length; k++) {
            if (k !== i) {
                var pointDistance = 0;

                for (var d = 0; d < dimensions; d++) {
                    pointDistance += Math.pow(points[i][d] - points[k][d], 2);
                }

                pointDistance = Math.sqrt(pointDistance);

                pointMinDistance = Math.min(pointMinDistance, pointDistance);
            }
        }

        maxMinDistance = Math.max(maxMinDistance, pointMinDistance);
        minMinDistance = Math.min(minMinDistance, pointMinDistance);
    }

    (minExpectedDistance - minMinDistance).should.be.below(acceptableError);
    (maxMinDistance - maxExpectedDistance).should.be.below(acceptableError);
};