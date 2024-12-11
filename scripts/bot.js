const BOT = {
  isProcessing: false,
  stack: [],
  bestMove: null, // {node, scoreDiff}

  getBoardCopy: function () {
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
    return boardData;
  },

  startMinimax: function () {
    this.isProcessing = true;
    this.bestMove = null;
    this.stack = [
      {
        node: this.getBoardCopy(),
        depth: 0,
        isMaximizing: GAMEPLAY.meta.isWhiteTurn,
        alpha: -Infinity,
        beta: Infinity,
      },
    ];
  },

  processMinimax: function () {
    // process amount per frame here
    for (let i = 0; i < 10; i++) {
      if (this.stack.length === 0) {
        this.isProcessing = false; // All nodes processed
        /// make the final move here
        break;
      }

      // Pop and process the next node
      const { node, depth, isMaximizing, alpha, beta } = this.stack.pop();

      // Base case
      ///// last round check here to stop before max depth
      if (depth === 3) {
        const scoreDiff = this.evaluateScoreDiff(node);
        continue;
      }

      // is white
      if (isMaximizing) {
        /*

				alpha (& beta) being updated during the loop
				meaning the next children have it updated 
				to potentially not be added to stack.

				each node has different alpha & beta.



				maxEval = -Infinity
				for each child of getChildren()
					eval = minimax(child, depth + 1, false, alpha, beta)
					maxEval = max(maxEval, eval)
					alpha = max(alpha, eval)
					if (beta <= alpha) break
				return maxEval
				*/
      } else {
        /*
				minEval = Infinity
				for each child of getChildren()
					eval = minimax(child, depth + 1, true, alpha, beta)
					minEval = min(minEval, eval)
					beta = min(alpha, eval)
					if (beta <= alpha) break
				return minEval
				*/
      }

      /*
        // Base case: Evaluate the node
        //// check if is last round here to stop before depth 3
        if (depth === 3) {
            const score = evaluate(node);

            // Update best move and pruning values
            if (isMaximizing) {
                if (!bestMove || score > bestMove.score) {
                    bestMove = { node, score };
                }
                alpha = Math.max(alpha, score); // Update alpha
            } else {
                if (!bestMove || score < bestMove.score) {
                    bestMove = { node, score };
                }
                beta = Math.min(beta, score); // Update beta
            }

            // Pruning condition
            if (beta <= alpha) {
                continue; // Skip further exploration of this branch
            }

            continue;
        }

        // Generate children and push them to the stack
        const children = getChildren(node);
        for (let i = children.length - 1; i >= 0; i--) {
            const child = children[i];
            nodeStack.push({ 
                node: child, 
                depth: depth + 1, 
                isMaximizing: !isMaximizing, 
                alpha, 
                beta 
            });
        }
        */
    }
  },

  evaluateScoreDiff: function (actions) {},
};
