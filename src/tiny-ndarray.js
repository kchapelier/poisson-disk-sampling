"use strict";

function tinyNDArray (gridShape) {
  var dimensions = gridShape.length,
      totalLength = 1,
      stride = new Array(dimensions),
      dimension;

  for (dimension = dimensions; dimension > 0; dimension--) {
      stride[dimension - 1] = totalLength;
      totalLength = totalLength * gridShape[dimension - 1];
  }

  return {
      stride: stride,
      data: new Uint32Array(totalLength)
  }
}

module.exports = tinyNDArray;