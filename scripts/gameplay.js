const GAMEPLAY = {
  isTarget: function (d) {
    return d.value !== undefined;
  },

  getPieceData: function (name, isWhite) {
    return { name: name, isWhite: isWhite, isCharged: false };
  },
  getNewTargetData: function () {
    return { value: 1, sizeProgress: 1 };
  },
  getNewTargetsPosition: function (amount) {
    const positions = []; // {x,y}[]

    while (positions.length < amount) {
      const newPos = {
        x: floor(random() * 8),
        y: floor(random() * 8),
      };

      let alreadyAdded = false;
      for (let i = 0; i < positions.length; i++) {
        if (positions[i].x === newPos.x && positions[i].y === newPos.y) {
          alreadyAdded = true;
          break;
        }
      }
      // already has other targets or pieces? or already added? reroll new one
      if (boardData[newPos.y][newPos.x] || alreadyAdded) continue;

      positions.push(newPos);
    }
    return positions;
  },

  initializeGame: function () {
    // reset boardData
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        boardData[y][x] = null;
      }
    }

    // set starting positions
    boardData[1][1] = this.getPieceData("R", true);
    boardData[3][2] = this.getPieceData("B", true);
    boardData[5][1] = this.getPieceData("K", true);
    boardData[6][6] = this.getPieceData("R", false);
    boardData[4][5] = this.getPieceData("B", false);
    boardData[2][6] = this.getPieceData("K", false);

    const targetPositions = this.getNewTargetsPosition(6); // initial targets count
    for (let i = 0; i < targetPositions.length; i++) {
      const pos = targetPositions[i];
      boardData[pos.y][pos.x] = this.getNewTargetData();
    }
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
    textSize(22);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const squareData = boardData[y][x];
        if (squareData) {
          const rx = BOARD_INFO.squareSize * (x + 0.5) + BOARD_INFO.x;
          const ry = BOARD_INFO.squareSize * (y + 0.5) + BOARD_INFO.y;
          // target
          if (this.isTarget(squareData)) {
            this.renderTarget(squareData, rx, ry);
          }
          // piece
          else {
            this.renderPiece(squareData, rx, ry);
          }
        }
      }
    }
  },

  renderPiece: function (sd, rx, ry) {
    const pieceImg = getPieceImage(sd);
    image(pieceImg, rx, ry, BOARD_INFO.squareSize, BOARD_INFO.squareSize);
  },

  renderTarget: function (sd, rx, ry) {
    if (sd.value < 3) {
      fill(136, 240, 122);
    } else if (sd.value < 5) {
      fill(118, 211, 245);
    } else if (sd.value < 7) {
      fill(247, 240, 104);
    } else {
      fill(240, 105, 146);
    }
    circle(rx, ry, BOARD_INFO.squareSize / 2);
    fill(0);
    text(sd.value, rx, ry);
  },

  clicked: function () {},
};
