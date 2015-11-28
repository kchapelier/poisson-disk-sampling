"use strict";

// sphere-random module by Mikola Lysenko under the MIT License
// waiting for https://github.com/scijs/sphere-random/pull/1 to be merged

module.exports = sampleSphere

var defaultRng = Math.random

function sampleSphere(d, rng) {
    rng = rng || defaultRng
    var v = new Array(d)
    var d2 = Math.floor(d/2)<<1
    var r2 = 0.0
    for(var i=0; i<d2; i+=2) {
        var rr = -2.0 * Math.log(rng())
        var r =  Math.sqrt(rr)
        var theta = 2.0 * Math.PI * rng()
        r2 += rr
        v[i] = r * Math.cos(theta)
        v[i+1] = r * Math.sin(theta)
    }
    if(d % 2) {
        var x = Math.sqrt(-2.0 * Math.log(rng())) *
            Math.cos(2.0 * Math.PI * rng())
        v[d-1] = x
        r2 += Math.pow(x, 2)
    }
    var h = 1.0 / Math.sqrt(r2)
    for(var i=0; i<d; ++i) {
        v[i] *= h
    }
    return v
}
