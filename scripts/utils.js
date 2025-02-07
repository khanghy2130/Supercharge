const CONSTANTS = {
  MAX_ROUND: 8,
  CHARGED_MULT: 3,
  RESPAWN_TARGETS_COUNT: 3,
  INITIAL_TARGETS_COUNT: 6,
  SKIP_DELAY: 5,
  CIRCLE_SIZE: 32,
};

const BOARD_INFO = {
  color1: [195, 125, 240],
  color2: [125, 70, 160],
};

const PIECES_MOVES = {
  KNIGHT_MOVES: [
    [-2, 1],
    [-2, -1],
    [-1, -2],
    [1, -2],
    [2, 1],
    [2, -1],
    [-1, 2],
    [1, 2],
  ],
  KING_MOVES: [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ],
  QUEEN_MOVES: [
    [-2, -2],
    [-2, 0],
    [-2, 2],
    [0, -2],
    [0, 2],
    [2, -2],
    [2, 0],
    [2, 2],
  ],
  ROOK_MOVES: [
    [0, 1],
    [0, -1],
    [-1, 0],
    [1, 0],
  ],
  BISHOP_MOVES: [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ],
};

class Btn {
  constructor(x, y, w, h, renderContent, clicked) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.renderContent = renderContent;
    this.clicked = () => {
      this.animateProgress = 0;
      if (clicked !== null) clicked();
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
    if (this.animateProgress < 0.08) this.animateProgress = 0.08;
    let scaleFactor = RENDER.easeOutElastic(this.animateProgress);
    scaleFactor *= 0.3; // animated range
    scale(0.7 + scaleFactor, 1.3 - scaleFactor); // 1 - or + range
    noStroke();
    fill(BOARD_INFO.color2);
    rect(-hw, -hh, this.w, this.h, 8);
    this.renderContent();
    pop(); /// KA
  }
}

const SCENE_CONTROL = {
  isClosing: false,
  progress: 1,
  // scenes: MENU, STANDARD, CUSTOM, REPLAYS, PLAY
  targetScene: "MENU",
  currentScene: "MENU",
  scenesStack: [],

  changeScene: function (targetScene) {
    this.targetScene = targetScene;
    this.isClosing = true;
    this.progress = 0;
  },
};
