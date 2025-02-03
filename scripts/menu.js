const MENU = {
  titleBtns: [],
  inputFromTitle: ["Z", "Z", "Z"],
  easterEggProgress: 1,
  menuBtns: [],
  thumbnailImg: null,

  createBtns: function () {
    // play scene buttons
    const timelineBtnsAreDisabled = function () {
      const meta = GAMEPLAY.meta;
      const isPlayerTurn = meta.isWhiteTurn
        ? BOT.whiteDepth === 0
        : BOT.blackDepth === 0;
      const result =
        !meta.gameover &&
        !isPlayerTurn &&
        meta.latestMoveIndex === REPLAYSYS.viewingMoveIndex;
      return result;
    };
    RENDER.btns = [
      new Btn(
        225,
        580,
        40,
        28,
        function () {
          stroke(BOARD_INFO.color1);
          strokeWeight(5);
          line(3, -5, -4, 0);
          line(3, 5, -4, 0);
        },
        function () {
          if (timelineBtnsAreDisabled()) return;
          if (REPLAYSYS.skipping !== null) return (REPLAYSYS.skipping = null);
          REPLAYSYS.loadState(false);
        }
      ),
      new Btn(
        275,
        580,
        40,
        28,
        function () {
          stroke(BOARD_INFO.color1);
          strokeWeight(5);
          line(-3, -5, 4, 0);
          line(-3, 5, 4, 0);
        },
        function () {
          if (timelineBtnsAreDisabled()) return;
          if (REPLAYSYS.skipping !== null) return (REPLAYSYS.skipping = null);
          REPLAYSYS.loadState(true);
          if (REPLAYSYS.viewingMoveIndex === GAMEPLAY.meta.latestMoveIndex)
            GAMEPLAY.skipHintCountdown = 0; // stop hint
        }
      ),
      new Btn(
        175,
        580,
        40,
        28,
        function () {
          stroke(BOARD_INFO.color1);
          strokeWeight(5);
          line(7, -5, 0, 0);
          line(7, 5, 0, 0);
          line(-6, -5, -6, 5);
        },
        function () {
          if (timelineBtnsAreDisabled()) return;
          if (REPLAYSYS.skipping !== null) return (REPLAYSYS.skipping = null);
          REPLAYSYS.setUpSkipping(false);
        }
      ),
      new Btn(
        325,
        580,
        40,
        28,
        function () {
          stroke(BOARD_INFO.color1);
          strokeWeight(5);
          line(-7, -5, 0, 0);
          line(-7, 5, 0, 0);
          line(6, -5, 6, 5);
        },
        function () {
          if (timelineBtnsAreDisabled()) return;
          if (REPLAYSYS.skipping !== null) return (REPLAYSYS.skipping = null);
          REPLAYSYS.setUpSkipping(true);
          GAMEPLAY.skipHintCountdown = 0; // stop hint
        }
      ),

      new Btn(
        60,
        580,
        80,
        28,
        function () {
          myText("exit", -28, 8, 16, BOARD_INFO.color1);
        },
        function () {}
      ),

      new Btn(
        440,
        580,
        80,
        28,
        function () {
          myText("help", -28, 8, 16, BOARD_INFO.color1);
        },
        function () {}
      ),
    ];

    // menu title buttons
    const enterLetter = function (letter) {
      const arr = MENU.inputFromTitle;
      arr.push(letter);
      arr.shift();
      // easter egg trigger
      if (arr[0] === "s" && arr[1] === "u" && arr[2] === "s") {
        arr[2] = "Z";
        if (MENU.easterEggProgress >= 1) MENU.easterEggProgress = 0;
      }
      if (arr[0] === "g" && arr[1] === "h" && arr[2] === "p") {
        arr[2] = "Z";
        fill(BOARD_INFO.color1);
        noStroke();
        rect(0, 400, width, 200);
        MENU.thumbnailImg = get(0, 0, width, width);
      }
    };
    for (let i = 0; i < 5; i++) {
      const letter = "super"[i];
      const letterWidth = myText(letter, 0, 0, 50, color(0, 0));
      const xValue = 70 + i * 90;
      this.titleBtns.push(
        new Btn(
          xValue,
          100,
          80,
          80,
          function () {
            myText(
              letter,
              -letterWidth / 2 - 5,
              25,
              50,
              color(BOARD_INFO.color1)
            );
          },
          function () {
            RENDER.bigSpawnLightings(xValue, 100);
            enterLetter(letter);
          }
        )
      );
    }
    for (let i = 0; i < 6; i++) {
      const letter = "charge"[i];
      const letterWidth = myText(letter, 0, 0, 40, color(0, 0));
      const xValue = 65 + i * 74;
      this.titleBtns.push(
        new Btn(
          xValue,
          180,
          66,
          66,
          function () {
            myText(
              letter,
              -letterWidth / 2 - 3,
              20,
              40,
              color(BOARD_INFO.color1)
            );
          },
          function () {
            RENDER.bigSpawnLightings(xValue, 180);
            enterLetter(letter);
          }
        )
      );
    }

    // menu buttons
    this.menuBtns = [
      new Btn(
        250,
        440,
        200,
        60,
        function () {
          myText("play", -52, 14, 30, BOARD_INFO.color1);
        },
        function () {
          //// temporary start
          const grp = () => random(["R", "B", "K", "L", "Q"]);
          GAMEPLAY.initializeGame({
            /// random([0, 1, 3, 3])
            white: {
              botDepth: random([0, 1, 3, 3]),
              squad: [grp(), grp(), grp()],
            },
            black: {
              botDepth: random([0, 1, 3, 3]),
              squad: [grp(), grp(), grp()],
            },
          });
          SCENE_CONTROL.changeScene("PLAY");
        }
      ),
      new Btn(
        250,
        520,
        320,
        60,
        function () {
          myText("custom game", -130, 11, 25, BOARD_INFO.color1);
        },
        function () {
          SCENE_CONTROL.changeScene("CUSTOM");
        }
      ),
    ];
  },

  renderMainMenu: function () {
    if (this.thumbnailImg !== null) {
      image(this.thumbnailImg, width / 2, height / 2, width, height);
      return;
    }

    background(BOARD_INFO.color1);
    const r = RENDER;

    // render pieces
    const t = frameCount;
    push(); /// KA
    translate(330, 310);
    rotate(cos(t + 30) * 20);
    image(r.getPieceImage({ isWhite: false, name: "R" }), 0, 0, 150, 150);
    pop(); /// KA
    push(); /// KA
    translate(250, 310);
    rotate(0 + cos(t) * 20);
    image(r.getPieceImage({ isWhite: false, name: "B" }), 0, 0, 150, 150);
    pop(); /// KA
    push(); /// KA
    translate(170, 310);
    rotate(cos(t - 30) * 20);
    image(r.getPieceImage({ isWhite: false, name: "K" }), 0, 0, 150, 150);
    pop(); /// KA

    // render title
    for (let i = 0; i < this.titleBtns.length; i++) {
      this.titleBtns[i].render();
    }
    // render buttons
    for (let i = 0; i < this.menuBtns.length; i++) {
      this.menuBtns[i].render();
    }

    // spawn lightning occasionally
    if (frameCount % 5 === 0) {
      r.spawnLightning(random() * 500, 50 + random() * 180);
    }

    r.renderLightnings();

    // draw easter egg
    push(); /// KA
    if (this.easterEggProgress < 1) {
      this.easterEggProgress += 0.003;
      translate(-500, 100 + -this.easterEggProgress * 1200);
      scale(4.2);
      strokeWeight(5);
      stroke(0, 0, 0);
      fill(255, 0, 0);
      rect(130, 150, 20, 70, 10);
      rect(150, 147, 70, 81, 10);
      rect(150, 203, 25, 50, 10);
      rect(195, 199, 25, 50, 10);
      arc(185.5, 160, 70, 70, 180, 360);
      arc(207.5, 240, 25, 25, 0, 180);
      arc(162.57, 245, 25, 25, 0, 180);
      fill(102, 102, 102);
      fill(255, 0, 0);
      noStroke();
      rect(153, 185, 65, 41);
      stroke(0, 0, 0);
      fill(0, 196, 255);
      rect(175, 150, 50, 30, 25);
      noStroke();
      fill(139, 209, 247);
      rect(191, 153, 30, 20, 25);
      fill(195, 230, 247);
      rect(199, 153, 20, 15, 25);
    }
    pop(); /// KA
  },

  clicked: function () {
    // close thumnnail
    if (this.thumbnailImg !== null) {
      this.thumbnailImg = null;
      return;
    }
    for (let i = 0; i < this.titleBtns.length; i++) {
      const b = this.titleBtns[i];
      if (b.isHovered) return b.clicked();
    }
    for (let i = 0; i < this.menuBtns.length; i++) {
      const b = this.menuBtns[i];
      if (b.isHovered) return b.clicked();
    }
  },
};
