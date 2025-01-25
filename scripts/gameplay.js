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
    latestMoveIndex: 0,
    gameover: true,
    isWhiteTurn: true,
    white: { score: 0, energy: 2 },
    black: { score: 0, energy: 2 },
    round: 1,
    timeStops: [], // alternate white and black
  },

  isTarget: function (sqData) {
    return typeof sqData === "number";
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
      for (let i = 0; i < PIECES_MOVES.KNIGHT_MOVES.length; i++) {
        const vel = PIECES_MOVES.KNIGHT_MOVES[i];
        const x = vel[0] + pos.x;
        const y = vel[1] + pos.y;
        if (this.positionIsWithinGrid(x, y)) {
          moves.push({ x, y });
        }
      }
    } else if (sqData.name === "R" || sqData.name === "B") {
      const MOVE_VELS =
        sqData.name === "R"
          ? PIECES_MOVES.ROOK_MOVES
          : PIECES_MOVES.BISHOP_MOVES;
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
      if (movingPiece.isCharged) scoreGained *= CONSTANTS.CHARGED_MULT;
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

  copySqData: function (sqData) {
    if (sqData === null || this.isTarget(sqData)) {
      return sqData;
    }
    // piece data
    return Object.assign({}, sqData);
  },

  // only when viewing index is the same as latest index
  makeMove: function (movePos) {
    const meta = this.meta;
    if (REPLAYSYS.viewingMoveIndex !== meta.latestMoveIndex) {
      print("Can't make move, viewingMoveIndex !== latestMoveIndex");
      return;
    }

    meta.latestMoveIndex++; // next index

    // add to timeStops when switching turn
    const lmiIndex = meta.latestMoveIndex % 4;
    if (lmiIndex === 1 || lmiIndex === 3) {
      meta.timeStops.push(Date.now());
    }

    // set game over
    if (meta.latestMoveIndex === CONSTANTS.MAX_ROUND * 4 - 1) {
      meta.gameover = true;
    }

    const { x: sx, y: sy } = this.selectedPiecePos;
    const { x: ex, y: ey } = movePos;
    this.deselectPiece(); // clear this.selectedPiecePos

    const moveIndexOfRound = meta.latestMoveIndex % 4;

    // add new move
    REPLAYSYS.moves.push({
      startData: this.copySqData(this.boardData[sy][sx]),
      endData: this.copySqData(this.boardData[ey][ex]),
      lastMove: { sx, sy, ex, ey },
      scoreGained: 0,
    });

    REPLAYSYS.loadState(true);

    // generate and add new targets previews (if is last move of round)
    if (moveIndexOfRound === 3) {
      // if not on last round
      if (meta.latestMoveIndex < (CONSTANTS.MAX_ROUND - 2) * 4) {
        REPLAYSYS.targetPreviewsPositions.push(
          this.getNewTargetsPosition(CONSTANTS.RESPAWN_TARGETS_COUNT)
        );
      } else {
        REPLAYSYS.targetPreviewsPositions.push([]);
      }
    }
    // fix not having the new previews yet
    this.spawningPositions = REPLAYSYS.targetPreviewsPositions[meta.round - 1];

    // BOT.finalOutput = null; // clear previous bot output ////
    // if (!meta.gameover) BOT.startMinimax();
  },

  deselectPiece: function () {
    this.selectedPiecePos = null;
    this.possibleMoves = null;
  },

  updateTargets: function (board, spawnsPositions) {
    // increase all targets' value
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const sqData = board[y][x];
        if (this.isTarget(sqData)) board[y][x]++;
      }
    }

    // spawn new targets (if no piece standing here)
    for (let i = 0; i < spawnsPositions.length; i++) {
      const pos = spawnsPositions[i];
      if (board[pos.y][pos.x] === null) {
        board[pos.y][pos.x] = 1;
      }
    }
  },

  // black/white: { botDepth: 0|1|3, squad: string[3]  }
  initializeGame: function ({ black, white }) {
    // set bots
    BOT.whiteDepth = white.botDepth;
    BOT.blackDepth = black.botDepth;
    BOT.whiteCursor.progress = 1;
    BOT.whiteCursor.endPos = { x: 120, y: 570 };
    BOT.blackCursor.progress = 1;
    BOT.blackCursor.endPos = { x: 360, y: 570 };

    // reset meta
    this.meta.gameover = false;
    this.meta.white.score = 0;
    this.meta.black.score = 0;
    this.meta.round = 1;
    this.meta.latestMoveIndex = -1;
    this.meta.timeStops = [Date.now()];
    this.skipHintCountdown = 0;
    REPLAYSYS.initialize();

    // reset boardData
    for (let y = 0; y < 8; y++) {
      this.boardData[y] = [];
      for (let x = 0; x < 8; x++) {
        this.boardData[y][x] = null;
      }
    }

    // add pieces to board
    this.boardData[1][1] = this.getPieceData(white.squad[0], true);
    this.boardData[3][2] = this.getPieceData(white.squad[1], true);
    this.boardData[5][1] = this.getPieceData(white.squad[2], true);
    this.boardData[2][6] = this.getPieceData(black.squad[0], false);
    this.boardData[4][5] = this.getPieceData(black.squad[1], false);
    this.boardData[6][6] = this.getPieceData(black.squad[2], false);

    RENDER.setPiecesPositions();

    // spawn initial targets
    const targetPositions = this.getNewTargetsPosition(
      CONSTANTS.INITIAL_TARGETS_COUNT
    );
    for (let i = 0; i < targetPositions.length; i++) {
      const pos = targetPositions[i];
      this.boardData[pos.y][pos.x] = 1;
    }

    // set and add first batch of targets previews
    this.spawningPositions = this.getNewTargetsPosition(
      CONSTANTS.RESPAWN_TARGETS_COUNT
    );
    REPLAYSYS.targetPreviewsPositions = [this.spawningPositions];

    // render play scene buttons
    for (let i = 0; i < RENDER.btns.length; i++) {
      const b = RENDER.btns[i];
      b.isHovered = false;
      b.animateProgress = 1;
    }
    RENDER.capturedTR.progress = 1; // end animation
    RENDER.lightnings = [];
    RENDER.targets = [];
    RENDER.updateAllTRs(true);

    // set player names
    const allNames = ["player", "easy bot", "", "hard bot"];
    RENDER.playersNames = [allNames[white.botDepth], allNames[black.botDepth]];
  },

  renderBoard: function () {
    // render dark squares
    fill(BOARD_INFO.color2);
    noStroke();
    const ss = BOARD_INFO.sqSize;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if ((x + y) % 2 === 0) continue;
        rect(ss * x, ss * y, ss, ss);
      }
    }
  },

  renderScene: function () {
    background(BOARD_INFO.color1);
    const bd = this.boardData;

    REPLAYSYS.updateSkipping();

    const r = RENDER;
    // mouse hover on square
    this.hoveredSq = null;
    if (
      _mouseX > 0 &&
      _mouseX < BOARD_INFO.size &&
      _mouseY > 0 &&
      _mouseY < BOARD_INFO.size
    ) {
      this.hoveredSq = {
        x: floor(_mouseX / BOARD_INFO.sqSize),
        y: floor(_mouseY / BOARD_INFO.sqSize),
      };
    }

    r.renderUI();
    this.renderBoard();

    r.renderAllPieces(bd);
    r.renderLightnings();

    // render spawn previews
    stroke(r.TARGETS_COLORS[0]);
    strokeWeight(5);
    for (let i = 0; i < this.spawningPositions.length; i++) {
      const pos = this.spawningPositions[i];
      const { rx, ry } = r.getRenderPos(pos.x, pos.y);
      line(rx, ry + 7, rx, ry - 7);
      line(rx + 7, ry, rx - 7, ry);
    }

    // render possible moves outlines
    if (this.possibleMoves !== null) {
      const ss = BOARD_INFO.sqSize;
      for (let i = 0; i < this.possibleMoves.length; i++) {
        const pos = this.possibleMoves[i];
        if (
          this.hoveredSq !== null &&
          this.hoveredSq.x === pos.x &&
          this.hoveredSq.y === pos.y
        ) {
          cursor(HAND);
          fill(255, 70);
        } else noFill();
        stroke(200);
        strokeWeight(3);
        rect(ss * pos.x, ss * pos.y, ss, ss);

        // render charge icon if here is an uncharged piece
        const sd = bd[pos.y][pos.x];
        if (sd !== null && !this.isTarget(sd) && !sd.isCharged) {
          const { rx, ry } = r.getRenderPos(pos.x, pos.y);
          fill(
            lerpColor(
              r.LIGHTNING_COLOR,
              color(0, 0),
              0.2 * cos(frameCount * 12) + 0.2
            )
          );
          noStroke();
          beginShape();
          vertex(rx + 25, ry - 25);
          vertex(rx + 12, ry - 25);
          vertex(rx + 8, ry - 10);
          vertex(rx + 15, ry - 10);
          vertex(rx + 10, ry + 2);
          vertex(rx + 25, ry - 15);
          vertex(rx + 18, ry - 15);
          endShape(CLOSE);
        }
      }
    }

    r.renderAllTargets();

    // render skip hint arrow
    if (this.skipHintCountdown-- > 0) {
      stroke(255, 255, 0);
      strokeWeight(6);
      const bounceY = cos(frameCount * 8) * 8;
      line(325, 550 + bounceY, 315, 540 + bounceY);
      line(325, 550 + bounceY, 335, 540 + bounceY);
      line(325, 550 + bounceY, 325, 500 + bounceY);
    }

    BOT.renderBotCursors();

    ///// bot arrow
    if (BOT.finalOutput !== null && frameCount % 60 > 18) {
      const mover = this.meta.isWhiteTurn ? this.meta.white : this.meta.black;
      const action = BOT.finalOutput.actionsHistory[0];
      const [sx, sy, ex, ey] =
        action[mover.energy === 2 ? 0 : action.length - 1];
      stroke(255, 50, 50);
      strokeWeight(5);
      const start = RENDER.getRenderPos(sx, sy);
      const end = RENDER.getRenderPos(ex, ey);
      line(start.rx, start.ry, end.rx, end.ry);
      push();
      translate(end.rx, end.ry);
      rotate(atan2(end.ry - start.ry, end.rx - start.rx));
      line(-10, 10, 0, 0);
      line(-10, -10, 0, 0);
      pop();
    }

    // process bot //////
    if (BOT.isProcessing) BOT.processMinimax();
  },

  clicked: function () {
    // buttons
    //// if bot is playing then return, except for exit button
    for (let i = 0; i < RENDER.btns.length; i++) {
      const b = RENDER.btns[i];
      if (b.isHovered) b.clicked();
    }

    if (this.meta.gameover || BOT.isProcessing || REPLAYSYS.skipping !== null)
      return;

    // bot options ////
    if (_mouseX > 470) {
      if (_mouseY > 530 - 15 && _mouseY < 530 + 15) {
        BOT.playAsWhite = !BOT.playAsWhite;
        BOT.finalOutput = null;
        BOT.startMinimax();
      }
    }

    // not hovering on a square?
    if (this.hoveredSq === null) return;

    // not viewing latest index?
    if (this.meta.latestMoveIndex > REPLAYSYS.viewingMoveIndex) {
      this.skipHintCountdown = 120;
      return;
    }

    // currently no selected piece
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
