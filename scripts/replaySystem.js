const REPLAYSYS = {
  /*
    move {
			startData
			endData
			lastMove {sxsyexey}
			scoreGained
		}
  */
  moves: [],
  viewingMoveIndex: -1,
  targetPreviewsPositions: [], // pos[3][8]

  initialize: function () {
    this.moves = [];
    this.viewingMoveIndex = -1;
    this.targetPreviewsPositions = [];
  },

  // only called within limits below:
  // min viewingIndex = -1
  // max viewingIndex = this.moves.length - 1
  loadState: function (goesForward) {
    if (
      (!goesForward && this.viewingMoveIndex <= -1) ||
      (goesForward && this.viewingMoveIndex >= this.moves.length - 1)
    ) {
      print("stepping out of range");
      return;
    }

    this.viewingMoveIndex = this.viewingMoveIndex + (goesForward ? 1 : -1);
    const gp = GAMEPLAY;
    const vmi = this.viewingMoveIndex;
    const moveIndexOfRound = vmi % 4;

    // apply move/unmove and spawn/unspawn targets
    if (goesForward) {
      const move = this.moves[vmi];
      // apply current move, set scoreGained at the same time
      move.scoreGained = gp.applyMove(
        { x: move.lastMove.sx, y: move.lastMove.sy },
        { x: move.lastMove.ex, y: move.lastMove.ey },
        gp.boardData
      );

      // spawn targets on last move of round (and not last state)
      if (moveIndexOfRound === 3 && vmi < MAX_ROUND * 4 - 1) {
        gp.updateTargets(gp.boardData, gp.spawningPositions);
      }
    } else {
      const move = this.moves[vmi + 1];
      // on last move of round: devalue & unspawn targets
      if (moveIndexOfRound === 2) {
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
    }

    // >> set rounds, whose turn, energies

    // initial state (-1), before any move
    if (vmi === -1) {
      gp.meta.round = 1; // set round
      gp.meta.isWhiteTurn = true;
      gp.meta.white.energy = 2;
      gp.meta.black.energy = 2;
    }
    // last state, after last move
    else if (vmi === MAX_ROUND * 4 - 1) {
      gp.meta.round = MAX_ROUND; // set round
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

    // set scores
    let wScore = 0;
    let bScore = 0;
    for (let i = 0; i < this.viewingMoveIndex + 1; i++) {
      const move = this.moves[i];
      const mifr = i % 4;
      if (mifr < 2) wScore += move.scoreGained;
      else bScore += move.scoreGained;
    }
    gp.meta.white.score = wScore;
    gp.meta.black.score = bScore;
  },
};
