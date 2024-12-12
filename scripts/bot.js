const BOT = {
  isProcessing: false,
  stack: [],
  finalOutput: null, // { actionsHistory, scoreDiff }

  getSimulatedData: function (actionsHistory) {
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

    /// apply actions, also apply updateTargets at the right order

    return {
      boardData: boardData,
      whiteScore: null, ///
      blackScore: null,
    };
  },

  startMinimax: function () {
    this.isProcessing = true;
    this.finalOutput = null;
    const isMaximizing = GAMEPLAY.meta.isWhiteTurn;
    this.stack = [
      {
        // Action: [sx, sy, ex, ey][2]
        actionsHistory: [],
        potentialActions: null, // null by default
        returnValue: {
          action: null,
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
  updateParent: function (isMaximizing, returnValue) {
    this.stack.pop(); // pop last node
    const parent = this.stack[this.stack.length - 1];

    // popped the root node? set best move
    if (!parent) {
      this.finalOutput = returnValue;
      return;
    }

    // update parent returnValue plus alpha/beta
    if (isMaximizing) {
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
    // process amount per frame here
    for (let i = 0; i < 10; i++) {
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
      } = current;

      /// last round check here to stop before max depth (depends on black or white too)
      // Base case
      if (depth === 3) {
        const { whiteScore, blackScore } =
          this.getSimulatedData(actionsHistory);
        this.updateParent(isMaximizing, {
          actionsHistory: actionsHistory,
          scoreDiff: whiteScore - blackScore,
        });
        continue;
      }

      // did not generate potential actions?
      if (potentialActions === null) {
        potentialActions = this.getPotentialActions(actionsHistory);
        current.potentialActions = potentialActions;
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
            action: null,
            scoreDiff: newIsMaximizing ? -Infinity : Infinity,
          },
          depth: 0,
          isMaximizing: newIsMaximizing,
          alpha: -Infinity,
          beta: Infinity,
        });
      }

      // processed all potential actions (or pruned)?
      else {
        this.updateParent(isMaximizing, returnValue);
      }
    }
  },

  getPotentialActions: function (actionsHistory) {
    const { boardData } = this.getSimulatedData(actionsHistory);
    /// computate all actions, undo move when backtrack
    return []; /// return sorted list
  },
};
