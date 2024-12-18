const GAMEPLAY = {
  /*
    Piece { isWhite, isCharged, name }
    Target (number)
  */
  // 2D array of pieces or targets
  boardData: [],
  spawningPositions: [],
  hoveredSq: null,
  selectedPiecePos: null, // {x,y}
  possibleMoves: null, // {x,y}[]  (only when selected a piece)
  meta: {
    gameover: true,
    isWhiteTurn: true,
    white: { score: 0, energy: 2, elapsedTime: 0 },
    black: { score: 0, energy: 2, elapsedTime: 0 },
    round: 1,
  },

  // {rx, ry, content, progress}
  pointsPopups: [],

  isTarget: function (sqData) {
    return typeof sqData === "number";
  },

  getRenderPos: function (x, y) {
    return {
      rx: BOARD_INFO.sqSize * (x + 0.5),
      ry: BOARD_INFO.sqSize * (y + 0.5) + BOARD_INFO.y,
    };
  },

  getPieceData: function (name, isWhite) {
    return { name: name, isWhite: isWhite, isCharged: false };
  },
  getNewTargetsPosition: function (amount) {
    const positions = []; // {x,y}[]
    let loopCount = 0; // prevent infinite loop
    while (positions.length < amount && loopCount++ < 100) {
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

  positionIsWithinGrid: function (x, y) {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
  },

  getPossibleMoves: function (pos, board) {
    const moves = [];
    const sqData = board[pos.y][pos.x];
    // add to moves
    if (sqData.name === "K") {
      for (let i = 0; i < KNIGHT_MOVES.length; i++) {
        const vel = KNIGHT_MOVES[i];
        const x = vel[0] + pos.x;
        const y = vel[1] + pos.y;
        if (this.positionIsWithinGrid(x, y)) {
          moves.push({ x, y });
        }
      }
    } else if (sqData.name === "R" || sqData.name === "B") {
      const MOVE_VELS = sqData.name === "R" ? ROOK_MOVES : BISHOP_MOVES;
      for (let i = 0; i < MOVE_VELS.length; i++) {
        const vel = MOVE_VELS[i];
        let x = vel[0] + pos.x;
        let y = vel[1] + pos.y;
        while (this.positionIsWithinGrid(x, y)) {
          moves.push({ x, y });
          // not empty? this direction is blocked
          if (board[y][x] !== null) break;
          x = vel[0] + x;
          y = vel[1] + y;
        }
      }
    }

    return moves;
  },

  applyMove: function (startPos, endPos, board) {
    let scoreGained = 0;
    const sqData = board[endPos.y][endPos.x];
    const movingPiece = board[startPos.y][startPos.x];

    // remove piece from original position
    board[startPos.y][startPos.x] = null;

    // move to empty square?
    if (sqData === null) {
      board[endPos.y][endPos.x] = movingPiece; // move piece there
    }
    // capturing target?
    else if (this.isTarget(sqData)) {
      scoreGained = sqData;
      if (movingPiece.isCharged) scoreGained *= CHARGED_MULT;
      board[endPos.y][endPos.x] = movingPiece; // move piece there
    }
    // swapping?
    else {
      board[endPos.y][endPos.x] = movingPiece; // move piece there
      board[startPos.y][startPos.x] = sqData;
      sqData.isCharged = true;
    }

    movingPiece.isCharged = false; // consume supercharge
    return scoreGained;
  },

  makeMove: function (movePos) {
    const scoreGained = this.applyMove(
      this.selectedPiecePos,
      movePos,
      this.boardData
    );

    if (scoreGained > 0) {
      const scorer = this.meta.isWhiteTurn ? this.meta.white : this.meta.black;
      scorer.score += scoreGained;

      // add score gained to popups
      const { rx, ry } = this.getRenderPos(movePos.x, movePos.y);
      this.pointsPopups.push({
        rx,
        ry,
        content: "+ " + scoreGained,
        progress: 0,
      });
    }

    this.deselectPiece();

    // consume energy
    if (this.meta.isWhiteTurn) {
      this.meta.white.energy--;
      if (this.meta.white.energy <= 0) {
        this.meta.isWhiteTurn = false;
        BOT.finalOutput = null; ////
        if (!BOT.playAsWhite) BOT.startMinimax(); /////
      }
    } else {
      this.meta.black.energy--;
      if (this.meta.black.energy <= 0) {
        BOT.finalOutput = null; ////
        // last round? game over
        if (this.meta.round === MAX_ROUND) {
          this.meta.gameover = true;
          return;
        } else {
          this.meta.isWhiteTurn = true;
          if (BOT.playAsWhite) BOT.startMinimax(); /////
          this.nextRound();
        }
      }
    }
  },

  deselectPiece: function () {
    this.selectedPiecePos = null;
    this.possibleMoves = null;
  },

  updateTargets: function (board) {
    // increase all targets' value
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const sqData = board[y][x];
        if (this.isTarget(sqData)) board[y][x]++;
      }
    }

    // spawn new targets (if no piece standing here)
    for (let i = 0; i < this.spawningPositions.length; i++) {
      const pos = this.spawningPositions[i];
      if (board[pos.y][pos.x] === null) {
        board[pos.y][pos.x] = 1;
      }
    }
  },

  nextRound: function () {
    // skip this first round
    if (this.meta.round > 0) {
      this.updateTargets(this.boardData);
      this.spawningPositions = [];
      // new previews, skip last round (round +1 because isn't increased yet)
      if (this.meta.round + 1 < MAX_ROUND) {
        this.spawningPositions = this.getNewTargetsPosition(
          RESPAWN_TARGETS_COUNT
        );
      }
    }
    this.meta.round++;
    this.meta.white.energy = 2;
    this.meta.black.energy = 2;
  },

  initializeGame: function () {
    // reset meta
    this.meta.gameover = false;
    this.meta.white.score = 0;
    this.meta.black.score = 0;
    this.meta.round = 0;

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
    const targetPositions = this.getNewTargetsPosition(INITIAL_TARGETS_COUNT);
    for (let i = 0; i < targetPositions.length; i++) {
      const pos = targetPositions[i];
      this.boardData[pos.y][pos.x] = 1;
    }

    // initial spawn previews
    this.spawningPositions = this.getNewTargetsPosition(RESPAWN_TARGETS_COUNT);
    this.nextRound();
    if (BOT.playAsWhite) BOT.startMinimax(); /////
  },

  renderBoard: function () {
    // render board background
    rectMode(CORNER);
    noStroke();
    fill(...BOARD_INFO.color1);
    rect(0, BOARD_INFO.y, BOARD_INFO.size, BOARD_INFO.size);

    // render dark squares
    fill(...BOARD_INFO.color2);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if ((x + y) % 2 === 0) continue;
        rect(
          BOARD_INFO.sqSize * x,
          BOARD_INFO.sqSize * y + BOARD_INFO.y,
          BOARD_INFO.sqSize,
          BOARD_INFO.sqSize
        );
      }
    }
    rectMode(CENTER);
  },

  renderUI: function () {
    noStroke();
    textSize(20);
    fill(250);
    text("WHITE: " + this.meta.white.score, 80, 560);
    text("BLACK: " + this.meta.black.score, 250, 560);

    for (let i = 0; i < this.meta.white.energy; i++) {
      square(50 + i * 20, 580, 12, 2);
    }
    for (let i = 0; i < this.meta.black.energy; i++) {
      square(220 + i * 20, 580, 12, 2);
    }

    if (this.meta.gameover) {
      textSize(32);
      text("Gameover", 420, 570);
    } else {
      textSize(18);
      text("ROUND " + this.meta.round, 420, 560);
      text((this.meta.isWhiteTurn ? "White" : "Black") + " to move", 420, 580);
    }
  },

  renderScene: function () {
    background(20);

    // mouse hover on square
    this.hoveredSq = null;
    if (
      _mouseX > 0 &&
      _mouseX < BOARD_INFO.size &&
      _mouseY > BOARD_INFO.y &&
      _mouseY < BOARD_INFO.y + BOARD_INFO.size
    ) {
      this.hoveredSq = {
        x: floor(_mouseX / BOARD_INFO.sqSize),
        y: floor((_mouseY - BOARD_INFO.y) / BOARD_INFO.sqSize),
      };
    }

    this.renderBoard();

    // render pieces & targets
    textSize(32);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const sqData = this.boardData[y][x];
        if (!sqData) continue;
        const { rx, ry } = this.getRenderPos(x, y);
        // target
        if (this.isTarget(sqData)) this.renderTarget(sqData, rx, ry);
        // piece
        else this.renderPiece(sqData, rx, ry);
      }
    }

    // render spawn previews
    noStroke();
    fill(255, 255, 255, cos(frameCount * 3) * 40 + 80);
    for (let i = 0; i < this.spawningPositions.length; i++) {
      const pos = this.spawningPositions[i];
      const { rx, ry } = this.getRenderPos(pos.x, pos.y);
      circle(rx, ry, BOARD_INFO.sqSize / 3);
    }

    // render selected piece outline
    if (this.selectedPiecePos !== null) {
      const { rx, ry } = this.getRenderPos(
        this.selectedPiecePos.x,
        this.selectedPiecePos.y
      );
      stroke(...COLORS.primary);
      strokeWeight(3);
      noFill();
      square(rx, ry, BOARD_INFO.sqSize);
    }

    // render possible moves outlines
    if (this.possibleMoves !== null) {
      noFill();
      stroke(...COLORS.primary);
      strokeWeight(3);
      for (let i = 0; i < this.possibleMoves.length; i++) {
        const pos = this.possibleMoves[i];
        const { rx, ry } = this.getRenderPos(pos.x, pos.y);
        square(rx, ry, BOARD_INFO.sqSize * (0.8 + cos(frameCount * 3) * 0.03));
      }
    }

    // render points popups (first one is always first to disappear)
    noStroke();
    fill(255);
    textSize(24);
    const textYOffset = BOARD_INFO.sqSize * 0.3;
    for (let i = 0; i < this.pointsPopups.length; i++) {
      const pp = this.pointsPopups[i];
      text(
        pp.content,
        pp.rx,
        pp.ry - textYOffset - pp.progress * textYOffset * 0.8
      );

      pp.progress += 0.02;
      if (pp.progress >= 1) {
        this.pointsPopups.shift();
        i--;
      }
    }

    this.renderUI();

    ///// bot arrow
    if (BOT.finalOutput !== null) {
      const mover = this.meta.isWhiteTurn ? this.meta.white : this.meta.black;

      const action = BOT.finalOutput.actionsHistory[0];
      const [sx, sy, ex, ey] =
        action[mover.energy === 2 ? 0 : action.length - 1];
      stroke("lime");
      strokeWeight(2);
      const start = this.getRenderPos(sx, sy);
      const end = this.getRenderPos(ex, ey);
      line(start.rx, start.ry, end.rx, end.ry);
    }

    // process bot //////
    if (BOT.isProcessing) BOT.processMinimax();
  },

  renderPiece: function (sd, rx, ry) {
    const pieceImg = getPieceImage(sd);
    image(pieceImg, rx, ry, BOARD_INFO.sqSize, BOARD_INFO.sqSize);

    // supercharged render
    if (sd.isCharged) {
      stroke("aqua");
      strokeWeight(5);
      noFill();
      circle(rx, ry, BOARD_INFO.sqSize * (0.7 + cos(frameCount * 3) * 0.1));
    }
  },

  renderTarget: function (sd, rx, ry) {
    if (sd === 1) fill(240, 163, 125);
    else if (sd === 2) fill(240, 223, 125);
    else if (sd === 3) fill(186, 240, 125);
    else if (sd === 4) fill(125, 240, 171);
    else if (sd === 5) fill(125, 213, 240);
    else if (sd === 6) fill(125, 146, 240);
    else if (sd === 7) fill(238, 125, 240);
    else if (sd === 8) fill(240, 125, 156);
    else noFill();

    strokeWeight(2);
    stroke(0);
    circle(rx, ry, BOARD_INFO.sqSize * 0.6);

    fill(0);
    noStroke();
    text(sd, rx, ry);
  },

  clicked: function () {
    if (this.meta.gameover) return;

    //// buttons

    // not hovering on a square?
    if (this.hoveredSq === null) return;

    // currently no selected piece?
    if (this.selectedPiecePos === null) {
      const sqData = this.boardData[this.hoveredSq.y][this.hoveredSq.x];
      // check if is not clicking on a piece OR it has the wrong color
      if (
        !sqData ||
        this.isTarget(sqData) ||
        sqData.isWhite !== this.meta.isWhiteTurn
      ) {
        return;
      }
      this.selectedPiecePos = this.hoveredSq;
      this.possibleMoves = this.getPossibleMoves(
        this.selectedPiecePos,
        this.boardData
      );
    }
    // already selected a piece?
    else if (this.possibleMoves !== null) {
      // clicking on a possible move?
      for (let i = 0; i < this.possibleMoves.length; i++) {
        const pos = this.possibleMoves[i];
        if (this.hoveredSq.x === pos.x && this.hoveredSq.y === pos.y) {
          this.makeMove(this.hoveredSq);
          return;
        }
      }
      this.deselectPiece(); // not clicking a possible move
    }
  },
};
