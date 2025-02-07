const RENDER = {
  numHalfWidths: {},
  playersNames: [], // [white, black]
  btns: [],

  piecesPositions: [],
  movement: {
    progress: 1,
    pieces: [], // {prevPos, pos}[]
  },
  selectedPieceProgress: 1,

  /*
    Lightning: {
      segments{startPos,endPos,deg,distance}, 
      segIndex, distProgress, isAppearing
    }
  */
  lightnings: [],
  LIGHTNING_COLOR: [96, 214, 235],

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
    previousScores: [0, 0], // [white, black]
  },

  TARGETS_COLORS: [
    [243, 170, 135],
    [240, 223, 125],
    [178, 237, 119],
    [116, 232, 178],
    [125, 213, 240],
    [125, 146, 240],
    [238, 125, 240],
    [240, 125, 156],
  ],

  easeInOutCubic: function (x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  },
  easeOutElastic: function (x) {
    const c4 = (2 * Math.PI) / 3;
    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  },
  easeOutExpo: function (x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  },

  // takes a string with only numbers, plus sign, and colon sign
  getNumHalfWidth: function (numStr, s) {
    const arr = numStr.split("");
    let hw = 0;
    for (let i = 0; i < arr.length; i++) {
      hw += this.numHalfWidths[arr[i]];
    }
    if (s !== undefined) return (hw / 18) * s;
    return hw;
  },

  renderUI: function (isPlayerTurn) {
    const meta = GAMEPLAY.meta;
    const whiteColor = color(240);
    const blackColor = color(20);
    const boardColor2 = BOARD_INFO.color2;
    const scoringColor = color(50, 225, 35);
    const isAnimatingMovement = this.movement.progress < 1;

    // render timeline buttons
    const bot = BOT;
    if (
      isPlayerTurn ||
      meta.gameover ||
      meta.latestMoveIndex !== REPLAYSYS.viewingMoveIndex ||
      REPLAYSYS.skipping !== null
    ) {
      for (let i = 0; i < 4; i++) {
        this.btns[i].render();
      }
    } else {
      let processingProgress = bot.finalOutput === null ? 0 : 1;
      if (bot.isProcessing && bot.stack.length > 0) {
        const root = bot.stack[0];
        if (root.potentialActions !== null) {
          processingProgress =
            (1 / bot.maxProgress) *
            (bot.maxProgress - root.potentialActions.length);
        }
      }

      noFill();
      stroke(boardColor2);
      strokeWeight(2);
      rect(170, 575, 160, 10);
      fill(boardColor2);
      noStroke();
      rect(170, 575, 160 * processingProgress, 10);
    }

    // render other buttons
    this.btns[4].render();
    this.btns[5].render();

    const prevScores = this.capturedTR.previousScores;
    const prevSeparationX =
      prevScores[0] === prevScores[1]
        ? 250
        : (500 / (prevScores[0] + prevScores[1])) * prevScores[0];

    const separationX =
      meta.white.score === meta.black.score
        ? 250
        : (500 / (meta.white.score + meta.black.score)) * meta.white.score;

    // render white & black score bars (render previous if piece moving or yellow bar still extending)
    noStroke();
    fill(blackColor);
    rect(0, 500, 500, 12);
    if (isAnimatingMovement || this.capturedTR.progress < 0.4) {
      fill(whiteColor);
      rect(0, 500, prevSeparationX, 12);
    } else {
      fill(whiteColor);
      rect(0, 500, separationX, 12);
    }

    // render animated increasing bar
    const prg = this.capturedTR.progress;
    const extendFactor = isAnimatingMovement
      ? 0
      : this.easeOutExpo(map(prg, 0, 0.4, 0, 1));
    if (prg < 0.8) {
      // extend: 0 to 0.4
      let endX =
        prg > 0.4
          ? separationX
          : map(extendFactor, 0, 1, prevSeparationX, separationX);

      // follow: 0.4 to 0.8
      let startX =
        prg < 0.4
          ? prevSeparationX
          : prg > 0.8
          ? separationX
          : map(
              this.easeOutExpo(map(prg, 0.4, 0.8, 0, 1)),
              0,
              1,
              prevSeparationX,
              separationX
            );

      fill(scoringColor);
      if (separationX > prevSeparationX) {
        rect(startX, 500, endX - startX, 12);
      } else {
        rect(endX, 500, startX - endX, 12);
      }
    }

    // score texts
    let renderWScore = meta.white.score;
    let renderBScore = meta.black.score;
    const whiteScored = REPLAYSYS.viewingMoveIndex % 4 < 2;
    if (whiteScored) {
      renderWScore =
        prevScores[0] + round(extendFactor * (renderWScore - prevScores[0]));
    } else {
      renderBScore =
        prevScores[1] + round(extendFactor * (renderBScore - prevScores[1]));
    }

    let scoreWidth = this.getNumHalfWidth(renderWScore + "", 34);
    myText(
      renderWScore + "",
      38 - scoreWidth,
      555,
      34,
      prg < 0.6 && whiteScored && !isAnimatingMovement
        ? scoringColor
        : whiteColor
    );

    scoreWidth = this.getNumHalfWidth(renderBScore + "", 34);
    myText(
      renderBScore + "",
      450 - scoreWidth,
      555,
      34,
      prg < 0.6 && !whiteScored && !isAnimatingMovement
        ? scoringColor
        : blackColor
    );

    // render white names & time
    myText(this.playersNames[0], 90, 535, 12, whiteColor);
    myText(this.getTimeStr(true, meta), 90, 555, 12, whiteColor);

    // render black names & time
    myText(
      this.playersNames[1],
      410 - myText(this.playersNames[1], -100, -100, 12, color(0, 0)),
      535,
      12,
      blackColor
    );
    const blackTimeStr = this.getTimeStr(false, meta);
    myText(
      blackTimeStr,
      410 - myText(blackTimeStr, -100, -100, 12, color(0, 0)),
      555,
      12,
      blackColor
    );

    // render round number
    const roundNumberColor = color(boardColor2);
    myText(
      meta.round + "",
      225,
      555,
      30,
      meta.round < CONSTANTS.MAX_ROUND - 1 || meta.gameover
        ? roundNumberColor
        : lerpColor(
            roundNumberColor,
            color(255, 0, 0),
            0.4 + cos(frameCount * 5) * 0.4
          )
    );
    myText("/8", 251, 538, 13, roundNumberColor);

    // render moves left
    strokeWeight(1.5);
    stroke(boardColor2);

    this.renderMoveIndicator(195, 532, meta.white.energy === 2, false);
    this.renderMoveIndicator(
      195,
      547,
      meta.white.energy === 1,
      meta.white.energy > 0
    );
    this.renderMoveIndicator(
      295,
      532,
      meta.black.energy === 2 && meta.white.energy === 0,
      meta.black.energy === 2
    );
    this.renderMoveIndicator(
      295,
      547,
      meta.black.energy === 1,
      meta.black.energy > 0
    );
  },

  getTimeStr: function (forWhite, meta) {
    const ts = meta.timeStops;
    let totalTime = 0;
    for (let i = forWhite ? 0 : 1; i < ts.length; i += 2) {
      // not last one in list?
      if (i + 1 < ts.length) {
        totalTime += ts[i + 1] - ts[i];
      }
    }
    // not gameover & is its turn?
    if (!meta.gameover && forWhite === (ts.length % 2 === 1)) {
      totalTime += Date.now() - ts[ts.length - 1];
    }
    const minute = floor(totalTime / 60000);
    const sec = floor((totalTime % 60000) / 1000) + "";
    return minute + ":" + (sec.length === 1 ? "0" : "") + sec;
  },

  renderMoveIndicator: function (x, y, isFlashing, isFilled) {
    if (isFlashing)
      fill(
        lerpColor(
          BOARD_INFO.color2,
          color(255),
          cos(frameCount * 4) * 0.35 + 0.35
        )
      );
    else if (isFilled) fill(BOARD_INFO.color2);
    else noFill();
    rect(x, y, 10, 8);
  },

  bigSpawnLightings: function (rx, ry) {
    for (let i = 0; i < 10; i++) {
      // within a small square
      this.spawnLightning(rx + random() * 50 - 25, ry + random() * 50 - 25);
    }
  },
  spawnLightning: function (x, y) {
    const segAmount = round(random() * 2) + 2; // range + minimum
    const segments = [];
    for (let i = 0; i < segAmount; i++) {
      const lastVertex = i === 0 ? null : segments[i - 1];
      const startPos = lastVertex ? lastVertex.endPos : { x, y };

      let deg;
      if (lastVertex)
        deg =
          lastVertex.deg +
          (60 + random() * 90) *
            ((i < 2 ? random() > 0.5 : lastVertex.deg - segments[i - 2].deg < 0)
              ? 1
              : -1);
      else deg = random() * 360; // else: new starting

      const distance = random() * 7 + 6; // range + minimum
      const endPos = {
        x: startPos.x + cos(deg) * distance,
        y: startPos.y + sin(deg) * distance,
      };
      segments.push({ startPos, endPos, deg, distance });
    }

    this.lightnings.push({
      segments,
      segIndex: 0,
      isAppearing: true,
      distProgress: 0,
    });
  },

  renderLightnings: function () {
    stroke(this.LIGHTNING_COLOR); // LIGHTING COLOR
    strokeWeight(3);
    for (let lns = this.lightnings, i = lns.length - 1; i >= 0; i--) {
      const ln = lns[i];

      // update distProgress
      ln.distProgress += 1.5; // LIGHTNING SPEED

      if (ln.isAppearing) {
        // render all segments before, current segment startPos to progress
        for (let si = 0; si < ln.segments.length; si++) {
          const seg = ln.segments[si];
          if (si < ln.segIndex) {
            line(seg.startPos.x, seg.startPos.y, seg.endPos.x, seg.endPos.y);
          } else if (si === ln.segIndex) {
            const prg = min(ln.distProgress, seg.distance);
            line(
              seg.startPos.x,
              seg.startPos.y,
              seg.startPos.x + cos(seg.deg) * prg,
              seg.startPos.y + sin(seg.deg) * prg
            );
            // done with segment?
            if (ln.distProgress >= seg.distance) {
              ln.segIndex++;
              ln.distProgress = 0;
              // done with appearing?
              if (ln.segIndex === ln.segments.length) {
                ln.isAppearing = false;
                ln.segIndex = 0;
              }
            }
          } else break;
        }
      }
      // disappearing
      else {
        // render all segments after, current segment progress to endPos
        for (let si = ln.segments.length - 1; si >= 0; si--) {
          const seg = ln.segments[si];
          if (si > ln.segIndex) {
            line(seg.startPos.x, seg.startPos.y, seg.endPos.x, seg.endPos.y);
          } else if (si === ln.segIndex) {
            const prg = min(ln.distProgress, seg.distance);
            line(
              seg.startPos.x + cos(seg.deg) * prg,
              seg.startPos.y + sin(seg.deg) * prg,
              seg.endPos.x,
              seg.endPos.y
            );
            // done with segment?
            if (ln.distProgress >= seg.distance) {
              ln.segIndex++;
              ln.distProgress = 0;
              // done with disappearing?
              if (ln.segIndex === ln.segments.length) lns.splice(i, 1);
            }
          } else break;
        }
      }
    }
  },

  renderCapturedTarget: function () {
    if (this.capturedTR.progress >= 1) return;
    // CAPTURE ANIMATION SPEED
    this.capturedTR.progress = min(1, this.capturedTR.progress + 0.012);

    const move = REPLAYSYS.moves[REPLAYSYS.viewingMoveIndex];
    // can't get move or no score gained?
    if (!move || move.scoreGained === 0) return;
    const targetRenderPos = this.getRenderPos(
      this.capturedTR.pos.x,
      this.capturedTR.pos.y
    );

    // render score gained
    let popupSizeFactor = 1;
    if (this.capturedTR.progress < 0.3) {
      popupSizeFactor = (1 / 0.3) * this.capturedTR.progress;
    } else if (this.capturedTR.progress < 0.9) {
    } else {
      popupSizeFactor = (1 / 0.1) * (0.1 - (this.capturedTR.progress - 0.9));
    }
    push(); /// KA
    translate(
      targetRenderPos.rx,
      targetRenderPos.ry + 50 * (this.capturedTR.pos.y !== 0 ? -1 : 1)
    );
    scale(
      this.capturedTR.progress < 0.3
        ? this.easeOutElastic(popupSizeFactor)
        : popupSizeFactor
    );
    fill(0, 0, 0, 200);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, 60, 40, 10);
    const scoreGainedStr = "+" + move.scoreGained.toString();
    myText(
      scoreGainedStr,
      -this.getNumHalfWidth(scoreGainedStr) - 3,
      9,
      18,
      color(255)
    );
    pop(); /// KA

    const circlesProgress = this.capturedTR.progress * 2.1;
    if (circlesProgress >= 1) return; // circles already disappeared

    // calculate circles positions
    const circlesPositions = [];
    for (
      let fcs = this.capturedTR.fadingCircles, ci = 0;
      ci < fcs.length;
      ci++
    ) {
      const cir = fcs[ci];
      // FADING CIRCLE MOVE SPEED
      cir.pos.rx += cos(cir.deg) * 0.5;
      cir.pos.ry += sin(cir.deg) * 0.5;
      circlesPositions.push({
        rx: cir.pos.rx,
        ry: cir.pos.ry,
      });
    }

    // render circles outlines
    const circleSize = (1 - circlesProgress) * CONSTANTS.CIRCLE_SIZE;
    noFill();
    stroke(0);
    strokeWeight(6);
    for (let ci = 0; ci < circlesPositions.length; ci++) {
      const { rx, ry } = circlesPositions[ci];
      ellipse(rx, ry, circleSize, circleSize);
    }

    // render inner circles
    noStroke();
    const targetColor = color(this.TARGETS_COLORS[this.capturedTR.value - 1]);
    fill(targetColor);
    for (let ci = 0; ci < circlesPositions.length; ci++) {
      const { rx, ry } = circlesPositions[ci];
      ellipse(rx, ry, circleSize, circleSize);
    }
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

  renderAllTargets: function () {
    const circleSize = CONSTANTS.CIRCLE_SIZE;
    for (let i = 0; i < this.targets.length; i++) {
      const TR = this.targets[i];
      let value = TR.value;
      if (TR.delay > 0) {
        TR.delay--;
        if (value === 1) {
          // render spawn preview
          const { rx, ry } = this.getRenderPos(TR.pos.x, TR.pos.y);
          stroke(0);
          strokeWeight(10);
          line(rx, ry + 7, rx, ry - 7);
          line(rx + 7, ry, rx - 7, ry);
          stroke(this.TARGETS_COLORS[0]);
          strokeWeight(5);
          line(rx, ry + 7, rx, ry - 7);
          line(rx + 7, ry, rx - 7, ry);
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
        ellipse(rx, ry, circleSize, circleSize);
      }

      // render inner circles
      noStroke();
      const targetColor = color(this.TARGETS_COLORS[value - 1]);
      if (TR.delay <= 0 && TR.progress < 1) {
        fill(lerpColor(color(255), targetColor, TR.progress));
      } else fill(targetColor);
      for (let ci = 0; ci < circlesPositions.length; ci++) {
        const { rx, ry } = circlesPositions[ci];
        ellipse(rx, ry, circleSize, circleSize);
      }

      // render value
      const { rx, ry } = this.getRenderPos(TR.pos.x, TR.pos.y);
      const valueStr = value.toString();
      myText(
        valueStr,
        rx - this.getNumHalfWidth(valueStr),
        ry + 9,
        18,
        color(0)
      );
    }
    this.renderCapturedTarget();
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

  renderChargedStatus: function (rx, ry) {
    // render charged icon
    fill(this.LIGHTNING_COLOR);
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

    // spawn lightning occasionally
    if (frameCount % 25 === 0) {
      this.spawnLightning(rx + random() * 30 - 15, ry + random() * 30 - 15);
    }
  },

  renderAllPieces: function (bd) {
    const ss = 62.5;
    const gp = GAMEPLAY;
    const pp = this.piecesPositions.slice();
    const getPieceImage = this.getPieceImage;
    // render moving piece
    if (this.movement.progress < 1) {
      // render moving pieces
      for (let p1 = 0; p1 < this.movement.pieces.length; p1++) {
        const { prevPos, pos } = this.movement.pieces[p1];
        const pieceData = bd[pos.y][pos.x];
        const { rx: rpx, ry: rpy } = this.getRenderPos(prevPos.x, prevPos.y);
        const { rx, ry } = this.getRenderPos(pos.x, pos.y);
        image(
          getPieceImage(pieceData),
          rpx + (rx - rpx) * this.movement.progress,
          rpy + (ry - rpy) * this.movement.progress,
          ss,
          ss
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
        // normal piece movement speed (+= base speed - distanceBetween * slowFactor)
        const { prevPos, pos } = this.movement.pieces[0];
        const distanceBetween = dist(prevPos.x, prevPos.y, pos.x, pos.y);
        this.movement.progress = min(
          this.movement.progress + 0.15 - distanceBetween * 0.01,
          1
        );
      }

      // trigger capture animation if ended
      if (this.movement.progress === 1) {
        this.deleteRemovingTR(true);

        // if not skipping & moving forward
        if (REPLAYSYS.skipping === null && REPLAYSYS.lastLoadIsForward) {
          // spawn lightings if charged a piece
          const move =
            REPLAYSYS.viewingMoveIndex < 0
              ? null
              : REPLAYSYS.moves[REPLAYSYS.viewingMoveIndex];
          if (move && move.endData && !GAMEPLAY.isTarget(move.endData)) {
            const { rx, ry } = this.getRenderPos(
              move.lastMove.sx,
              move.lastMove.sy
            );
            this.bigSpawnLightings(rx, ry);
          }

          // spawn lightnings if charged
          if (move && move.startData.isCharged) {
            const { rx, ry } = this.getRenderPos(
              move.lastMove.ex,
              move.lastMove.ey
            );
            this.bigSpawnLightings(rx, ry);
          }
        }
      }
    }

    // render selected piece
    if (gp.selectedPiecePos !== null) {
      // take out selected piece from pp
      for (let p2 = 0; p2 < pp.length; p2++) {
        const pos2 = pp[p2];
        if (
          gp.selectedPiecePos.x === pos2.x &&
          gp.selectedPiecePos.y === pos2.y
        ) {
          pp.splice(p2, 1);
          break;
        }
      }

      const pieceData = bd[gp.selectedPiecePos.y][gp.selectedPiecePos.x];
      const { rx, ry } = this.getRenderPos(
        gp.selectedPiecePos.x,
        gp.selectedPiecePos.y
      );
      if (this.selectedPieceProgress < 1) {
        this.selectedPieceProgress = min(this.selectedPieceProgress + 0.015, 1);
      }

      if (this.selectedPieceProgress < 0.08) this.selectedPieceProgress = 0.08;
      let scaleFactor = this.easeOutElastic(this.selectedPieceProgress);
      scaleFactor *= 0.5; // animated range
      image(
        getPieceImage(pieceData),
        rx,
        ry,
        ss * (0.5 + scaleFactor),
        ss * (1.5 - scaleFactor)
      );

      if (pieceData.isCharged) this.renderChargedStatus(rx, ry);
    }

    // render non moving pieces
    const isPlayerTurn = gp.meta.isWhiteTurn
      ? BOT.whiteDepth === 0
      : BOT.blackDepth === 0;
    const doesCheckIfHovered =
      !gp.meta.gameover &&
      gp.meta.latestMoveIndex === REPLAYSYS.viewingMoveIndex &&
      gp.selectedPiecePos === null &&
      gp.hoveredSq !== null;
    for (let i = 0; i < pp.length; i++) {
      const piecePos = pp[i];
      const pieceData = bd[piecePos.y][piecePos.x];
      const { rx, ry } = this.getRenderPos(piecePos.x, piecePos.y);
      image(getPieceImage(pieceData), rx, ry, ss, ss);

      // hovered render
      if (doesCheckIfHovered && gp.meta.isWhiteTurn === pieceData.isWhite) {
        if (gp.hoveredSq.x === piecePos.x && gp.hoveredSq.y === piecePos.y) {
          if (isPlayerTurn) cursor(HAND);
          stroke(200);
          strokeWeight(3);
          noFill();
          rect(ss * piecePos.x, ss * piecePos.y, ss, ss);
        }
      }

      if (pieceData.isCharged) this.renderChargedStatus(rx, ry);
    }
  },

  getPieceImage: function (sd) {
    if (sd.isWhite) {
      switch (sd.name) {
        case "R":
          return pieceImages.rw;
        case "K":
          return pieceImages.kw;
        case "B":
          return pieceImages.bw;
        case "L":
          return pieceImages.lw;
        case "Q":
          return pieceImages.qw;
      }
    } else {
      switch (sd.name) {
        case "R":
          return pieceImages.rb;
        case "K":
          return pieceImages.kb;
        case "B":
          return pieceImages.bb;
        case "L":
          return pieceImages.lb;
        case "Q":
          return pieceImages.qb;
      }
    }
  },

  getRenderPos: function (x, y) {
    return {
      rx: 62.5 * (x + 0.5),
      ry: 62.5 * (y + 0.5),
    };
  },
};
