const RENDER = {
  /*
    TargetRender: {
      pos, delay, progress, value, 
      circles {startPos, endPos, endDeg, progress} 
    }
  */
  targets: [],
  removingTR: null,

  capturedTR: {
    pos: { x: 0, y: 0 },
    value: 1,
    fadingCircles: [], // {pos{rx, ry}, deg}
    progress: 1,
  },

  renderCapturedTarget: function () {
    if (this.capturedTR.progress >= 1) return;
    this.capturedTR.progress += 0.01; // CAPTURE ANIMATION SPEED

    const move = REPLAYSYS.moves[REPLAYSYS.viewingMoveIndex];
    // can't get move or no score gained?
    if (!move || move.scoreGained === 0) return;

    const circlesPositions = [];
    for (let ci = 0; ci < this.capturedTR.fadingCircles.length; ci++) {
      const cir = this.capturedTR.fadingCircles[ci];
      // FADING CIRCLE MOVE SPEED
      cir.pos.rx += cos(cir.deg) * 0.5;
      cir.pos.ry += sin(cir.deg) * 0.5;
      circlesPositions.push({
        rx: cir.pos.rx,
        ry: cir.pos.ry,
      });
    }

    // render circles outlines
    const circleSize =
      max(0, 1 - this.capturedTR.progress * 2.2) * CONSTANTS.CIRCLE_SIZE;
    noFill();
    stroke(0);
    strokeWeight(6);
    for (let ci = 0; ci < circlesPositions.length; ci++) {
      const { rx, ry } = circlesPositions[ci];
      ellipse(rx, ry, circleSize, circleSize);
    }

    // render inner circles
    noStroke();
    const targetColor = color(...COLORS.targets[this.capturedTR.value - 1]);
    fill(targetColor);
    for (let ci = 0; ci < circlesPositions.length; ci++) {
      const { rx, ry } = circlesPositions[ci];
      ellipse(rx, ry, circleSize, circleSize);
    }

    //// where to show move.scoreGained?
    //// use this.capturedTR.progress to do score bar animation?

    fill(0, 0, 0, max(0, 1 - this.capturedTR.progress * 5) * 255);
    textSize(30);
    const { rx, ry } = this.getRenderPos(
      this.capturedTR.pos.x,
      this.capturedTR.pos.y
    );
    text(this.capturedTR.value, rx, ry);
  },

  deleteRemovingTR: function (doesCaptureAnimation) {
    this.capturedTR.progress = 1; // end previous animation
    if (this.removingTR === null) return;

    if (doesCaptureAnimation) {
      const TR = this.removingTR;
      this.capturedTR.value = TR.value;
      this.capturedTR.pos = TR.pos;
      this.capturedTR.progress = 0;
      this.capturedTR.fadingCircles = [];
      // add to fadingCircles
      const randomOffsetDeg = random() * 90;
      for (let i = 0; i < TR.circles.length; i++) {
        const { startPos, endPos, progress } = TR.circles[i];
        if (startPos === undefined) continue; // safety skip

        const prg = this.easeInOutCubic(progress);
        this.capturedTR.fadingCircles.push({
          deg: randomOffsetDeg + i * 72,
          pos: {
            rx: startPos.x + prg * (endPos.x - startPos.x),
            ry: startPos.y + prg * (endPos.y - startPos.y),
          },
        });
      }

      //// trigger score bar animation
    }

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
      TR.delay = (TR.pos.x + TR.pos.y) * 3 + 20; // WAVE DELAY + PIECE MOVE DELAYthis.getTRDelay(TR.pos);
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
        // exists && value changed? update TR
        if (TR.pos.x === tPos.x && TR.pos.y === tPos.y) {
          targetsPositions.splice(j, 1); // remove target from list
          if (gp.boardData[tPos.y][tPos.x] !== TR.value)
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
      let value = TR.value;
      if (TR.delay > 0) {
        TR.delay--;
        if (value === 1) {
          /// render spawn preview instead
          continue;
        }
        value -= 1;
      } else if (TR.progress < 1) TR.progress += 0.05;

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
      const targetColor = color(...COLORS.targets[value - 1]);
      if (TR.delay <= 0 && TR.progress < 1) {
        fill(lerpColor(color(255), targetColor, TR.progress));
      } else fill(targetColor);
      for (let ci = 0; ci < circlesPositions.length; ci++) {
        const { rx, ry } = circlesPositions[ci];
        ellipse(rx, ry, CONSTANTS.CIRCLE_SIZE, CONSTANTS.CIRCLE_SIZE);
      }

      ////
      fill(0);
      const { rx, ry } = this.getRenderPos(TR.pos.x, TR.pos.y);
      text(value, rx, ry);
    }

    this.renderCapturedTarget();
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

      // trigger capture animation if ended
      if (this.movement.progress === 1) {
        this.deleteRemovingTR(true);
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
