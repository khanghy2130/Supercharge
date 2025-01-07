const RENDER = {
  movement: {
    progress: 1, // 0 to 1
    pieces: [], // {prevPos, pos}[]
  },

  renderAllPieces: function (piecesPositions, bd) {
    // is animating pieces movement?
    if (this.movement.progress < 1) {
      // render moving pieces
      for (let p1 = 0; p1 < this.movement.pieces.length; p1++) {
        const { prevPos, pos } = this.movement.pieces[p1];
        const pieceData = bd[pos.y][pos.x];
        const { rx: rpx, ry: rpy } = this.getRenderPos(prevPos.x, prevPos.y);
        const { rx, ry } = this.getRenderPos(pos.x, pos.y);

        //// flash charge icon if is charged
        this.renderPiece(
          pieceData,
          rpx + (rx - rpx) * this.movement.progress,
          rpy + (ry - rpy) * this.movement.progress
        );

        // take out moving pieces from piecesPositions
        for (let p2 = 0; p2 < piecesPositions.length; p2++) {
          const pos2 = piecesPositions[p2];
          if (pos.x === pos2.x && pos.y === pos2.y) {
            piecesPositions.splice(p2, 1);
            break;
          }
        }
      }

      // update progress (faster speed if skipping)
      if (REPLAYSYS.skipping !== null) {
        this.movement.progress = min(
          this.movement.progress + 1 / CONSTANTS.SKIP_DELAY,
          1
        );
      } else {
        this.movement.progress = min(
          this.movement.progress + CONSTANTS.MOVE_SPEED,
          1
        );
      }
    }

    for (let i = 0; i < piecesPositions.length; i++) {
      const piecePos = piecesPositions[i];
      const pieceData = bd[piecePos.y][piecePos.x];
      const { rx, ry } = this.getRenderPos(piecePos.x, piecePos.y);
      this.renderPiece(pieceData, rx, ry);
    }
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

  getRenderPos: function (x, y) {
    return {
      rx: BOARD_INFO.sqSize * (x + 0.5),
      ry: BOARD_INFO.sqSize * (y + 0.5),
    };
  },
};
