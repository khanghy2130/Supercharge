let pieceImages = {};

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
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  strokeJoin(ROUND);
  textSize(40);
  textFont("monospace"); // textFont(createFont("monospace")); // KA

  const r = RENDER;

  // create colors
  BOARD_INFO.color1 = color.apply(null, BOARD_INFO.color1);
  BOARD_INFO.color2 = color.apply(null, BOARD_INFO.color2);
  r.LIGHTNING_COLOR = color.apply(null, r.LIGHTNING_COLOR);
  for (let i = 0; i < r.TARGETS_COLORS.length; i++) {
    r.TARGETS_COLORS[i] = color.apply(null, r.TARGETS_COLORS[i]);
  }

  // set board image
  (function () {
    background(BOARD_INFO.color1);
    // render dark squares
    fill(BOARD_INFO.color2);
    noStroke();
    const ss = 45;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if ((x + y) % 2 === 0) continue;
        rect(ss * x, ss * y, ss, ss);
      }
    }
    BOARD_INFO.boardImage = get(0, 0, ss * 8, ss * 8);
  })();

  // create piece images
  (function () {
    const ss = 100;
    const whiteColor = color(240);
    const blackColor = color(20);

    function renderShape(shapeArr, isWhite) {
      clear(); /// KA background(0,0);
      stroke(isWhite ? blackColor : whiteColor);
      fill(isWhite ? whiteColor : blackColor);
      beginShape();
      for (let item of shapeArr) {
        if (item[0] === 0) {
          vertex(ss * item[1], ss * item[2]);
        } else {
          const arr = item.slice();
          arr.shift();
          for (let i = 0; i < arr.length; i++) {
            arr[i] *= ss;
          }
          bezierVertex.apply(null, arr);
        }
      }
      endShape(CLOSE);
    }

    strokeWeight(ss * 0.05);

    const rookShape = [
      [0, 0.2, 0.15],
      [0, 0.2, 0.4],
      [0, 0.32, 0.5],
      [0, 0.32, 0.7],
      [0, 0.2, 0.75],
      [0, 0.2, 0.85],
      [0, 0.8, 0.85],
      [0, 0.8, 0.75],
      [0, 0.68, 0.7],
      [0, 0.68, 0.5],
      [0, 0.8, 0.4],
      [0, 0.8, 0.15],
    ];

    renderShape(rookShape, true);
    fill(blackColor);
    rect(ss * 0.37, ss * 0.17, ss * 0.04, ss * 0.12);
    rect(ss * 0.59, ss * 0.17, ss * 0.04, ss * 0.12);
    pieceImages.rw = get(0, 0, ss, ss);

    renderShape(rookShape, false);
    fill(whiteColor);
    rect(ss * 0.35, ss * 0.17, ss * 0.04, ss * 0.12);
    rect(ss * 0.6, ss * 0.17, ss * 0.04, ss * 0.12);
    pieceImages.rb = get(0, 0, ss, ss);

    const knightShape = [
      [0, 0.8, 0.75],
      [0, 0.8, 0.85],
      [0, 0.2, 0.85],
      [0, 0.2, 0.75],
      [0, 0.3, 0.7],
      [1, 0.33, 0.5, 0.5, 0.5, 0.45, 0.47],
      [1, 0.07, 0.6, 0.18, 0.35, 0.37, 0.22],
      [0, 0.35, 0.14],
      [1, 0.85, 0, 0.9, 0.5, 0.7, 0.7],
    ];

    renderShape(knightShape, true);
    pieceImages.kw = get(0, 0, ss, ss);
    renderShape(knightShape, false);
    pieceImages.kb = get(0, 0, ss, ss);

    const bishopShape = [
      [0, 0.8, 0.75],
      [0, 0.8, 0.85],
      [0, 0.2, 0.85],
      [0, 0.2, 0.75],
      [0, 0.3, 0.7],
      [1, 0.15, 0.6, 0.15, 0.4, 0.4, 0.25],
      [1, 0.25, 0.03, 0.75, 0.03, 0.6, 0.25],
      [1, 0.85, 0.4, 0.85, 0.6, 0.7, 0.7],
    ];

    renderShape(bishopShape, true);
    fill(blackColor);
    triangle(ss * 0.5, ss * 0.55, ss * 0.7, ss * 0.35, ss * 0.75, ss * 0.38);
    pieceImages.bw = get(0, 0, ss, ss);

    renderShape(bishopShape, false);
    fill(whiteColor);
    triangle(ss * 0.5, ss * 0.55, ss * 0.7, ss * 0.35, ss * 0.75, ss * 0.4);
    pieceImages.bb = get(0, 0, ss, ss);

    const queenShape = [
      [0, 0.7, 0.7],
      [0, 0.8, 0.75],
      [0, 0.8, 0.85],
      [0, 0.2, 0.85],
      [0, 0.2, 0.75],
      [0, 0.3, 0.7],

      [0, 0.16, 0.4],
      [1, 0, 0.32, 0.23, 0.18, 0.22, 0.35],

      [0, 0.35, 0.5], // left valley

      [0, 0.35, 0.22],
      [1, 0.25, 0.1, 0.5, 0.05, 0.43, 0.2],

      [0, 0.5, 0.47], // middle valley

      [0, 0.57, 0.2],
      [1, 0.5, 0.05, 0.75, 0.1, 0.65, 0.22],

      [0, 0.65, 0.5], // right valley

      [0, 0.78, 0.35],
      [1, 0.77, 0.18, 1, 0.32, 0.84, 0.4],
    ];
    renderShape(queenShape, true);
    pieceImages.qw = get(0, 0, ss, ss);
    renderShape(queenShape, false);
    pieceImages.qb = get(0, 0, ss, ss);

    const kingShape = [
      [0, 0.8, 0.75],
      [0, 0.8, 0.85],
      [0, 0.2, 0.85],
      [0, 0.2, 0.75],
      [0, 0.3, 0.7],
      [1, 0, 0.4, 0.3, 0.18, 0.45, 0.28],

      [0, 0.45, 0.25],
      [0, 0.4, 0.25],
      [0, 0.4, 0.15],
      [0, 0.45, 0.15],

      [0, 0.45, 0.1],
      [0, 0.55, 0.1],

      [0, 0.55, 0.15],
      [0, 0.6, 0.15],
      [0, 0.6, 0.25],
      [0, 0.55, 0.25],
      [0, 0.55, 0.28],
      [1, 0.7, 0.18, 1, 0.4, 0.7, 0.7],
    ];
    renderShape(kingShape, true);
    pieceImages.lw = get(0, 0, ss, ss);
    renderShape(kingShape, false);
    pieceImages.lb = get(0, 0, ss, ss);

    // render test, put 'return' in draw()
    // fill(BOARD_INFO.color1);
    // noStroke();
    // square(width / 2 - 150, width / 2 - 150, 300);
    // image(pieceImages.lw, width / 2, width / 2, 300, 300);

    background(0);
  })();

  // set num widths
  r.numHalfWidths["0"] =
    myText("0", -100, -100, CONSTANTS.VALUE_NUM_SIZE, color(0, 0, 0, 0)) / 2;
  r.numHalfWidths["1"] =
    myText("1", -100, -100, CONSTANTS.VALUE_NUM_SIZE, color(0, 0, 0, 0)) / 2;
  for (let i = 2; i < 10; i++)
    r.numHalfWidths[i.toString()] = r.numHalfWidths["1"];
  r.numHalfWidths["4"] = r.numHalfWidths["0"]; // set number 4 width to be 0
  r.numHalfWidths["+"] = r.numHalfWidths["1"];
  r.numHalfWidths[":"] = r.numHalfWidths["0"] / 4;

  MENU.createBtns();
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

  const SC = SCENE_CONTROL;
  push(); /// KA
  if (SC.progress < 1) {
    SC.progress += 0.05;
    if (SC.progress >= 1) {
      if (SC.isClosing) {
        SC.isClosing = false;
        SC.currentScene = SC.targetScene;
        SC.progress = 0;
        RENDER.lightnings = [];
      }
    }
    translate(
      SC.isClosing
        ? SC.progress * -200
        : 200 - RENDER.easeOutExpo(SC.progress) * 200,
      0
    );
  }

  /// which scene
  switch (SC.currentScene) {
    case "PLAY":
      GAMEPLAY.renderScene();
      break;
    case "STANDARD":
      break;
    case "CUSTOM":
      break;
    case "REPLAYS":
      break;
    case "MENU":
      MENU.renderMainMenu();
      break;
  }

  pop(); /// KA
  if (SC.progress < 1) {
    const alphaPrg = SC.isClosing ? SC.progress : 1 - SC.progress;
    fill(lerpColor(color(0, 0), color(0), alphaPrg));
    noStroke();
    rect(0, 0, 500, 600);
  }
}

/// KA
function touchEnded() {
  if (touchCountdown > 0) return;
  else touchCountdown = 5;

  // is changing scene
  if (SCENE_CONTROL.progress < 1) return;

  switch (SCENE_CONTROL.currentScene) {
    case "PLAY":
      return GAMEPLAY.clicked();
    case "STANDARD":
      return;
    case "CUSTOM":
      return;
    case "REPLAYS":
      return;
    case "MENU":
      return MENU.clicked();
  }
}
