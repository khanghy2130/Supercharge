const MENU = {
  titleBtns: [],
  inputFromTitle: ["Z", "Z", "Z"],
  easterEggProgress: 1,
  menuBtns: [],
  thumbnailImg: null,

  reusableBackBtn: null,
  standardBtns: [],
  custom: {
    bgImage: null,
    isChoosingPreset: false,
    btns: [], // preset, 2 * (bot, 3 * piece)
    presetBtns: [],
    white: {
      botDepth: 0,
      squad: ["R", "B", "K"],
    },
    black: {
      botDepth: 1,
      squad: ["K", "B", "R"],
    },
  },

  streak: {
    easy: [0, 0], // current, best
    hard: [0, 0],
  },

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
            GAMEPLAY.hintArrow.countDown = 0; // stop hint
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
          GAMEPLAY.hintArrow.countDown = 0; // stop hint
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
        function () {
          const SC = SCENE_CONTROL;
          const lastScene = SC.scenesStack[SC.scenesStack.length - 1];
          // ask to confirm
          if (!GAMEPLAY.meta.gameover && lastScene === "STANDARD") {
            const ew = GAMEPLAY.exitWarning;
            ew.isShown = true;
            for (let i = 0; i < ew.btns.length; i++) {
              ew.btns[i].animateProgress = 1;
            }
            return;
          }
          SC.changeScene(lastScene);
        }
      ),

      new Btn(
        440,
        580,
        80,
        28,
        function () {
          myText("help", -28, 8, 16, BOARD_INFO.color1);
        },
        function () {
          GAMEPLAY.help.isShown = true;
          GAMEPLAY.help.progress = 0;
        }
      ),
    ];
    GAMEPLAY.exitWarning.btns = [
      new Btn(
        150,
        320,
        140,
        50,
        function () {
          myText("yes", -30, 12, 24, color(250));
        },
        function () {
          const botIsHard = BOT.whiteDepth === 3 || BOT.blackDepth === 3;
          const streakArr = botIsHard ? MENU.streak.hard : MENU.streak.easy;
          streakArr[0] = 0;
          // save to storage /// KA
          localStorage.setItem(
            botIsHard ? "hard" : "easy",
            JSON.stringify(streakArr)
          );

          GAMEPLAY.exitWarning.isShown = false;
          const SC = SCENE_CONTROL;
          SC.changeScene(SC.scenesStack[SC.scenesStack.length - 1]);
        }
      ),
      new Btn(
        350,
        320,
        140,
        50,
        function () {
          myText("no", -20, 12, 24, color(250));
        },
        function () {
          GAMEPLAY.exitWarning.isShown = false;
        }
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
            myText(letter, -letterWidth / 2 - 5, 25, 50, BOARD_INFO.color1);
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
            myText(letter, -letterWidth / 2 - 3, 20, 40, BOARD_INFO.color1);
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
          SCENE_CONTROL.changeScene("STANDARD");
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

    this.reusableBackBtn = new Btn(
      250,
      540,
      150,
      50,
      function () {
        myText("back", -46, 12, 25, BOARD_INFO.color1);
      },
      function () {
        const SC = SCENE_CONTROL;
        SC.changeScene(SC.scenesStack[SC.scenesStack.length - 1]);
      }
    );

    // standard buttons
    for (let i = 0; i < 2; i++) {
      this.standardBtns.push(
        new Btn(
          i === 0 ? 123 : 377,
          200,
          200,
          80,
          function () {
            myText("play", -50, 15, 30, BOARD_INFO.color1);
          },
          function () {
            const playerIsWhite = random() > 0.5;
            const botDepth = i === 0 ? 1 : 3;
            GAMEPLAY.initializeGame({
              white: {
                botDepth: playerIsWhite ? 0 : botDepth,
                squad: ["R", "B", "K"],
              },
              black: {
                botDepth: !playerIsWhite ? 0 : botDepth,
                squad: ["K", "B", "R"],
              },
            });
            SCENE_CONTROL.changeScene("PLAY");
          }
        )
      );
      this.standardBtns.push(
        new Btn(
          i === 0 ? 123 : 377,
          280,
          200,
          50,
          function () {
            myText("replays", -65, 10, 20, BOARD_INFO.color1);
          },
          function () {
            REPLAYS_MENU.category = i === 0 ? "EASY" : "HARD";
            SCENE_CONTROL.changeScene("REPLAYS");
          }
        )
      );
    }

    // custom buttons
    const custom = this.custom;
    this.custom.btns = [
      new Btn(
        110,
        540,
        150,
        50,
        function () {
          myText("back", -46, 12, 25, BOARD_INFO.color1);
        },
        function () {
          const SC = SCENE_CONTROL;
          SC.changeScene(SC.scenesStack[SC.scenesStack.length - 1]);
        }
      ),
      new Btn(
        370,
        540,
        200,
        50,
        function () {
          myText("replays", -73, 12, 25, BOARD_INFO.color1);
        },
        function () {
          REPLAYS_MENU.category = "CUSTOM";
          SCENE_CONTROL.changeScene("REPLAYS");
        }
      ),
      new Btn(
        150,
        60,
        240,
        40,
        function () {
          myText("choose preset", -100, 10, 18, BOARD_INFO.color1);
        },
        function () {
          custom.isChoosingPreset = true;
          custom.bgImage = get(0, 0, width, height);
          for (let i = 0; i < custom.presetBtns.length; i++) {
            custom.presetBtns[i].animateProgress = 0;
          }
        }
      ),
      new Btn(
        380,
        70,
        180,
        60,
        function () {
          myText("play", -52, 15, 30, BOARD_INFO.color1);
        },
        function () {
          GAMEPLAY.initializeGame({
            white: custom.white,
            black: custom.black,
          });
          SCENE_CONTROL.changeScene("PLAY");
        }
      ),
      new Btn(
        110,
        190,
        160,
        40,
        function () {
          switch (custom.white.botDepth) {
            case 0:
              return myText("no bot", -50, 9, 18, BOARD_INFO.color1);
            case 1:
              return myText("easy bot", -62, 9, 18, BOARD_INFO.color1);
            case 3:
              return myText("hard bot", -65, 9, 18, BOARD_INFO.color1);
          }
        },
        function () {
          if (custom.white.botDepth === 0) custom.white.botDepth = 1;
          else if (custom.white.botDepth === 1) custom.white.botDepth = 3;
          else if (custom.white.botDepth === 3) custom.white.botDepth = 0;
        }
      ),
      new Btn(
        390,
        190,
        160,
        40,
        function () {
          switch (custom.black.botDepth) {
            case 0:
              return myText("no bot", -50, 9, 18, BOARD_INFO.color1);
            case 1:
              return myText("easy bot", -62, 9, 18, BOARD_INFO.color1);
            case 3:
              return myText("hard bot", -65, 9, 18, BOARD_INFO.color1);
          }
        },
        function () {
          if (custom.black.botDepth === 0) custom.black.botDepth = 1;
          else if (custom.black.botDepth === 1) custom.black.botDepth = 3;
          else if (custom.black.botDepth === 3) custom.black.botDepth = 0;
        }
      ),
    ];
    // piece buttons
    const pieceNames = ["R", "B", "K", "L", "Q"];
    for (let si = 0; si < 2; si++) {
      for (let bi = 0; bi < 3; bi++) {
        this.custom.btns.push(
          new Btn(
            110 + si * 280,
            255 + bi * 80,
            70,
            70,
            function () {
              const squad = si === 0 ? custom.white.squad : custom.black.squad;
              const pieceImg = RENDER.getPieceImage({
                isWhite: si === 0,
                name: squad[bi],
              });
              image(pieceImg, 0, 0, 65, 65);
            },
            function () {
              const squad = si === 0 ? custom.white.squad : custom.black.squad;
              const currentIndex = pieceNames.indexOf(squad[bi]);
              // is last piece?
              if (currentIndex === pieceNames.length - 1) {
                squad[bi] = pieceNames[0];
              } else {
                squad[bi] = pieceNames[currentIndex + 1];
              }
            }
          )
        );
      }
    }
    // preset buttons
    custom.presetBtns = [
      new Btn(
        250,
        90,
        270,
        50,
        function () {
          myText("randomize pieces", -113, 8, 16, color(250, 250, 0));
        },
        function () {
          const grp = function () {
            return pieceNames[floor(random() * pieceNames.length)];
          };
          custom.white.squad = [grp(), grp(), grp()];
          custom.black.squad = [grp(), grp(), grp()];
        }
      ),
    ];
    const presets = [
      [
        "local multiplayer",
        {
          botDepth: 0,
          squad: ["R", "B", "K"],
        },
        {
          botDepth: 0,
          squad: ["K", "B", "R"],
        },
      ],
      [
        "fortress",
        {
          botDepth: 0,
          squad: ["R", "B", "K"],
        },
        {
          botDepth: 3,
          squad: ["R", "R", "R"],
        },
      ],
      [
        "knightmare",
        {
          botDepth: 0,
          squad: ["K", "K", "K"],
        },
        {
          botDepth: 3,
          squad: ["K", "K", "K"],
        },
      ],
      [
        "royal",
        {
          botDepth: 0,
          squad: ["Q", "K", "L"],
        },
        {
          botDepth: 3,
          squad: ["L", "K", "Q"],
        },
      ],
      [
        "castle",
        {
          botDepth: 0,
          squad: ["R", "L", "R"],
        },
        {
          botDepth: 3,
          squad: ["R", "L", "R"],
        },
      ],
    ];
    for (let i = 0; i < presets.length; i++) {
      const [presetName, white, black] = presets[i];
      const nameWidth = myText(presetName, 0, 0, 16, color(0, 0));
      custom.presetBtns.push(
        new Btn(
          250,
          150 + i * 60,
          nameWidth + 50,
          50,
          function () {
            myText(presetName, -nameWidth / 2, 8, 16, color(250));
          },
          function () {
            custom.white = {
              botDepth: white.botDepth,
              squad: white.squad.slice(),
            };
            custom.black = {
              botDepth: black.botDepth,
              squad: black.squad.slice(),
            };
          }
        )
      );
    }
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

  renderCustomMenu: function () {
    if (this.custom.isChoosingPreset) {
      image(this.custom.bgImage, width / 2, height / 2, width, height);
      noStroke();
      fill(0, 200);
      rect(0, 0, width, height);
      for (let i = 0; i < this.custom.presetBtns.length; i++) {
        this.custom.presetBtns[i].render();
      }
      return;
    }

    background(BOARD_INFO.color1);
    for (let i = 0; i < this.custom.btns.length; i++) {
      this.custom.btns[i].render();
    }

    myText("white", 55, 160, 25, color(240));
    myText("black", 335, 160, 25, color(20));

    stroke(BOARD_INFO.color2);
    strokeWeight(3);
    noFill();
    rect(10, 115, 480, 360, 10);
  },

  renderStandardMenu: function () {
    const color2 = BOARD_INFO.color2;
    background(BOARD_INFO.color1);
    stroke(color2);
    strokeWeight(5);
    line(250, 0, 250, 600);

    push(); /// KA
    translate(430, 530);
    rotate(cos(frameCount) * 10);
    image(RENDER.getPieceImage({ isWhite: true, name: "K" }), 0, 0, 150, 150);
    pop(); /// KA
    push(); /// KA
    translate(70, 530);
    rotate(cos(frameCount) * -10);
    image(RENDER.getPieceImage({ isWhite: true, name: "B" }), 0, 0, 150, 150);
    pop(); /// KA

    this.reusableBackBtn.render();
    for (let i = 0; i < this.standardBtns.length; i++) {
      this.standardBtns[i].render();
    }

    myText("easy", 40, 120, 45, color2);
    myText("hard", 295, 120, 45, color2);

    const whiteColor = color(255, 255, 255);
    myText("current streak:", 25, 370, 14, color2);
    myText("best streak:", 25, 395, 14, color2);
    myText("current streak:", 275, 370, 14, color2);
    myText("best streak:", 275, 395, 14, color2);
    myText(this.streak.easy[0] + "", 205, 370, 14, whiteColor);
    myText(this.streak.easy[1] + "", 170, 395, 14, whiteColor);
    myText(this.streak.hard[0] + "", 455, 370, 14, whiteColor);
    myText(this.streak.hard[1] + "", 420, 395, 14, whiteColor);
  },

  customClicked: function () {
    // choosing preset
    if (this.custom.isChoosingPreset) {
      for (let i = 0; i < this.custom.presetBtns.length; i++) {
        const b = this.custom.presetBtns[i];
        if (b.isHovered) {
          b.clicked();
          break;
        }
      }
      for (let i = 4; i < this.custom.btns.length; i++) {
        this.custom.btns[i].animateProgress = 0;
      }
      this.custom.btns[2].animateProgress = 1; // choose preset cancel click animation
      this.custom.isChoosingPreset = false;
      return;
    }

    for (let i = 0; i < this.custom.btns.length; i++) {
      const b = this.custom.btns[i];
      if (b.isHovered) return b.clicked();
    }
  },

  standardClicked: function () {
    // back button
    if (this.reusableBackBtn.isHovered) {
      return this.reusableBackBtn.clicked();
    }
    for (let i = 0; i < this.standardBtns.length; i++) {
      const b = this.standardBtns[i];
      if (b.isHovered) return b.clicked();
    }
  },

  menuClicked: function () {
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
