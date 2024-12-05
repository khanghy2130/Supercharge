const GAMEPLAY = {
  initializeGame: function () {
    // reset boardData
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        boardData[y][x] = null;
      }
    }

    // set starting positions
    boardData[1][1] = { name: "R", isWhite: false, isCharged: false };
    boardData[2][3] = { name: "B", isWhite: false, isCharged: false };
    boardData[1][5] = { name: "K", isWhite: false, isCharged: false };
    boardData[5][6] = { name: "R", isWhite: true, isCharged: false };
    boardData[4][4] = { name: "B", isWhite: true, isCharged: false };
    boardData[5][2] = { name: "K", isWhite: true, isCharged: false };
  },

  renderScene: function () {
    background(20);

    // render board
    rectMode(CORNER);
    noStroke();
    fill(...BOARD_INFO.color1);
    rect(BOARD_INFO.x, BOARD_INFO.y, BOARD_INFO.size, BOARD_INFO.size);

    // render dark squares
    fill(...BOARD_INFO.color2);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if ((x + y) % 2 === 0) continue;
        rect(
          BOARD_INFO.squareSize * x + BOARD_INFO.x,
          BOARD_INFO.squareSize * y + BOARD_INFO.y,
          BOARD_INFO.squareSize,
          BOARD_INFO.squareSize
        );
      }
    }
    rectMode(CENTER);

    // render pieces & targets
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const squareData = boardData[y][x];
        if (squareData) {
          this.renderSquareData(squareData, x, y);
        }
      }
    }
  },

  renderSquareData: function (sd, x, y) {
    const rx = BOARD_INFO.squareSize * (x + 0.5) + BOARD_INFO.x;
    const ry = BOARD_INFO.squareSize * (y + 0.5) + BOARD_INFO.y;
    // target
    if (isTarget(sd)) {
    }
    // piece
    else {
      const pieceImg = getPieceImage(sd);
      image(pieceImg, rx, ry, BOARD_INFO.squareSize, BOARD_INFO.squareSize);
    }
  },

  clicked: function () {},
};
