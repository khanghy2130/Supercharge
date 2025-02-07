let pieceImages = {};

let scaleFactor = 1; /// nKA
let canvas; /// nKA
function setup() {
  // nKA
  canvas = createCanvas(500, 600, document.getElementById("game-canvas"));
  windowResized();
  (function () {
    const savedEasy = localStorage.getItem("easy");
    if (savedEasy !== null) {
      MENU.streak.easy = JSON.parse(savedEasy);
    }
    const saveHard = localStorage.getItem("hard");
    if (saveHard !== null) {
      MENU.streak.hard = JSON.parse(saveHard);
    }
    GAMEPLAY.isNewPlayer =
      localStorage.getItem("isNewPlayer") === "0" ? false : true;
  })();

  // configs
  pixelDensity(1); /// nKA
  angleMode(DEGREES); /// KA angleMode = "degrees"
  imageMode(CENTER);
  strokeJoin(ROUND);

  const r = RENDER;

  // create colors
  BOARD_INFO.color1 = color.apply(null, BOARD_INFO.color1);
  BOARD_INFO.color2 = color.apply(null, BOARD_INFO.color2);
  r.LIGHTNING_COLOR = color.apply(null, r.LIGHTNING_COLOR);
  for (let i = 0; i < r.TARGETS_COLORS.length; i++) {
    r.TARGETS_COLORS[i] = color.apply(null, r.TARGETS_COLORS[i]);
  }

  // set num widths
  r.numHalfWidths["0"] = myText("0", -100, -100, 18, color(0, 0, 0, 0)) / 2;
  r.numHalfWidths["1"] = myText("1", -100, -100, 18, color(0, 0, 0, 0)) / 2;
  for (let i = 2; i < 10; i++)
    r.numHalfWidths[i.toString()] = r.numHalfWidths["1"];
  r.numHalfWidths["4"] = r.numHalfWidths["0"]; // set number 4 width to be 0
  r.numHalfWidths["+"] = r.numHalfWidths["1"];
  r.numHalfWidths[":"] = r.numHalfWidths["0"] / 4;

  createImages();
  MENU.createBtns();
}

function createImages() {
  strokeJoin(ROUND);
  // create board image
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
}

function createHelpImages() {
  strokeJoin(ROUND);
  clear(); /// KA background(0,0);

  // highlights
  noStroke();
  fill(200, 0, 0);
  rect(115, 38, 75, 30);
  rect(235, 65, 95, 30);
  rect(345, 94, 85, 30);
  rect(146, 225, 62, 30);
  rect(45, 254, 145, 30);
  rect(45, 310, 77, 30);
  rect(290, 387, 108, 30);
  rect(302, 444, 80, 30);
  rect(67, 472, 125, 30);

  const r = RENDER;
  const whiteColor = color(240);
  myText(
    "- the pieces move like in chess.\n- you can make 2 moves per turn.\n- move your piece onto a target\nto gain points.",
    50,
    60,
    14,
    whiteColor
  );
  myText(
    "- move your piece onto another\npiece to swap their places and\nsupercharge the other piece.\n- a supercharged piece gains\ntriple points on its next move.",
    50,
    220,
    14,
    whiteColor
  );
  myText(
    "the game ends after 8 rounds.\nat the start of each round:\n- targets increase in value.\n- plus signs become new targets.",
    50,
    410,
    14,
    whiteColor
  );

  const gpi = r.getPieceImage;
  image(gpi({ isWhite: true, name: "K" }), 280, 160, 70, 70);
  image(gpi({ isWhite: true, name: "R" }), 340, 160, 70, 70);
  image(gpi({ isWhite: true, name: "B" }), 400, 160, 70, 70);

  fill(r.LIGHTNING_COLOR);
  stroke(0);
  strokeWeight(1.8);
  let rx = 190;
  let ry = 372;
  for (let i = 0; i < 3; i++) {
    beginShape();
    vertex(rx + 25, ry - 25);
    vertex(rx + 12, ry - 25);
    vertex(rx + 8, ry - 10);
    vertex(rx + 15, ry - 10);
    vertex(rx + 10, ry + 2);
    vertex(rx + 25, ry - 15);
    vertex(rx + 18, ry - 15);
    endShape(CLOSE);
    rx += 40;
  }

  rx = 80;
  ry = 530;
  stroke(0);
  strokeWeight(10);
  line(rx, ry + 7, rx, ry - 7);
  line(rx + 7, ry, rx - 7, ry);
  stroke(r.TARGETS_COLORS[0]);
  strokeWeight(5);
  line(rx, ry + 7, rx, ry - 7);
  line(rx + 7, ry, rx - 7, ry);

  let circlesPositions = [
    { rx: 5, ry: -1 },
    { rx: -3, ry: 1 },
    { rx: 1, ry: 5 },
  ];
  const offsetY = 530;
  const circleSize = CONSTANTS.CIRCLE_SIZE;
  for (let i = 0; i < 6; i++) {
    const offsetX = 120 + i * 50;
    // render circles outlines
    noFill();
    stroke(0);
    strokeWeight(6);
    for (let ci = 0; ci < circlesPositions.length; ci++) {
      const { rx, ry } = circlesPositions[ci];
      ellipse(rx + offsetX, ry + offsetY, circleSize, circleSize);
    }

    // render inner circles
    noStroke();
    const targetColor = color(r.TARGETS_COLORS[i]);
    fill(targetColor);
    for (let ci = 0; ci < circlesPositions.length; ci++) {
      const { rx, ry } = circlesPositions[ci];
      ellipse(rx + offsetX, ry + offsetY, circleSize, circleSize);
    }

    // render value
    const valueStr = i + 1 + "";
    myText(
      valueStr,
      offsetX - r.getNumHalfWidth(valueStr),
      offsetY + 9,
      18,
      color(0)
    );
  }

  GAMEPLAY.help.images[0] = get(40, 10, 400, 180);
  GAMEPLAY.help.images[1] = get(40, 200, 400, 180);
  GAMEPLAY.help.images[2] = get(40, 382, 400, 180);
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
        // add or pop from scenes stack
        const previousScene = SC.scenesStack[SC.scenesStack.length - 1];
        if (previousScene === SC.targetScene) {
          SC.scenesStack.pop();
        } else SC.scenesStack.push(SC.currentScene);
        SC.currentScene = SC.targetScene;
        SC.progress = 0;
        SC.isClosing = false;
        RENDER.lightnings = [];
        // recreate images if going to menu scene
        if (SC.targetScene === "MENU") createImages();
        // recreate help images if going to play scene
        else if (SC.targetScene === "PLAY") createHelpImages();
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
      MENU.renderStandardMenu();
      break;
    case "CUSTOM":
      MENU.renderCustomMenu();
      break;
    case "REPLAYS":
      REPLAYS_MENU.render();
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
      return MENU.standardClicked();
    case "CUSTOM":
      return MENU.customClicked();
    case "REPLAYS":
      return REPLAYS_MENU.clicked();
    case "MENU":
      return MENU.menuClicked();
  }
}
