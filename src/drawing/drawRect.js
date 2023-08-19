import external from './../externalModules.js';
import path from './path.js';
import { rotatePoint } from '../util/pointProjector.js';

/**
 * Draw a rectangle defined by `corner1` and `corner2`.
 * @public
 * @method drawRect
 * @memberof Drawing
 *
 * @param {CanvasRenderingContext2D} context - Target context
 * @param {HTMLElement} element - The DOM Element to draw on
 * @param {Object} corner1 - `{ x, y }` in either pixel or canvas coordinates.
 * @param {Object} corner2 - `{ x, y }` in either pixel or canvas coordinates.
 * @param {Object} options - See {@link path}
 * @param {String} [coordSystem='pixel'] - Can be "pixel" (default) or "canvas". The coordinate
 *     system of the points passed in to the function. If "pixel" then cornerstone.pixelToCanvas
 *     is used to transform the points from pixel to canvas coordinates.
 * @param {Number} initialRotation - Rectangle initial rotation
 * @returns {undefined}
 */
export default function(
  context,
  element,
  corner1,
  corner2,
  options,
  coordSystem = 'pixel',
  initialRotation = 0.0
) {
  const canvas2 = document.getElementsByClassName('cornerstone-canvas')[0];
  const width2 = canvas2.width;
  const ctx = canvas2.getContext('2d');

  const imageData = ctx.getImageData(0, 0, width2, canvas2.height);
  const data = imageData.data;

  let leftPadding = localStorage.getItem('leftPadding');
  let rightPadding = localStorage.getItem('rightPadding');

  let imageWidth = null;
  // Check if we have the values in localStorage
  let previousImageId = localStorage.getItem('previousImageId');
  // alert('2: ', previousImageId);
  if (
    leftPadding &&
    rightPadding &&
    previousImageId !== null &&
    options.currentImageId === previousImageId
  ) {
    leftPadding = parseInt(leftPadding, 10);
    rightPadding = parseInt(rightPadding, 10);
  } else {
    for (let x = 0; x < width2; x++) {
      const index = x * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];

      // Check for non-black pixels
      if (r !== 0 || g !== 0 || b !== 0) {
        leftPadding = x;
        break;
      }
      // Search from the right side of the first row
      for (let x = width2 - 1; x >= 0; x--) {
        const index = x * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        // Check for non-black pixels
        if (r !== 0 || g !== 0 || b !== 0) {
          rightPadding = x;
          break;
        }
      }

      imageWidth = rightPadding - leftPadding + 1;
      // Save to localStorage
      localStorage.setItem('leftPadding', leftPadding);
      localStorage.setItem('rightPadding', rightPadding);
      localStorage.setItem('previousImageId', options.currentImageId);
    }
  }

  if (coordSystem === 'pixel') {
    const cornerstone = external.cornerstone;

    corner1 = cornerstone.pixelToCanvas(element, corner1);
    corner2 = cornerstone.pixelToCanvas(element, corner2);
  }

  const viewport = external.cornerstone.getViewport(element);

  // Calculate the center of the image
  const { clientWidth: width, clientHeight: height } = element;
  const { scale, translation } = viewport;
  const rotation = viewport.rotation - initialRotation;

  const centerPoint = {
    x: width / 2 + translation.x * scale,
    y: height / 2 + translation.y * scale,
  };

  if (Math.abs(rotation) > 0.05) {
    corner1 = rotatePoint(corner1, centerPoint, -rotation);
    corner2 = rotatePoint(corner2, centerPoint, -rotation);
  }

  // corner1 its the start point
  // corner2 its the end point
  if (corner2.x > rightPadding) {
    // const diff = corner2.x - limitx;
    corner2.x = rightPadding;
  }
  if (corner2.x < leftPadding) {
    // const diff = corner2.x - limitx;
    corner2.x = leftPadding;
  }

  /*const canvasWidth = context.canvas.width;
  // Calculate the left padding dynamically
  const leftPadding = (canvasWidth - options.imageWidth) / 2;
  // Calculate the maximum allowed x position for corner2
  const corner2MaxX = leftPadding + options.imageWidth;

  // If corner2.x exceeds the maximum, pull it back to the maximum
  if (corner2.x > corner2MaxX) {
    const diff = corner2.x - corner2MaxX;
    corner2.x -= diff;
  }*/

  // corner2.x es 520, absolutex es 820, imageWidth es 500?
  // corner2.x es 820, absolutex es 820, imageWidth es 500?
  if (corner2.y > 512) {
    corner2.y = 512;
  }

  const w = Math.abs(corner1.x - corner2.x);
  const h = Math.abs(corner1.y - corner2.y);

  /*corner1 = {
    x: Math.min(corner1.x, corner2.x),
    y: Math.min(corner1.y, corner2.y),
  };*/

  corner1 = {
    x: Math.max(0, Math.min(corner1.x, corner2.x)),
    y: Math.max(0, Math.min(corner1.y, corner2.y)),
  };

  corner2 = {
    x: corner1.x + w,
    y: corner1.y + h,
  };

  let corner3 = {
    x: corner1.x + w,
    y: corner1.y,
  };

  /*if (corner3.x > options.imageWidth) {
    corner3.x = options.imageWidth;
  }*/

  let corner4 = {
    x: corner1.x,
    y: corner1.y + h,
  };
  /*if (corner4.y > options.imageHeight) {
    corner4.y = options.imageHeight;
  }*/

  // Constrain the rotated corners within the image dimensions
  /*corner1.x = Math.max(0, Math.min(options.imageWidth, corner1.x));
  corner1.y = Math.max(0, Math.min(options.imageHeight, corner1.y));
  corner2.x = Math.max(0, Math.min(options.imageWidth, corner2.x));
  corner2.y = Math.max(0, Math.min(options.imageHeight, corner2.y));
  corner3.x = Math.max(0, Math.min(options.imageWidth, corner3.x));
  corner3.y = Math.max(0, Math.min(options.imageHeight, corner3.y));
  corner4.x = Math.max(0, Math.min(options.imageWidth, corner4.x));
  corner4.y = Math.max(0, Math.min(options.imageHeight, corner4.y));
*/
  if (Math.abs(rotation) > 0.05) {
    corner1 = rotatePoint(corner1, centerPoint, rotation);
    corner2 = rotatePoint(corner2, centerPoint, rotation);
    corner3 = rotatePoint(corner3, centerPoint, rotation);
    corner4 = rotatePoint(corner4, centerPoint, rotation);
  }

  const radius = 10;
  path(context, options, context => {
    context.moveTo(corner1.x, corner1.y);
    context.lineTo(corner3.x, corner3.y);
    context.lineTo(corner2.x, corner2.y);
    context.lineTo(corner4.x, corner4.y);
    context.lineTo(corner1.x, corner1.y);
    // context.fillStyle = 'black';
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fill();
    // Drawing the circle at the top right corner of the rectangle
    context.beginPath();
    context.arc(corner3.x, corner3.y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = 'black'; // Fill color of the circle
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = '#003300'; // Stroke color of the circle
    context.stroke();

    // Drawing 'X' inside the circle
    context.fillStyle = 'white'; // Color of the 'X'
    context.font = '10px Arial'; // Font of the 'X'
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('x', corner3.x, corner3.y);
  });
}
