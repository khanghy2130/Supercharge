const REPLAYSYS = {
  /*
    move {
			startData
			endData
			lastMove {sxsyexey}
			scoreGained
		}
  */
  skipping: null, // null, true, false
  lastLoadIsForward: true,
  moves: [],
  viewingMoveIndex: -1,
  targetPreviewsPositions: [], // pos[3][8]
  initialTargetsPositions: [],

  initialize: function () {
    this.lastLoadIsForward = true;
    this.moves = [];
    this.viewingMoveIndex = -1;
    this.targetPreviewsPositions = [];
    this.initialTargetsPositions = [];

    RENDER.movement = {
      progress: 1,
      pPositions: [],
    };
  },

  // only called within limits below:
  // min viewingIndex = -1
  // max viewingIndex = this.moves.length - 1
  loadState: function (goesForward) {
    if (
      (!goesForward && this.viewingMoveIndex <= -1) ||
      (goesForward && this.viewingMoveIndex >= this.moves.length - 1)
    ) {
      return "OUT OF RANGE";
    }
    this.lastLoadIsForward = goesForward;

    this.viewingMoveIndex = this.viewingMoveIndex + (goesForward ? 1 : -1);
    const gp = GAMEPLAY;
    const vmi = this.viewingMoveIndex;
    const moveIndexOfRound = vmi % 4;

    gp.deselectPiece();

    // apply move/unmove and spawn/unspawn targets
    if (goesForward) {
      const move = this.moves[vmi];
      const { sx, sy, ex, ey } = move.lastMove;

      // save data before applying move
      move.startData = gp.copySqData(gp.boardData[sy][sx]);
      move.endData = gp.copySqData(gp.boardData[ey][ex]);

      // apply current move, set scoreGained at the same time
      move.scoreGained = gp.applyMove(
        { x: sx, y: sy },
        { x: ex, y: ey },
        gp.boardData
      );

      // spawn targets on last move of round (and not last state)
      if (moveIndexOfRound === 3 && vmi < CONSTANTS.MAX_ROUND * 4 - 1) {
        gp.updateTargets(gp.boardData, gp.spawningPositions);
      }

      // add to movement animation
      RENDER.movement = {
        progress: 0,
        pieces: [
          {
            pos: { x: ex, y: ey },
            prevPos: { x: sx, y: sy },
          },
        ],
      };
      // add second piece moving
      if (move.endData !== null && !gp.isTarget(move.endData)) {
        RENDER.movement.pieces.push({
          pos: { x: sx, y: sy },
          prevPos: { x: ex, y: ey },
        });
      }
    }
    // move backward?
    else {
      const move = this.moves[vmi + 1];
      // on last move of round: devalue & unspawn targets
      if (
        moveIndexOfRound === 2 &&
        this.viewingMoveIndex < (CONSTANTS.MAX_ROUND - 1) * 4
      ) {
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            const sqData = gp.boardData[y][x];
            if (gp.isTarget(sqData)) {
              // unspawn if is 1
              if (sqData === 1) gp.boardData[y][x] = null;
              else gp.boardData[y][x]--;
            }
          }
        }
      }

      // apply unmove
      gp.boardData[move.lastMove.sy][move.lastMove.sx] = gp.copySqData(
        move.startData
      );
      gp.boardData[move.lastMove.ey][move.lastMove.ex] = gp.copySqData(
        move.endData
      );

      // add to movement animation
      RENDER.movement = {
        progress: 0,
        pieces: [
          {
            pos: { x: move.lastMove.sx, y: move.lastMove.sy },
            prevPos: { x: move.lastMove.ex, y: move.lastMove.ey },
          },
        ],
      };
      // add second piece moving
      if (move.endData !== null && !gp.isTarget(move.endData)) {
        RENDER.movement.pieces.push({
          pos: { x: move.lastMove.ex, y: move.lastMove.ey },
          prevPos: { x: move.lastMove.sx, y: move.lastMove.sy },
        });
      }
    }

    RENDER.updateAllTRs(goesForward && this.skipping === null);
    RENDER.setPiecesPositions();
    // SET ROUND, WHOSE TURN, AND ENERGIES
    // initial state (-1), before any move
    if (vmi === -1) {
      gp.meta.round = 1; // set round
      gp.meta.isWhiteTurn = true;
      gp.meta.white.energy = 2;
      gp.meta.black.energy = 2;
    }
    // last state, after last move
    else if (vmi === CONSTANTS.MAX_ROUND * 4 - 1) {
      gp.meta.round = CONSTANTS.MAX_ROUND; // set round
      gp.meta.isWhiteTurn = false;
      gp.meta.white.energy = 0;
      gp.meta.black.energy = 0;
    }
    // there are moves ahead or behind this state
    else {
      gp.meta.round = ceil((vmi + 2) / 4); // set round

      // set whose turn and energies after this. white: 0,1  black: 2,3
      if (moveIndexOfRound === 0) {
        gp.meta.isWhiteTurn = true;
        gp.meta.white.energy = 1; // consumed
        gp.meta.black.energy = 2;
      } else if (moveIndexOfRound === 1) {
        gp.meta.isWhiteTurn = false;
        gp.meta.white.energy = 0;
        gp.meta.black.energy = 2;
      } else if (moveIndexOfRound === 2) {
        gp.meta.isWhiteTurn = false;
        gp.meta.white.energy = 0;
        gp.meta.black.energy = 1;
      } else if (moveIndexOfRound === 3) {
        gp.meta.isWhiteTurn = true;
        gp.meta.white.energy = 2; // reset
        gp.meta.black.energy = 2;
      }
    }

    // set spawning previews
    gp.spawningPositions = this.targetPreviewsPositions[gp.meta.round - 1];

    // add to previous scores before setting new scores
    RENDER.capturedTR.previousScores = [
      gp.meta.white.score,
      gp.meta.black.score,
    ];

    // set scores
    let wScore = 0;
    let bScore = 0;
    for (let i = 0; i < this.viewingMoveIndex + 1; i++) {
      const scoreGained = this.moves[i].scoreGained;
      const mifr = i % 4;
      if (mifr < 2) wScore += scoreGained;
      else bScore += scoreGained;
    }
    gp.meta.white.score = wScore;
    gp.meta.black.score = bScore;
  },

  updateSkipping: function () {
    if (this.skipping === null || frameCount % CONSTANTS.SKIP_DELAY !== 0)
      return;
    const returnValue = this.loadState(this.skipping);
    // done skipping?
    if (returnValue === "OUT OF RANGE") this.skipping = null;
  },

  setUpSkipping: function (goesForward) {
    this.skipping = goesForward;
  },

  saveReplay: function () {
    let totalSum = 0;
    let movesStr = "";
    for (let i = 0, moves = this.moves; i < moves.length; i++) {
      const { sx, sy, ex, ey } = moves[i].lastMove;
      totalSum += sx + sy + ex + ey;
      movesStr += "" + sx + sy + ex + ey;
    }

    let targetsStr = "";
    for (
      let i = 0,
        positions = this.initialTargetsPositions.concat(
          this.targetPreviewsPositions.flat()
        );
      i < positions.length;
      i++
    ) {
      const { x, y } = positions[i];
      totalSum += x + y;
      targetsStr += "" + x + y;
    }

    const { white, black } = GAMEPLAY.savedConfig;
    let squadCode;
    const scenesStack = SCENE_CONTROL.scenesStack;
    if (scenesStack[scenesStack.length - 1] === "STANDARD") {
      squadCode = floor(random() * 10) + "";
    } else {
      const pieceNames = ["R", "B", "K", "L", "Q"];
      squadCode = white.squad
        .concat(black.squad)
        .map(function (pieceName) {
          return pieceNames.indexOf(pieceName);
        })
        .join("");
    }
    const botCode = white.botDepth + "" + black.botDepth;

    let wScore = 0;
    let bScore = 0;
    for (let i = 0; i < this.moves.length; i++) {
      const scoreGained = this.moves[i].scoreGained;
      const mifr = i % 4;
      if (mifr < 2) wScore += scoreGained;
      else bScore += scoreGained;
    }

    let wTotalTime = 0;
    let bTotalTime = 0;
    const ts = GAMEPLAY.meta.timeStops;
    for (let i = 0; i < ts.length; i += 2) {
      if (i + 1 < ts.length) {
        wTotalTime += ts[i + 1] - ts[i];
      }
      if (i + 2 < ts.length) {
        bTotalTime += ts[i + 2] - ts[i + 1];
      }
    }
    const wTimeMod = wTotalTime % totalSum;
    const bTimeMod = bTotalTime % totalSum;

    const arr = [
      movesStr,
      targetsStr,
      squadCode,
      botCode,
      totalSum,

      wScore,
      wTotalTime,
      wTimeMod,

      bScore,
      bTotalTime,
      bTimeMod,
    ];

    const RM = REPLAYS_MENU;
    RM.personalRawReplays.unshift(RM.getRawStr(arr));
    localStorage.setItem("personalRawReplays", RM.personalRawReplays.join("_"));

    const ss = SCENE_CONTROL.scenesStack;
    let replaysCategory;
    if (ss[ss.length - 1] === "CUSTOM") {
      replaysCategory = RM.replays.CUSTOM;
    } else if (botCode[0] === "3" || botCode[1] === "3") {
      replaysCategory = RM.replays.HARD;
    } else {
      replaysCategory = RM.replays.EASY;
    }
    replaysCategory.personal.unshift({
      replay: arr,
      title: "untitled",
      from: "you",
    });
  },

  loadReplay: function (arr) {
    if (arr.length !== 11) {
      return console.log("not right replay data array length");
    }

    const [movesStr, targetsStr, squadCode, botCode] = arr;
    const totalSum = arr[4];
    const wTotalTime = arr[6];
    const wTimeMod = arr[7];
    const bTotalTime = arr[9];
    const bTimeMod = arr[10];

    if (movesStr.length !== 128) {
      return console.log("not right movesStr length");
    }
    if (targetsStr.length !== 54) {
      return console.log("not right targetsStr length");
    }
    if (wTotalTime % totalSum !== wTimeMod) {
      return console.log("not right white time");
    }
    if (bTotalTime % totalSum !== bTimeMod) {
      return console.log("not right black time");
    }
    if (botCode.length !== 2) {
      return console.log("not right botCode length");
    }

    let white, black;
    if (squadCode.length === 1) {
      // standard
      white = {
        botDepth: Number(botCode[0]),
        squad: ["R", "B", "K"],
      };
      black = {
        botDepth: Number(botCode[1]),
        squad: ["K", "B", "R"],
      };
    } else if (squadCode.length === 6) {
      // custom
      const pieceNames = ["R", "B", "K", "L", "Q"];
      white = {
        botDepth: Number(botCode[0]),
        squad: [
          pieceNames[Number(squadCode[0])],
          pieceNames[Number(squadCode[1])],
          pieceNames[Number(squadCode[2])],
        ],
      };
      black = {
        botDepth: Number(botCode[1]),
        squad: [
          pieceNames[Number(squadCode[3])],
          pieceNames[Number(squadCode[4])],
          pieceNames[Number(squadCode[5])],
        ],
      };
    } else {
      return console.log("not right squadCode length");
    }

    const gp = GAMEPLAY;
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

    // reset
    gp.meta.gameover = true;
    gp.meta.latestMoveIndex = 31;
    gp.meta.isWhiteTurn = true;
    gp.meta.white.score = 0;
    gp.meta.black.score = 0;
    gp.meta.white.energy = 2;
    gp.meta.black.energy = 2;
    gp.meta.round = 1;

    gp.selectedPiecePos = null;
    gp.possibleMoves = null;
    gp.hintArrow.countDown = 0;
    gp.meta.timeStops = [0, wTotalTime, wTotalTime + bTotalTime];

    gp.result.countDown = 0;
    gp.result.isShown = false;
    gp.exitWarning.isShown = false;
    this.initialize();

    // reset boardData
    for (let y = 0; y < 8; y++) {
      gp.boardData[y] = [];
      for (let x = 0; x < 8; x++) {
        gp.boardData[y][x] = null;
      }
    }

    // add pieces to board
    gp.boardData[1][1] = {
      name: white.squad[0],
      isWhite: true,
      isCharged: false,
    };
    gp.boardData[3][2] = {
      name: white.squad[1],
      isWhite: true,
      isCharged: false,
    };
    gp.boardData[5][1] = {
      name: white.squad[2],
      isWhite: true,
      isCharged: false,
    };
    gp.boardData[2][6] = {
      name: black.squad[0],
      isWhite: false,
      isCharged: false,
    };
    gp.boardData[4][5] = {
      name: black.squad[1],
      isWhite: false,
      isCharged: false,
    };
    gp.boardData[6][6] = {
      name: black.squad[2],
      isWhite: false,
      isCharged: false,
    };

    // set player names
    const allNames = ["player", "easy bot", "", "hard bot"];
    r.playersNames = [allNames[white.botDepth], allNames[black.botDepth]];

    // add to moves
    for (let i = 0; i < 128; i += 4) {
      this.moves.push({
        lastMove: {
          sx: Number(movesStr[i]),
          sy: Number(movesStr[i + 1]),
          ex: Number(movesStr[i + 2]),
          ey: Number(movesStr[i + 3]),
        },
        scoreGained: 0,
      });
    }

    const allTargetsPositions = [];
    for (let i = 0; i < 54; i += 2) {
      allTargetsPositions.push({
        x: Number(targetsStr[i]),
        y: Number(targetsStr[i + 1]),
      });
    }

    // set initial targets
    for (let i = 0; i < 6; i++) {
      const pos = allTargetsPositions[i];
      gp.boardData[pos.y][pos.x] = 1;
      this.initialTargetsPositions.push(pos); // unnecessary but to fill in
    }
    // set remaining target spawns
    for (let i = 6; i < allTargetsPositions.length; i += 3) {
      this.targetPreviewsPositions.push([
        allTargetsPositions[i],
        allTargetsPositions[i + 1],
        allTargetsPositions[i + 2],
      ]);
    }
    // additional 2 empty arrays
    this.targetPreviewsPositions.push([]);
    this.targetPreviewsPositions.push([]);

    gp.spawningPositions = this.targetPreviewsPositions[0];

    // reset play scene buttons
    for (let i = 0; i < r.btns.length; i++) {
      const b = r.btns[i];
      b.isHovered = false;
      b.animateProgress = 1;
    }
    r.setPiecesPositions();
    r.capturedTR.progress = 1; // end animation
    r.targets = [];
    r.updateAllTRs(true);
    SCENE_CONTROL.changeScene("PLAY");
  },
};
