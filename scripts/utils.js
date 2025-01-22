const letters = "abcdefgh";

// if you don't mind the lag, change the number below to like 20000 for the game to calculate moves faster
const BOT_PROCESSING_AMOUNT = 8000;

const COLORS = {
  primary: [233, 199, 255],
  targets: [
    [240, 163, 125],
    [240, 223, 125],
    [178, 237, 119],
    [116, 232, 178],
    [125, 213, 240],
    [125, 146, 240],
    [238, 125, 240],
    [240, 125, 156],
  ],
};

const CONSTANTS = {
  MAX_ROUND: 8,
  CHARGED_MULT: 3,
  RESPAWN_TARGETS_COUNT: 3,
  INITIAL_TARGETS_COUNT: 6,
  SKIP_DELAY: 5,
  MOVE_SPEED: 0.08,
  CIRCLE_SIZE: 32,
  VALUE_NUM_SIZE: 18,
};

const BOARD_INFO = {
  color1: [195, 125, 240],
  color2: [125, 70, 160],
  size: 500,
};
BOARD_INFO.sqSize = BOARD_INFO.size / 8;

const KNIGHT_MOVES = [
  [-2, 1],
  [-2, -1],
  [-1, -2],
  [1, -2],
  [2, 1],
  [2, -1],
  [-1, 2],
  [1, 2],
];

const ROOK_MOVES = [
  [0, 1],
  [0, -1],
  [-1, 0],
  [1, 0],
];

const BISHOP_MOVES = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

class Btn {
  constructor(x, y, w, h, renderContent, clicked) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.renderContent = renderContent;
    this.clicked = () => {
      this.animateProgress = 0;
      clicked();
    };
    this.isHovered = false;
    this.animateProgress = 1; // 0 to 1
  }

  render() {
    // check hover
    const hw = this.w / 2,
      hh = this.h / 2;
    if (
      _mouseX > this.x - hw &&
      _mouseX < this.x + hw &&
      _mouseY > this.y - hh &&
      _mouseY < this.y + hh
    ) {
      if (!this.isHovered) {
        this.animateProgress = 0; // initial hover
      }
      this.isHovered = true;
      cursor(HAND);
    } else {
      this.isHovered = false; // not hovered
    }

    if (this.animateProgress < 1) {
      this.animateProgress = min(this.animateProgress + 0.015, 1);
    }

    // render button
    push(); /// KA
    translate(this.x, this.y);
    let scaleFactor = RENDER.easeOutElastic(this.animateProgress);
    if (this.animateProgress < 0.08) scaleFactor = max(1, scaleFactor);
    scaleFactor *= 0.3; // animated range
    scale(0.7 + scaleFactor, 1.3 - scaleFactor); // 1 - or + range
    noStroke();
    fill(BOARD_INFO.color2);
    rect(-hw, -hh, this.w, this.h, 8);
    this.renderContent();
    pop(); /// KA
  }
}

///
function getPieceImage(sd) {
  if (sd.isWhite) {
    if (sd.name === "R") return pieceImages.rw;
    else if (sd.name === "K") return pieceImages.kw;
    else if (sd.name === "B") return pieceImages.bw;
  } else {
    if (sd.name === "R") return pieceImages.rb;
    else if (sd.name === "K") return pieceImages.kb;
    else if (sd.name === "B") return pieceImages.bb;
  }
}
