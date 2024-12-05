const COLORS = {};

const BOARD_INFO = {
  color1: [192, 135, 230],
  color2: [124, 69, 161],
  x: 0,
  y: 0,
  size: 500,
};
BOARD_INFO.squareSize = BOARD_INFO.size / 8;

/*
	Piece { isWhite, isCharged, name }
	Target { value }
*/
// 2D array of pieces or targets
let boardData = [];
for (let y = 0; y < 8; y++) {
  boardData[y] = [];
  for (let x = 0; x < 8; x++) {
    boardData[y][x] = null;
  }
}

function isTarget(d) {
  return d.value !== undefined;
}

function getRandomPosition() {}

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
