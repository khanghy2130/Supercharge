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

  // set play scene buttons
  const timelineBtnsAreDisabled = function () {
    const isPlayerTurn = GAMEPLAY.meta.isWhiteTurn
      ? BOT.whiteDepth === 0
      : BOT.blackDepth === 0;
    const result = !GAMEPLAY.meta.gameover && !isPlayerTurn;
    if (result) {
      /// can't use timeline hint
      console.log("timeline button disabled");
    }
    return result;
  };
  r.btns = [
    new Btn(
      225,
      580,
      40,
      28,
      function () {
        stroke(BOARD_INFO.color1);
        strokeWeight(5);
        line(3, -5, -4, 0);
        line(3, 5, -4, 0);
      },
      function () {
        if (timelineBtnsAreDisabled()) return;
        if (REPLAYSYS.skipping !== null) return (REPLAYSYS.skipping = null);
        REPLAYSYS.loadState(false);
      }
    ),
    new Btn(
      275,
      580,
      40,
      28,
      function () {
        stroke(BOARD_INFO.color1);
        strokeWeight(5);
        line(-3, -5, 4, 0);
        line(-3, 5, 4, 0);
      },
      function () {
        if (timelineBtnsAreDisabled()) return;
        if (REPLAYSYS.skipping !== null) return (REPLAYSYS.skipping = null);
        REPLAYSYS.loadState(true);
        if (REPLAYSYS.viewingMoveIndex === GAMEPLAY.meta.latestMoveIndex)
          GAMEPLAY.skipHintCountdown = 0; // stop hint
      }
    ),
    new Btn(
      175,
      580,
      40,
      28,
      function () {
        stroke(BOARD_INFO.color1);
        strokeWeight(5);
        line(7, -5, 0, 0);
        line(7, 5, 0, 0);
        line(-6, -5, -6, 5);
      },
      function () {
        if (timelineBtnsAreDisabled()) return;
        if (REPLAYSYS.skipping !== null) return (REPLAYSYS.skipping = null);
        REPLAYSYS.setUpSkipping(false);
      }
    ),
    new Btn(
      325,
      580,
      40,
      28,
      function () {
        stroke(BOARD_INFO.color1);
        strokeWeight(5);
        line(-7, -5, 0, 0);
        line(-7, 5, 0, 0);
        line(6, -5, 6, 5);
      },
      function () {
        if (timelineBtnsAreDisabled()) return;
        if (REPLAYSYS.skipping !== null) return (REPLAYSYS.skipping = null);
        REPLAYSYS.setUpSkipping(true);
        GAMEPLAY.skipHintCountdown = 0; // stop hint
      }
    ),

    new Btn(
      60,
      580,
      80,
      28,
      function () {
        myText("exit", -28, 8, 16, BOARD_INFO.color1);
      },
      function () {}
    ),

    new Btn(
      440,
      580,
      80,
      28,
      function () {
        myText("stats", -31, 7, 14, BOARD_INFO.color1);
      },
      function () {}
    ),
  ];

  GAMEPLAY.initializeGame({
    white: { botDepth: 3, squad: ["R", "B", "K"] },
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
