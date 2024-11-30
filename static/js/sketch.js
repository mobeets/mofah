let capture;
let buffers = [];
let cnvHght = window.innerHeight;
let cnvWdth;
let aspectRatio = 1.3333;
let fps = 20;
let maxLag = 60; // Maximum lag in frames

function setup() {
  cnvWdth = floor(aspectRatio*cnvHght);
  createCanvas(cnvWdth, cnvHght);
  capture = createCapture(VIDEO, { flipped:true });
  capture.size(cnvWdth, cnvHght);
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
  let prevLagFrame;
  let mix; // for mixing the two nearest frames
  for (let y = 0; y < height; y++) {

    // Determine the lag for this row, proportional to row height
    let cY = map(y, 0, height, 0, maxLag-1);
    let lag = floor(cY);
    let lagPrev = ceil(cY);

    if (lag != lastLag) { // do not reload unless we need to
      // Get the two nearest frames from the buffer
      prevLagFrame = buffers[buffers.length - 1 - lagPrev];
      prevLagFrame.loadPixels();
      lagFrame = buffers[buffers.length - 1 - lag];
      lagFrame.loadPixels();
      lastLag = lag;
    }
    
    // find mixture weight (between 0 and 1)
    if (lagPrev > lag) {
      mix = (cY - lag) / (lagPrev - lag);
    } else {
      mix = 0;
    }

    // Copy the row directly from the lag frame's pixels array
    for (let x = 0; x < width; x++) {
      let index = (y * width + x) * 4; // Calculate the pixel index
      pixels[index] = (1-mix)*lagFrame.pixels[index] + (mix)*prevLagFrame.pixels[index];
      pixels[index + 1] = (1-mix)*lagFrame.pixels[index+1] + (mix)*prevLagFrame.pixels[index+1];
      pixels[index + 2] = (1-mix)*lagFrame.pixels[index+2] + (mix)*prevLagFrame.pixels[index+2];
      pixels[index + 3] = (1-mix)*lagFrame.pixels[index+3] + (mix)*prevLagFrame.pixels[index+3];
    }
  }

  updatePixels();
}
