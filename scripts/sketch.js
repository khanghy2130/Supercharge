let scaleFactor = 1;
let canvas;
function setup() {
  // nKA
  canvas = createCanvas(600, 600, document.getElementById("game-canvas"));
  windowResized();

  // configs
  pixelDensity(1); // nKA
  rectMode(CENTER);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  strokeJoin(ROUND);
  angleMode(DEGREES); // KA
  textSize(40);
  textFont("monospace"); // textFont(createFont("monospace")); // KA
}

// nKA
function windowResized() {
  viewportWidth = Math.min(window.innerWidth, window.innerHeight);
  scaleFactor = viewportWidth / 600;
  canvas.elt.style.transform = "scale(" + scaleFactor + ")";
}

let _mouseX, _mouseY;
let touchCountdown = 0;
function draw() {
  _mouseX = floor(mouseX / scaleFactor);
  _mouseY = floor(mouseY / scaleFactor);
  touchCountdown--;
  cursor(ARROW);

  background(100);
}

// KA
function touchEnded() {
  if (touchCountdown > 0) return;
  else touchCountdown = 5;
}
