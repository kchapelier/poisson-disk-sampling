# poisson-disk-sampling

[![Build Status](https://travis-ci.org/kchapelier/poisson-disk-sampling.svg)](https://travis-ci.org/kchapelier/poisson-disk-sampling) [![NPM version](https://badge.fury.io/js/poisson-disk-sampling.svg)](http://badge.fury.io/js/poisson-disk-sampling)

Poisson disk sampling in arbitrary dimensions.

## Installing

With [npm](https://www.npmjs.com/) do:

```
npm install poisson-disk-sampling
```

With [yarn](https://yarnpkg.com/) do:

```
yarn add poisson-disk-sampling
```

A compiled version for web browsers is also available on CDNs:

```html
<script src="https://raw.githubusercontent.com/kchapelier/poisson-disk-sampling/1.0.6/build/poisson-disk-sampling.min.js"></script>
```

```html
<script src="https://cdn.jsdelivr.net/gh/kchapelier/poisson-disk-sampling@1.0.6/build/poisson-disk-sampling.min.js"></script>
```

## Features

- Can be used in any dimension (1D, 2D, 3D and more).
- Can be used with a custom RNG function.
- Allow the configuration of the max number of tries, the minimum distance and the maximum distance between each points.

## Basic example

```js
var p = new PoissonDiskSampling([600, 300, 200], 20, 30, 10);
var points = p.fill();

console.log(points); //array of sample points, themselves represented as simple arrays
```

### Result as an image

<img src="https://github.com/kchapelier/poisson-disk-sampling/raw/master/img/example1.png" style="image-rendering:pixelated; width:500px;"></img>

## Public API

### Constructor

**new PoissonDiskSampling(shape, minDistance[, maxDistance[, maxTries[, rng]]])**

- *shape :* Size/dimensions of the grid to generate points in.
- *minDistance :* Minimum distance between each points.
- *maxDistance :* Maximum distance between each points, default to minDistance times 2.
- *maxTries :* Maximum number of tries to generate a point, defaults to 30.
- *rng :* A function to use as random number generator, defaults to Math.random.

```js
// Poisson disk sampling in a 2D square
var pds = new PoissonDiskSampling([50, 50], 4, 4, 10);
```

```js
// Poisson disk sampling in a 3D volume
var pds = new PoissonDiskSampling([900, 400, 400], 20, 25, 10);
```

### Method

**pds.fill()**

Fill the grid with random points following the distance constraint.

Returns the entirety of the points in the grid as an array of coordinate arrays. The points are sorted in their generation order.

```js
var points = pds.fill();

console.log(points[0]); // prints something like [30, 16, 51]
```

**pds.getAllPoints()**

Get all the points present in the grid without trying to generate any new points.

Returns the entirety of the points in the grid as an array of coordinate arrays. The points are sorted in their generation order.

```js
var points = pds.getAllPoints();

console.log(points[0]); // prints something like [30, 16, 51]
```

**pds.addRandomPoint()**

Add a completely random point to the grid. There won't be any check on the distance constraint with the other points already present in the grid.

Returns the point as a coordinate array.

**pds.addPoint(point)**

- *point :* Point represented as a coordinate array.

Add an arbitrary point to the grid. There won't be any check on the distance constraint with the other points already present in the grid.

Returns the point added to the grid.

If the point given is not of the correct dimension (i.e. inserting a 2D point in a 3D grid) or doesn't fit in the grid size, null will be returned.

```js
pds.addPoint([20, 30, 40]);
```

**pds.next()**

Try to generate a new point in the grid following the distance constraint.

Returns a coordinate array when a point is generated, null otherwise.

```js
var point;

while(point = pds.next()) {
    console.log(point); // [x, y, z]
}
```

**pds.reset()**

Reinitialize the grid as well as the internal state.

When doing multiple samplings in the same grid, it is preferable to reuse the same instance of PoissonDiskSampling instead of creating a new one for each sampling.

## History

### 1.0.6 (2019-09-28) :

- Update dev dependencies

### 1.0.5 (2019-05-27) :

- Fix package on npm (adding missing file)

### 1.0.4 (2019-05-27) :

- Replace ndarray with a leaner custom implementation to drastically reduce the size of the package (~50%)
- Update dev dependencies

### 1.0.3 (2019-01-12) :

- Update dev dependencies
- Change node versions tested with travis

### 1.0.2 (2017-09-30) :

- Minor performance tweaks
- Reduce npm package size
- Update `moore` dep
- Add benchmark script

### 1.0.1 (2017-01-06) :

- Add some checks on the points added with addPoint()
- Implements tests
- Add travis support

### 1.0.0 (2016-09-16) :

- Implement `getAllPoints()` and `reset()`
- Fix incorrect handling of `maxDistance` when it is not set
- Fix incorrect behavior when `fill()` is called several times
- Declare the public API stable
- API documentation
- Remove `mathp` dependency

### 0.0.1 (2015-11-28) :

- First release

## Roadmap

- Tests.

## How to contribute ?

For new features and other enhancements, please make sure to contact me beforehand, either on [Twitter](https://twitter.com/kchplr) or through an issue on Github.

## License

MIT
