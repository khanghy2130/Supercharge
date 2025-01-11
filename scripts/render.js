const RENDER = {
  /*
    TargetRender: {
      pos, delay, progress, value, 
      circles {startPos, endPos, endDeg, progress} 
    }
  */
  targets: [],
  removingTR: null,

  deleteRemovingTR: function () {
    const index = this.targets.indexOf(this.removingTR);
    if (index === -1) return;
    this.targets.splice(index, 1);
    this.removingTR = null;
  },

  getCircleRPos: function (pos, deg) {
    const { rx, ry } = this.getRenderPos(pos.x, pos.y);
    // TARGET CIRCLES MOVEMENT RANGE HERE
    return {
      x: rx + cos(deg) * 6,
      y: ry + sin(deg) * 6,
    };
  },
  renewCircle: function (cir, pos) {
    // if doesn't have endDeg then this is a new circle
    if (cir.endDeg === undefined) {
      cir.endDeg = random() * 360;
      cir.endPos = this.getCircleRPos(pos, cir.endDeg);
    }

    cir.startPos = cir.endPos;
    cir.endDeg += 120 + random() * 120;
    cir.endPos = this.getCircleRPos(pos, cir.endDeg);
    cir.progress = 0;
  },

  updateTR: function (TR, value, goesForward) {
    TR.value = value;
    // animate transition if going forward
    if (goesForward) {
      TR.delay = (TR.pos.x + TR.pos.y) * 3 + 30; // WAVE DELAY + PIECE MOVE DELAYthis.getTRDelay(TR.pos);
      TR.progress = 0;
    } else {
      TR.delay = 0;
      TR.progress = 1;
    }
  },

  updateAllTRs: function (goesForward) {
    const gp = GAMEPLAY;
    this.deleteRemovingTR(); // delete again to make sure

    const targetsPositions = [];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (gp.isTarget(gp.boardData[y][x])) targetsPositions.push({ x, y });
      }
    }

    // for each TR: update self if target exists, else delete self unless was captured
    outerloop: for (let i = this.targets.length - 1; i >= 0; i--) {
      const TR = this.targets[i];
      for (let j = 0; j < targetsPositions.length; j++) {
        const tPos = targetsPositions[j];
        // exists? update TR
        if (TR.pos.x === tPos.x && TR.pos.y === tPos.y) {
          targetsPositions.splice(j, 1); // remove target from list
          this.updateTR(TR, gp.boardData[tPos.y][tPos.x], goesForward);
          continue outerloop;
        }
      }
      // target doesn't exist?
      // if going forward then there can only be 1 removed target (captured)
      if (goesForward) this.removingTR = TR;
      else this.targets.splice(i, 1); // remove TR directly if going backward
    }

    // for each (remaining) target: add new TRs
    for (let i = 0; i < targetsPositions.length; i++) {
      const tPos = targetsPositions[i];
      const newTR = { pos: tPos, circles: [] };
      // add circles
      while (newTR.circles.length < 5) {
        newTR.circles.push({ progress: 1 }); // only needs progress to trigger renew
      }
      this.updateTR(newTR, gp.boardData[tPos.y][tPos.x], goesForward);
      this.targets.push(newTR);
    }
  },

  easeInOutCubic: function (x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  },

  renderAllTargets: function () {
    textSize(30); ///
    for (let i = 0; i < this.targets.length; i++) {
      const TR = this.targets[i];

      const circlesPositions = [];
      for (let ci = 0; ci < TR.circles.length; ci++) {
        const cir = TR.circles[ci];
        if (cir.progress >= 1) this.renewCircle(cir, TR.pos);
        const { startPos, endPos, progress } = cir;

        const prg = this.easeInOutCubic(progress);
        circlesPositions.push({
          rx: startPos.x + prg * (endPos.x - startPos.x),
          ry: startPos.y + prg * (endPos.y - startPos.y),
        });

        // random delay at starting
        if (cir.progress > 0 || random() > 0.8) {
          cir.progress += 0.007; // CIRCLE SPEED HERE
        }
      }

      // render circles outlines
      noFill();
      stroke(0);
      strokeWeight(6);
      for (let ci = 0; ci < circlesPositions.length; ci++) {
        const { rx, ry } = circlesPositions[ci];
        ellipse(rx, ry, CONSTANTS.CIRCLE_SIZE, CONSTANTS.CIRCLE_SIZE);
      }

      // render inner circles
      noStroke();
      fill(...COLORS.targets[TR.value - 1]);
      for (let ci = 0; ci < circlesPositions.length; ci++) {
        const { rx, ry } = circlesPositions[ci];
        ellipse(rx, ry, CONSTANTS.CIRCLE_SIZE, CONSTANTS.CIRCLE_SIZE);
      }

      ////
      fill(0);
      const { rx, ry } = this.getRenderPos(TR.pos.x, TR.pos.y);
      text(TR.value, rx, ry);
    }
  },

  piecesPositions: [],
  movement: {
    progress: 1, // 0 to 1
    pieces: [], // {prevPos, pos}[]
  },

  setPiecesPositions: function () {
    this.piecesPositions = [];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const sqData = GAMEPLAY.boardData[y][x];
        if (sqData && !GAMEPLAY.isTarget(sqData))
          this.piecesPositions.push({ x, y });
      }
    }
  },

  renderAllPieces: function (bd) {
    const pp = this.piecesPositions.slice();
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

        // take out moving pieces from pp
        for (let p2 = 0; p2 < pp.length; p2++) {
          const pos2 = pp[p2];
          if (pos.x === pos2.x && pos.y === pos2.y) {
            pp.splice(p2, 1);
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

    for (let i = 0; i < pp.length; i++) {
      const piecePos = pp[i];
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
