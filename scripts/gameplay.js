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

  result: {
    countDown: 0,
    isShown: false,
    progress: 0,
    bgImage: null,
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

    meta.latestMoveIndex++; // next index

    // add to timeStops when switching turn
    const lmiIndex = meta.latestMoveIndex % 4;
    if (lmiIndex === 1 || lmiIndex === 3) {
      meta.timeStops.push(Date.now());
    }

    // set game over
    if (meta.latestMoveIndex === CONSTANTS.MAX_ROUND * 4 - 1) {
      meta.gameover = true;
      this.result.countDown = 120;
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
    const bot = BOT;
    const r = RENDER;

    // set bots
    bot.whiteDepth = white.botDepth;
    bot.blackDepth = black.botDepth;
    bot.whiteCursor.progress = 1;
    bot.whiteCursor.endPos = bot.whiteCursor.homePos;
    bot.blackCursor.progress = 1;
    bot.blackCursor.endPos = bot.blackCursor.homePos;

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

    r.setPiecesPositions();

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

    // reset play scene buttons
    for (let i = 0; i < r.btns.length; i++) {
      const b = r.btns[i];
      b.isHovered = false;
      b.animateProgress = 1;
    }
    r.capturedTR.progress = 1; // end animation
    r.lightnings = [];
    r.targets = [];
    r.updateAllTRs(true);

    // set player names
    const allNames = ["player", "easy bot", "", "hard bot"];
    r.playersNames = [allNames[white.botDepth], allNames[black.botDepth]];
  },

  renderScene: function () {
    const bd = this.boardData;
    const bot = BOT;
    const r = RENDER;
    const meta = this.meta;
    const isPlayerTurn = meta.isWhiteTurn
      ? bot.whiteDepth === 0
      : bot.blackDepth === 0;

    // update result
    if (meta.gameover) {
      const result = this.result;
      if (result.countDown > 0) {
        result.countDown--;
        if (result.countDown === 0) {
          result.bgImage = get(0, 0, width, height);
          result.isShown = true;
          result.progress = 0;
        }
      } else if (result.isShown) {
        result.progress = result.progress + 0.004;
        image(result.bgImage, width / 2, height / 2, width, height);
        noStroke();
        fill(0, min(210, map(result.progress, 0, 0.15, 0, 210)));
        rect(0, 0, width, height);

        const scores = [];
        const moves = REPLAYSYS.moves;
        let wScore = 0;
        let bScore = 0;
        for (let i = 0; i < moves.length; i++) {
          const move = moves[i];
          const mifr = i % 4;

          if (mifr < 2) {
            wScore += move.scoreGained;
            if (mifr === 1) {
              scores.push([wScore]);
            }
          } else {
            bScore += move.scoreGained;
            if (mifr === 3) {
              scores[scores.length - 1].push(bScore);
            }
          }
        }

        let arr;
        if (wScore === bScore) {
          arr = ["draw", 150, color(250, 100, 220)];
        } else if (
          bot.whiteDepth === bot.blackDepth ||
          (bot.whiteDepth > 0 && bot.blackDepth > 0)
        ) {
          arr = ["completed", 55, color(90, 160, 245)];
        } else if (bot.whiteDepth === 0 ? wScore > bScore : bScore > wScore) {
          arr = ["victory", 100, color(100, 245, 100)];
        } else {
          arr = ["defeat", 120, color(240, 80, 80)];
        }

        const t = min(1, result.progress);
        let frequency = 22 - 12 * t; // startAmount - decreasedBy
        myText(
          arr[0],
          arr[1],
          120,
          50,
          lerpColor(color(255), arr[2], (cos(t * 180 * frequency) + 1) / 2)
        );

        // score bars
        if (result.progress > 0.6) {
          const sbPrg = map(result.progress, 0.6, 1, 0, 8); // 0 to 8

          for (let i = 0; i < scores.length; i++) {
            if (sbPrg < i) break; // not here yet
            const [wScore, bScore] = scores[i];
            const totalRoundScore = wScore + bScore;
            const gainedWScore = wScore - (i === 0 ? 0 : scores[i - 1][0]);
            const gainedBScore = bScore - (i === 0 ? 0 : scores[i - 1][1]);
            const selfPrg = min(1, map(sbPrg, i, i + 1, 0, 1));
            const yValue = 180 + 35 * i + (1 - selfPrg) * 20;

            fill(20, selfPrg * 255);
            rect(100, yValue, 300, 35);
            fill(240, selfPrg * 255);
            rect(100, yValue, (300 * wScore) / totalRoundScore, 35);

            myText(
              "+" + gainedWScore,
              40,
              yValue + 26,
              16,
              color(240, selfPrg * 255)
            );
            myText(
              "+" + gainedBScore,
              415,
              yValue + 26,
              16,
              color(240, selfPrg * 255)
            );
          }
        }

        // click to close text
        if (result.progress > 1.2) {
          myText(
            "click anywhere to close",
            110,
            540,
            14,
            color(220, min(255, map(result.progress, 1.2, 1.4, 0, 255)))
          );
        }

        return;
      }
    }

    REPLAYSYS.updateSkipping();

    // current cursor hover on square
    this.hoveredSq = null;
    const cursorPos = isPlayerTurn
      ? { x: _mouseX, y: _mouseY }
      : meta.isWhiteTurn
      ? bot.whiteCursor.currentPos
      : bot.blackCursor.currentPos;

    if (
      cursorPos.x > 0 &&
      cursorPos.x < BOARD_INFO.size &&
      cursorPos.y > 0 &&
      cursorPos.y < BOARD_INFO.size
    ) {
      this.hoveredSq = {
        x: floor(cursorPos.x / BOARD_INFO.sqSize),
        y: floor(cursorPos.y / BOARD_INFO.sqSize),
      };
    }

    background(BOARD_INFO.color1);
    r.renderUI(isPlayerTurn);

    // render board
    image(BOARD_INFO.boardImage, 250, 250, 500, 500);

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

    r.renderAllTargets();

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
          if (isPlayerTurn) cursor(HAND);
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

    // render skip hint arrow
    if (this.skipHintCountdown > 0) {
      this.skipHintCountdown--;
      stroke(BOARD_INFO.color2);
      strokeWeight(6);
      const bounceY = cos(frameCount * 8) * 8;
      line(325, 550 + bounceY, 315, 540 + bounceY);
      line(325, 550 + bounceY, 335, 540 + bounceY);
      line(325, 550 + bounceY, 325, 500 + bounceY);
    }

    bot.renderBotCursors();
    // update bot turn
    if (bot.isProcessing) bot.processMinimax();
    // not currently processing & not player turn & not gameover & not piece moving & not capturing
    else if (
      !isPlayerTurn &&
      !meta.gameover &&
      r.movement.progress === 1 &&
      meta.latestMoveIndex === REPLAYSYS.viewingMoveIndex
    ) {
      // no output yet?
      if (bot.finalOutput === null) bot.startMinimax();
      // has output?
      else {
        // first move or last move
        const action = bot.finalOutput.actionsHistory[0];
        const botCursor = meta.isWhiteTurn ? bot.whiteCursor : bot.blackCursor;

        const energy = meta.isWhiteTurn ? meta.white.energy : meta.black.energy;
        const move = energy === 2 ? action[0] : action[action.length - 1];

        // move status: calculating > piece > option
        if (bot.moveStatus === 0) {
          bot.moveStatus = 1;
          const pos = r.getRenderPos(move[0], move[1]);
          bot.startBotCursorMove(botCursor, { x: pos.rx, y: pos.ry }, true);
        } else if (bot.moveStatus === 1) {
          // done moving to piece? select piece
          if (botCursor.progress === 1) {
            bot.moveStatus = 2;
            this.selectedPiecePos = this.hoveredSq;
            this.possibleMoves = this.getPossibleMoves(
              this.selectedPiecePos,
              bd
            );
            r.selectedPieceProgress = 0;

            const pos = r.getRenderPos(move[2], move[3]);
            bot.startBotCursorMove(botCursor, { x: pos.rx, y: pos.ry }, true);
          }
        } else if (bot.moveStatus === 2) {
          // done moving to option? apply move
          if (botCursor.progress === 1) {
            for (let i = 0; i < this.possibleMoves.length; i++) {
              const oPos = this.possibleMoves[i];
              if (this.hoveredSq.x === oPos.x && this.hoveredSq.y === oPos.y) {
                this.makeMove(this.hoveredSq);
                break;
              }
            }
            this.deselectPiece();

            if (energy === 2) bot.moveStatus = 0; // repeat for next move
            // return to home position
            else {
              bot.finalOutput = null;
              bot.startBotCursorMove(botCursor, botCursor.homePos);
            }
          }
        }
      }
    }
  },

  clicked: function () {
    // close result
    if (this.result.isShown && this.result.progress > 1.2) {
      this.result.isShown = false;
      return;
    }

    const r = RENDER;
    // buttons
    for (let i = 0; i < r.btns.length; i++) {
      const b = r.btns[i];
      if (b.isHovered) return b.clicked();
    }

    if (this.meta.gameover || REPLAYSYS.skipping !== null) return;

    // not viewing latest index & clicked on board?
    if (
      this.meta.latestMoveIndex > REPLAYSYS.viewingMoveIndex &&
      _mouseY < 500
    ) {
      this.skipHintCountdown = 120;
      return;
    }

    // not hovering on a square?
    if (this.hoveredSq === null) return;

    // not player turn?
    if (this.meta.isWhiteTurn ? BOT.whiteDepth !== 0 : BOT.blackDepth !== 0)
      return;

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
      r.selectedPieceProgress = 0;
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
