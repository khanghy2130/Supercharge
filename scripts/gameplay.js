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
    latestMoveIndex: -1,
    gameover: true,
    isWhiteTurn: true,
    white: { score: 0, energy: 2 },
    black: { score: 0, energy: 2 },
    round: 1,
    timeStops: [], // alternate white and black
  },
  help: {
    images: [],
    isShown: false,
    progress: 0,
  },

  result: {
    countDown: 0,
    isShown: false,
    progress: 0,
    bgImage: null,
  },
  hintArrow: {
    x: 0,
    countDown: 0,
  },
  isNewPlayer: true,
  savedConfig: null,
  exitWarning: {
    btns: [],
    isShown: false,
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
    if (sqData.name === "R" || sqData.name === "B") {
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
    } else {
      let pieceMoves;
      if (sqData.name === "K") pieceMoves = PIECES_MOVES.KNIGHT_MOVES;
      else if (sqData.name === "Q") pieceMoves = PIECES_MOVES.QUEEN_MOVES;
      else if (sqData.name === "L") pieceMoves = PIECES_MOVES.KING_MOVES;

      for (let i = 0; i < pieceMoves.length; i++) {
        const vel = pieceMoves[i];
        const x = vel[0] + pos.x;
        const y = vel[1] + pos.y;
        if (this.positionIsWithinGrid(x, y)) {
          moves.push({ x, y });
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
      this.result.countDown = 100;
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

    // handle streak
    const SS = SCENE_CONTROL.scenesStack;
    if (SS[SS.length - 1] === "STANDARD" && meta.gameover) {
      const bot = BOT;
      const playerIsWhite = bot.whiteDepth === 0;
      const botIsHard = bot.whiteDepth === 3 || bot.blackDepth === 3;
      const playerScore = playerIsWhite ? meta.white.score : meta.black.score;
      const botScore = playerIsWhite ? meta.black.score : meta.white.score;
      const streakArr = botIsHard ? MENU.streak.hard : MENU.streak.easy;
      if (playerScore > botScore) {
        streakArr[0]++;
        if (streakArr[0] > streakArr[1]) streakArr[1] = streakArr[0];
      } else if (botScore > playerScore) {
        streakArr[0] = 0;
      }
      // save to storage /// KA
      localStorage.setItem(
        botIsHard ? "hard" : "easy",
        JSON.stringify(streakArr)
      );
    }
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
    bot.isProcessing = false;
    bot.finalOutput = null;
    bot.whiteDepth = white.botDepth;
    bot.blackDepth = black.botDepth;
    bot.whiteCursor.progress = 1;
    bot.whiteCursor.endPos = bot.whiteCursor.homePos;
    bot.blackCursor.progress = 1;
    bot.blackCursor.endPos = bot.blackCursor.homePos;

    // reset meta
    this.savedConfig = { white, black };
    this.meta.gameover = false;
    this.meta.isWhiteTurn = true;
    this.meta.white.score = 0;
    this.meta.black.score = 0;
    this.meta.white.energy = 2;
    this.meta.black.energy = 2;
    this.meta.round = 1;
    this.meta.latestMoveIndex = -1;
    this.meta.timeStops = [Date.now()];
    this.selectedPiecePos = null;
    this.possibleMoves = null;
    if (this.isNewPlayer) {
      this.hintArrow.x = r.btns[5].x;
      this.hintArrow.countDown = 200;
      this.isNewPlayer = false;
      // save to storage /// KA
      localStorage.setItem("isNewPlayer", "1");
    } else {
      this.hintArrow.countDown = 0;
    }
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
        result.progress += 0.005;
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
        if (result.progress > 0.2) {
          const sbPrg = map(result.progress, 0.2, 1, 0, 8); // 0 to 8

          for (let i = 0; i < scores.length; i++) {
            if (sbPrg < i) break; // not here yet
            const [wScore, bScore] = scores[i];
            const totalRoundScore = wScore + bScore;
            const gainedWScore = wScore - (i === 0 ? 0 : scores[i - 1][0]);
            const gainedBScore = bScore - (i === 0 ? 0 : scores[i - 1][1]);
            const selfPrg = min(1, map(sbPrg, i, i + 1, 0, 1));
            const yValue = 180 + 35 * i + (1 - selfPrg) * 20;

            fill(40, selfPrg * 255);
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
      cursorPos.x < 500 &&
      cursorPos.y > 0 &&
      cursorPos.y < 500
    ) {
      this.hoveredSq = {
        x: floor(cursorPos.x / 62.5),
        y: floor(cursorPos.y / 62.5),
      };
    }

    background(BOARD_INFO.color1);
    r.renderUI(isPlayerTurn);

    // render board
    image(BOARD_INFO.boardImage, 250, 250, 500, 500);

    r.renderAllPieces(bd);
    r.renderLightnings();

    // render spawn previews
    for (let i = 0; i < this.spawningPositions.length; i++) {
      const pos = this.spawningPositions[i];
      const { rx, ry } = r.getRenderPos(pos.x, pos.y);
      stroke(0);
      strokeWeight(10);
      line(rx, ry + 7, rx, ry - 7);
      line(rx + 7, ry, rx - 7, ry);
      stroke(r.TARGETS_COLORS[0]);
      strokeWeight(5);
      line(rx, ry + 7, rx, ry - 7);
      line(rx + 7, ry, rx - 7, ry);
    }

    r.renderAllTargets();

    // render possible moves outlines
    if (this.possibleMoves !== null) {
      const ss = 62.5;
      for (let i = 0, pms = this.possibleMoves; i < pms.length; i++) {
        const pos = pms[i];
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
          stroke(0);
          strokeWeight(1.8);
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

    // render hint arrow
    if (this.hintArrow.countDown > 0) {
      this.hintArrow.countDown--;
      const bounceY = cos(frameCount * 8) * 8;
      const xValue = this.hintArrow.x;
      stroke(0);
      strokeWeight(10);
      line(xValue, 550 + bounceY, xValue - 10, 540 + bounceY);
      line(xValue, 550 + bounceY, xValue + 10, 540 + bounceY);
      line(xValue, 550 + bounceY, xValue, 500 + bounceY);
      stroke(r.LIGHTNING_COLOR);
      strokeWeight(5);
      line(xValue, 550 + bounceY, xValue - 10, 540 + bounceY);
      line(xValue, 550 + bounceY, xValue + 10, 540 + bounceY);
      line(xValue, 550 + bounceY, xValue, 500 + bounceY);
    }

    bot.renderBotCursors();
    // update bot turn
    if (SCENE_CONTROL.progress >= 1) {
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
          const botCursor = meta.isWhiteTurn
            ? bot.whiteCursor
            : bot.blackCursor;

          const energy = meta.isWhiteTurn
            ? meta.white.energy
            : meta.black.energy;
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
                if (
                  this.hoveredSq.x === oPos.x &&
                  this.hoveredSq.y === oPos.y
                ) {
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
    }

    // render help
    if (this.help.isShown) {
      this.help.progress += 0.005;
      cursor(ARROW);
      noStroke();
      fill(0, 200);
      rect(0, 0, 500, 600);
      const hImgs = this.help.images;
      for (let i = 0; i < hImgs.length; i++) {
        push(); /// KA
        translate(250, 100 + 185 * i);
        const minVal = i * 0.15;
        const maxVal = minVal + 0.4;
        if (this.help.progress > minVal) {
          let scaleFactor = r.easeOutElastic(
            map(
              constrain(this.help.progress, minVal, maxVal),
              minVal,
              maxVal,
              0,
              1
            )
          );
          scaleFactor *= 0.5; // animated range
          scale(0.5 + scaleFactor, 1.5 - scaleFactor); // 1 - or + range
          image(hImgs[i], 0, 0, 400, 180);
        }
        pop(); /// KA
      }
    }
    // render exit warning
    else if (this.exitWarning.isShown) {
      cursor(ARROW);
      noStroke();
      fill(0, 200);
      rect(0, 0, 500, 600);
      myText(
        "quitting will stop win\nstreak, continue?",
        65,
        200,
        20,
        color(250)
      );
      for (let i = 0; i < this.exitWarning.btns.length; i++) {
        this.exitWarning.btns[i].render();
      }
    }
  },

  clicked: function () {
    const r = RENDER;

    // showing help?
    if (this.help.isShown) {
      this.help.isShown = false;
      return;
    }

    // showing exit warning?
    if (this.exitWarning.isShown) {
      for (let i = 0; i < this.exitWarning.btns.length; i++) {
        const b = this.exitWarning.btns[i];
        if (b.isHovered) return b.clicked();
      }
      return;
    }

    // close result
    if (this.result.isShown && this.result.progress > 1.2) {
      this.result.isShown = false;
      this.hintArrow.x = r.btns[4].x;
      this.hintArrow.countDown = 120;
      return;
    }

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
      this.hintArrow.x = r.btns[3].x;
      this.hintArrow.countDown = 120;
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
