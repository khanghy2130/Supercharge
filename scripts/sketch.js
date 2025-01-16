let pieceImages;
function preload() {
  pieceImages = {
    rw: loadImage("../images/rw.png"),
    rb: loadImage("../images/rb.png"),
    kw: loadImage("../images/kw.png"),
    kb: loadImage("../images/kb.png"),
    bw: loadImage("../images/bw.png"),
    bb: loadImage("../images/bb.png"),
  };
}

let scaleFactor = 1;
let canvas;
function setup() {
  // nKA
  canvas = createCanvas(500, 600, document.getElementById("game-canvas"));
  windowResized();

  // configs
  // frameRate(1); /////
  pixelDensity(1); // nKA
  angleMode(DEGREES); // KA
  rectMode(CENTER);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  strokeJoin(ROUND);
  textSize(40);
  textFont("monospace"); // textFont(createFont("monospace")); // KA

  // set num widths
  RENDER.numHalfWidths["0"] =
    myText("0", -100, -100, CONSTANTS.VALUE_NUM_SIZE, color(0, 0, 0, 0)) / 2;
  RENDER.numHalfWidths["1"] =
    myText("1", -100, -100, CONSTANTS.VALUE_NUM_SIZE, color(0, 0, 0, 0)) / 2;
  for (let i = 2; i < 10; i++)
    RENDER.numHalfWidths[i.toString()] = RENDER.numHalfWidths["1"];
  RENDER.numHalfWidths["4"] = RENDER.numHalfWidths["0"]; // set number 4 width to be 0
  RENDER.numHalfWidths["+"] = RENDER.numHalfWidths["1"];
  RENDER.numHalfWidths[":"] = RENDER.numHalfWidths["0"] / 4;

  GAMEPLAY.initializeGame({
    white: { botDepth: 0, squad: ["R", "B", "K"] },
    black: { botDepth: 3, squad: ["K", "B", "R"] },
  });
}

// nKA
function windowResized() {
  viewportWidth = Math.min(window.innerWidth * (6 / 5), window.innerHeight);
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

  GAMEPLAY.renderScene(); ///
}

// KA
function touchEnded() {
  if (touchCountdown > 0) return;
  else touchCountdown = 5;

  GAMEPLAY.clicked(); ///
}
