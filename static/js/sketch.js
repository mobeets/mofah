let capture;
let buffers = [];
var cnvWdth = window.innerWidth;
var cnvHght = window.innerHeight;
// let cnvWdth = 500;
// let cnvHght;
// let aspectRatio = 1.3333;
let fps = 30;
let maxLag = 90; // Maximum lag in frames

function setup() {
  // cnvHght = floor(aspectRatio*cnvWdth);
  createCanvas(cnvHght, cnvWdth);
  capture = createCapture(VIDEO);
  capture.size(cnvHght, cnvWdth);
  capture.hide();
  
  frameRate(fps);
  pixelDensity(1);
  
  // Initialize buffers with blank images
  for (let i = 0; i < maxLag; i++) {
    buffers.push(createGraphics(capture.width, capture.height));
  }
}

function draw() {
  // Draw the current frame into the most recent buffer
  let currentFrame = capture.get();
  buffers.push(currentFrame);
  if (buffers.length > maxLag) {
    buffers.shift(); // Remove the oldest frame if exceeding the lag buffer
  }

  loadPixels();

  let lastLag = -1;
  let lagFrame;
  for (let y = 0; y < height; y++) {
    // Determine the lag for this row
    let lag = floor(map(y, 0, height, 0, maxLag-1));

    if (lag != lastLag) { // do not reload unless we need to
      // Get the corresponding frame from the buffer
      lagFrame = buffers[buffers.length - 1 - lag];
      lagFrame.loadPixels();
      lastLag = lag;
    }

    // Copy the row directly from the lag frame's pixels array
    for (let x = 0; x < width; x++) {
      let index = (y * width + x) * 4; // Calculate the pixel index
      pixels[index] = lagFrame.pixels[index];       // Red
      pixels[index + 1] = lagFrame.pixels[index + 1]; // Green
      pixels[index + 2] = lagFrame.pixels[index + 2]; // Blue
      pixels[index + 3] = lagFrame.pixels[index + 3]; // Alpha
    }
  }

  updatePixels();
}
