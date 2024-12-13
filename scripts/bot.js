const BOT = {
  maxDepth: 3,
  maxProgress: null, // length of potential actions of root node
  isProcessing: false,
  stack: [],
  finalOutput: null, // { actionsHistory, scoreDiff }

  getSimulatedData: function (actionsHistory) {
    const white = { score: GAMEPLAY.meta.white.score };
    const black = { score: GAMEPLAY.meta.black.score };
    const boardData = [];
    for (let y = 0; y < 8; y++) {
      const row = [];
      for (let x = 0; x < 8; x++) {
        const sd = GAMEPLAY.boardData[y][x];
        if (sd === null || GAMEPLAY.isTarget(sd)) {
          row[x] = sd;
        } else {
          row[x] = Object.assign({}, sd); // copy of piece
        }
      }
      boardData[y] = row;
    }

    // apply actions
    let isWhiteTurn = GAMEPLAY.meta.isWhiteTurn;
    for (let i = 0; i < actionsHistory.length; i++) {
      const moves = actionsHistory[i];
      const scorer = isWhiteTurn ? white : black;

      // apply target update IF is white && it is 2nd or 3rd action
      if (isWhiteTurn && i > 0 && i < 3) GAMEPLAY.updateTargets(boardData);

      // for each move in this action
      for (let m = 0; m < moves.length; m++) {
        const [sx, sy, ex, ey] = moves[m];
        const scoreGained = GAMEPLAY.applyMove(
          { x: sx, y: sy },
          { x: ex, y: ey },
          boardData
        );
        scorer.score += scoreGained;
      }
      isWhiteTurn = !isWhiteTurn; // flip for next iteration
    }

    return {
      boardData: boardData,
      scoreDiff: white.score - black.score,
    };
  },

  startMinimax: function () {
    this.maxProgress = null;
    this.isProcessing = true;
    this.finalOutput = null;
    const isMaximizing = GAMEPLAY.meta.isWhiteTurn;
    this.stack = [
      {
        // Action: [sx, sy, ex, ey][2]
        actionsHistory: [],
        potentialActions: null, // null by default
        returnValue: {
          actionsHistory: null,
          scoreDiff: isMaximizing ? -Infinity : Infinity,
        },
        depth: 0,
        isMaximizing: isMaximizing,
        alpha: -Infinity,
        beta: Infinity,
      },
    ];
  },

  // returnValue: { actionsHistory, scoreDiff }
  updateParent: function (returnValue) {
    this.stack.pop(); // pop last node
    const parent = this.stack[this.stack.length - 1];

    // popped the root node? set best move
    if (!parent) {
      this.finalOutput = returnValue;
      return;
    }

    // update parent returnValue plus alpha/beta
    if (parent.isMaximizing) {
      if (parent.returnValue.scoreDiff <= returnValue.scoreDiff) {
        parent.returnValue = returnValue;
      }
      parent.alpha = max(parent.alpha, returnValue.scoreDiff);
    } else {
      if (parent.returnValue.scoreDiff >= returnValue.scoreDiff) {
        parent.returnValue = returnValue;
      }
      parent.beta = min(parent.beta, returnValue.scoreDiff);
    }

    // Prune if alpha >= beta
    if (parent.beta <= parent.alpha) {
      parent.potentialActions = []; // Skip remaining children
    }
  },

  processMinimax: function () {
    if (this.stack.length > 0) {
      const root = this.stack[0];
      if (root.potentialActions !== null) {
        fill("lime");
        textSize(32);
        text(
          floor(
            (100 / this.maxProgress) *
              (this.maxProgress - root.potentialActions.length)
          ) + "%",
          _mouseX,
          _mouseY
        );
      }
    }

    // process amount per frame here
    for (let i = 0; i < 3000; i++) {
      // All nodes processed ?
      if (this.stack.length === 0) {
        this.isProcessing = false;
        console.log("Final output:");
        console.log(this.finalOutput);
        break;
      }

      const current = this.stack[this.stack.length - 1];
      const {
        actionsHistory,
        potentialActions,
        returnValue,
        depth,
        isMaximizing,
        alpha,
        beta,
      } = current;

      // Base case: return score to parent
      const isLastTurn =
        GAMEPLAY.meta.round === MAX_ROUND && isMaximizing && depth > 0;
      if (depth === this.maxDepth || isLastTurn) {
        this.updateParent({
          actionsHistory: actionsHistory,
          scoreDiff: this.getSimulatedData(actionsHistory).scoreDiff,
        });
        continue;
      }

      // did not generate potential actions?
      if (potentialActions === null) {
        current.potentialActions = this.getPotentialActions(
          this.getSimulatedData(actionsHistory).boardData,
          isMaximizing
        );
        if (this.maxProgress === null)
          this.maxProgress = current.potentialActions.length;
      }

      // still have any potential action to process?
      else if (potentialActions.length > 0) {
        // remove the first pAction, add to stack
        const newAction = potentialActions.shift();
        const newIsMaximizing = !isMaximizing;
        this.stack.push({
          actionsHistory: [...actionsHistory, newAction],
          potentialActions: null,
          returnValue: {
            actionsHistory: null,
            scoreDiff: newIsMaximizing ? -Infinity : Infinity,
          },
          depth: depth + 1,
          isMaximizing: newIsMaximizing,
          alpha: alpha,
          beta: beta,
        });
      }

      // processed all potential actions (or pruned)?
      else {
        this.updateParent(returnValue);
      }
    }
  },

  getPotentialActions: function (boardData, isMaximizing) {
    const scoredActions = []; // {action, sortScore}
    const piecesPositions = [];
    // get pieces positions
    outerloop: for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const sqData = boardData[y][x];
        if (
          sqData !== null &&
          !GAMEPLAY.isTarget(sqData) &&
          sqData.isWhite === isMaximizing
        ) {
          piecesPositions.push({ x, y });
          if (piecesPositions.length === 3) break outerloop;
        }
      }
    }

    const firstMoves = []; // [sx, sy, ex, ey][]
    // get all 1st moves
    for (let i = 0; i < piecesPositions.length; i++) {
      const pPos = piecesPositions[i];
      const possibleMoves = GAMEPLAY.getPossibleMoves(pPos, boardData);
      for (let pm = 0; pm < possibleMoves.length; pm++) {
        firstMoves.push([
          pPos.x,
          pPos.y,
          possibleMoves[pm].x,
          possibleMoves[pm].y,
          boardData[pPos.y][pPos.x].name, /////
        ]);
      }
    }

    // for each move (of this piece)
    for (let m1 = 0; m1 < firstMoves.length; m1++) {
      const [sx, sy, ex, ey] = firstMoves[m1];

      const movedPiece = boardData[sy][sx];
      const originalChargeValue = movedPiece.isCharged;
      const originalEndValue = boardData[ey][ex];

      // apply 1st move
      const firstMoveScoreGained = GAMEPLAY.applyMove(
        { x: sx, y: sy },
        { x: ex, y: ey },
        boardData
      );

      // for each pieces: get all of its 2nd moves
      for (let i = 0; i < piecesPositions.length; i++) {
        let pPos = piecesPositions[i];
        // new pPos if was moved (or swapped)
        if (pPos.x === sx && pPos.y === sy) {
          pPos = { x: ex, y: ey }; // is now at end position
        } else if (pPos.x === ex && pPos.y === ey) {
          pPos = { x: sx, y: sy }; // is now at start position
        }

        const possibleMoves = GAMEPLAY.getPossibleMoves(pPos, boardData);
        // for each 2nd move: add into scoredActions
        for (let m2 = 0; m2 < possibleMoves.length; m2++) {
          const { x, y } = possibleMoves[m2];
          const endValue = boardData[y][x];

          let secondMoveScoreGained = 0;
          // set score if capturing a target (and if is charged)
          if (GAMEPLAY.isTarget(endValue)) {
            secondMoveScoreGained = endValue;
            if (boardData[pPos.y][pPos.x].isCharged) {
              secondMoveScoreGained *= CHARGED_MULT;
            }
          }

          scoredActions.push({
            action: [
              firstMoves[m1],
              [pPos.x, pPos.y, x, y, boardData[pPos.y][pPos.x].name], ///
            ],
            sortScore: firstMoveScoreGained + secondMoveScoreGained,
          });
        }
      }

      // undo 1st move
      boardData[ey][ex] = originalEndValue;
      boardData[sy][sx] = movedPiece;
      movedPiece.isCharged = originalChargeValue;
    }

    return scoredActions
      .sort((a, b) => b.sortScore - a.sortScore)
      .map((sa) => sa.action);
  },
};
