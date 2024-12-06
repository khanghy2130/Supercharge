const GAMEPLAY = {
  /*
    Piece { isWhite, isCharged, name }
    Target { value, sizeProgress }  (SP goes to 0)
  */
  // 2D array of pieces or targets
  boardData: [],
  spawningPositions: [],
  stats: {
    gameover: true,
    isWhiteTurn: true,
    white: { score: 0, energy: 1 },
    black: { score: 0, energy: 1 },
    round: 1,
  },

  isTarget: function (sqData) {
    return sqData.value !== undefined;
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
      if (this.boardData[newPos.y][newPos.x] || alreadyAdded) continue;

      positions.push(newPos);
    }
    return positions;
  },

  // should be called before nextRound()
  nextTurn: function () {
    // increase all targets' value
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const sqData = this.boardData[y][x];
        if (sqData && this.isTarget(sqData)) {
          sqData.value++;
        }
      }
    }

    // spawn new targets (not on round 1)
    for (let i = 0; i < this.spawningPositions.length; i++) {
      const pos = this.spawningPositions[i];
      this.boardData[pos.y][pos.x] = this.getNewTargetData();
    }

    // new previews (if not last round)
    if (this.stats.round < 4) {
      this.spawningPositions = this.getNewTargetsPosition(2);
    }
  },

  nextRound: function () {
    this.stats.round++;
    this.stats.white.energy = this.stats.round;
    this.stats.black.energy = this.stats.round;
    this.stats.isWhiteTurn = true;
  },

  initializeGame: function () {
    // reset stats
    this.stats.gameover = false;
    this.stats.white.score = 0;
    this.stats.black.score = 0;
    this.stats.round = 0;

    // reset boardData
    for (let y = 0; y < 8; y++) {
      this.boardData[y] = [];
      for (let x = 0; x < 8; x++) {
        this.boardData[y][x] = null;
      }
    }

    // set starting positions
    this.boardData[1][1] = this.getPieceData("R", true);
    this.boardData[3][2] = this.getPieceData("B", true);
    this.boardData[5][1] = this.getPieceData("K", true);
    this.boardData[6][6] = this.getPieceData("R", false);
    this.boardData[4][5] = this.getPieceData("B", false);
    this.boardData[2][6] = this.getPieceData("K", false);

    // spawn initial targets
    const targetPositions = this.getNewTargetsPosition(6);
    for (let i = 0; i < targetPositions.length; i++) {
      const pos = targetPositions[i];
      this.boardData[pos.y][pos.x] = this.getNewTargetData();
    }

    // initial spawn previews
    this.spawningPositions = this.getNewTargetsPosition(2);
    this.nextRound();
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
          BOARD_INFO.sqSize * x + BOARD_INFO.x,
          BOARD_INFO.sqSize * y + BOARD_INFO.y,
          BOARD_INFO.sqSize,
          BOARD_INFO.sqSize
        );
      }
    }
    rectMode(CENTER);

    // render board coordinate
    noStroke();
    fill(120);
    textSize(16);
    for (let i = 0; i < 8; i++) {
      text(
        letters[i],
        BOARD_INFO.sqSize * (i + 0.5) + BOARD_INFO.x,
        BOARD_INFO.y + BOARD_INFO.size + 12
      );
    }
    for (let i = 0; i < 8; i++) {
      text(
        8 - i,
        BOARD_INFO.x + BOARD_INFO.size + 10,
        BOARD_INFO.sqSize * (i + 0.5) + BOARD_INFO.y
      );
    }

    // render spawn previews
    fill(255, 255, 255, cos(frameCount * 3) * 40 + 80);
    for (let i = 0; i < this.spawningPositions.length; i++) {
      const pos = this.spawningPositions[i];
      const rx = BOARD_INFO.sqSize * (pos.x + 0.5) + BOARD_INFO.x;
      const ry = BOARD_INFO.sqSize * (pos.y + 0.5) + BOARD_INFO.y;
      circle(rx, ry, BOARD_INFO.sqSize / 3);
    }

    // render pieces & targets
    textSize(22);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const sqData = this.boardData[y][x];
        if (!sqData) continue;
        const rx = BOARD_INFO.sqSize * (x + 0.5) + BOARD_INFO.x;
        const ry = BOARD_INFO.sqSize * (y + 0.5) + BOARD_INFO.y;
        // target
        if (this.isTarget(sqData)) {
          this.renderTarget(sqData, rx, ry);
        }
        // piece
        else {
          this.renderPiece(sqData, rx, ry);
        }
      }
    }

    // render stats
    noStroke();
    textSize(24);
    fill(250);
    text("WHITE: " + this.stats.white.score, 80, 560);
    text("BLACK: " + this.stats.black.score, 250, 560);

    for (let i = 0; i < this.stats.white.energy; i++) {
      circle(50 + i * 20, 580, 12);
    }
    for (let i = 0; i < this.stats.black.energy; i++) {
      circle(220 + i * 20, 580, 12);
    }

    textSize(32);
    text("ROUND " + this.stats.round, 480, 570);
  },

  renderPiece: function (sd, rx, ry) {
    const pieceImg = getPieceImage(sd);
    image(pieceImg, rx, ry, BOARD_INFO.sqSize, BOARD_INFO.sqSize);
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
    circle(rx, ry, BOARD_INFO.sqSize / 2);

    /*
    beginShape();
    const deg = 360 / (sd.value + 2);
    for (let i = 0; i < sd.value + 2; i++) {
      vertex(
        rx + (sin(i * deg) * BOARD_INFO.sqSize) / 3,
        ry + (cos(i * deg) * BOARD_INFO.sqSize) / 3
      );
    }
    endShape(CLOSE);
    stroke(80, 160, 80);
    for (let i = 0; i < sd.value + 2; i++) {
      line(
        rx + (sin(i * deg) * BOARD_INFO.sqSize) / 3,
        ry + (cos(i * deg) * BOARD_INFO.sqSize) / 3,
        rx,
        ry
      );
    }
    noStroke();
    */

    fill(0);
    text(sd.value, rx, ry);
  },

  clicked: function () {
    if (this.stats.gameover) return;
    if (this.stats.isWhiteTurn) {
      this.stats.white.energy--;
      if (this.stats.white.energy <= 0) {
        this.stats.isWhiteTurn = false;
        this.nextTurn();
      }
    } else {
      this.stats.black.energy--;
      if (this.stats.black.energy <= 0) {
        // last round? game over
        if (this.stats.round === 4) {
          this.gameover = true;
          return;
        } else {
          this.nextTurn();
          this.nextRound();
        }
      }
    }
  },
};
