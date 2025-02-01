let pieceImages;
function preload() {
  pieceImages = {
    rw: loadImage("../images/rw.png"),
    rb: loadImage("../images/rb.png"),
    kw: loadImage("../images/kw.png"),
    kb: loadImage("../images/kb.png"),
    bw: loadImage("../images/bw.png"),
    bb: loadImage("../images/bb.png"),
    lw: loadImage("../images/lw.png"),
    lb: loadImage("../images/lb.png"),
    qw: loadImage("../images/qw.png"),
    qb: loadImage("../images/qb.png"),
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
    function _clear() {
      clear(); /// KA background(0,0);
    }
    const ss = 100;

    const whiteColor = color(240);
    const blackColor = color(20);

    strokeWeight(ss * 0.05);

    const rookShape = [
      [ss * 0.15, ss * 0.15],
      [ss * 0.15, ss * 0.55],
      [ss * 0.3, ss * 0.55],
      [ss * 0.3, ss * 0.7],
      [ss * 0.15, ss * 0.7],
      [ss * 0.15, ss * 0.85],
      [ss * 0.85, ss * 0.85],
      [ss * 0.85, ss * 0.7],
      [ss * 0.7, ss * 0.7],
      [ss * 0.7, ss * 0.55],
      [ss * 0.85, ss * 0.55],
      [ss * 0.85, ss * 0.15],
    ];

    _clear();
    stroke(blackColor);
    fill(whiteColor);
    beginShape();
    for (let [x, y] of rookShape) {
      vertex(x, y);
    }
    endShape(CLOSE);
    fill(blackColor);
    rect(ss * 0.35, ss * 0.17, ss * 0.05, ss * 0.12);
    rect(ss * 0.6, ss * 0.17, ss * 0.05, ss * 0.12);
    pieceImages.rw = get(0, 0, ss, ss);

    _clear();
    stroke(whiteColor);
    fill(blackColor);
    beginShape();
    for (let [x, y] of rookShape) {
      vertex(x, y);
    }
    endShape(CLOSE);
    fill(whiteColor);
    rect(ss * 0.35, ss * 0.17, ss * 0.05, ss * 0.12);
    rect(ss * 0.6, ss * 0.17, ss * 0.05, ss * 0.12);
    pieceImages.rb = get(0, 0, ss, ss);

    // render test ///
    fill(BOARD_INFO.color1);
    noStroke();
    square(width / 2 - 150, width / 2 - 150, 300);
    image(pieceImages.rb, width / 2, width / 2, 300, 300);
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

  // set play scene buttons
  const timelineBtnsAreDisabled = function () {
    const meta = GAMEPLAY.meta;
    const isPlayerTurn = meta.isWhiteTurn
      ? BOT.whiteDepth === 0
      : BOT.blackDepth === 0;
    const result =
      !meta.gameover &&
      !isPlayerTurn &&
      meta.latestMoveIndex === REPLAYSYS.viewingMoveIndex;
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
        myText("help", -28, 8, 16, BOARD_INFO.color1);
      },
      function () {}
    ),
  ];

  const grp = () => "R";
  random(["R", "B", "K", "L", "Q"]); ///
  GAMEPLAY.initializeGame({
    /// random([0, 1, 3, 3])
    /// random(["R", "B", "K", "L", "Q"])
    white: { botDepth: 0, squad: [grp(), grp(), grp()] },
    black: { botDepth: 0, squad: [grp(), grp(), grp()] },
  });
  // background(0);  ////
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
  // return;
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
