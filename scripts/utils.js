const letters = "ABCDEFGH";
// const COLORS = {}; ///

const BOARD_INFO = {
  color1: [192, 135, 230],
  color2: [124, 69, 161],
  x: 0,
  y: 0,
  size: 520,
};
BOARD_INFO.sqSize = BOARD_INFO.size / 8;

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
