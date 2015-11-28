# poisson-disk-sampling

Experimental poisson disk sampling in arbitrary dimensions.

## Installing

With [npm](http://npmjs.org) do:

```
npm install poisson-disk-sampling
```

## Features

- Can be used in any dimension (1D, 2D, 3D and more).
- Can be used with a custom RNG function.
- Allow the configuration of the max number of tries, the minimum distance and the maximum distance between each points.

## Usage

### Code

```js
var p = new Poisson([600, 300, 200], 20, 30, 10);
p.fill();

console.log(p.samplePoints); //array of sample points
```

### Result as an image

<img src="https://github.com/kchapelier/cellular-automata/raw/master/img/example1.png" style="image-rendering:pixelated; width:500px;"></img>

## History

### 0.0.1 (2015-11-28) :

- First release.

## Roadmap

- Tests.
- See if it is possible to use Manhattan and Chebyshev distance instead of Euclidean distance (as an option).
- API documentation.
- Freeze the API.

## License

MIT
