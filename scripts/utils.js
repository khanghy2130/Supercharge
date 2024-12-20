const letters = "ABCDEFGH";
const COLORS = {
  primary: [233, 199, 255],
};

const MAX_ROUND = 8;
const CHARGED_MULT = 3;
const RESPAWN_TARGETS_COUNT = 3;
const INITIAL_TARGETS_COUNT = 6;

const BOARD_INFO = {
  color1: [196, 128, 242],
  color2: [124, 69, 161],
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
