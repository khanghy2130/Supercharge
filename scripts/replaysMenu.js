// add new replay to the beginning
const COMMUNITY_REPLAYS = [
  {
    from: "logix indie",
    title: "easy 8",
    replay:
      "eifgfgeejjgjihgjfgjgeefgihjhgjhkjgfgjghhjhkhhkkhhhfifgfhhkikjfkhfhfifhefjfgiikfkfieifiejgiegegdfeiefeigjfkjkkhigefgfgfhfighejkjjxjhejikefgjhkfkhhjggifiegdfgjhehfjkfhhgkijjkkjiighijfgfxdxdexkdmxjexglgklxmfxigxlflmxhmd",
  },
  {
    from: "logix indie",
    title: "easy 7",
    replay:
      "eifgfgeejfihjfekeiggfgffihhjjjjgggffffeejgjejeeeffdejekdeeehehekgggfgfffekehekfjdeffdeddehfhfhfjffhgdddffhhfhjfkhgjfjfihfjijhfigxekdeffjegghjfjjgkdddgfehfhhgfkjgijhfidgdihjfkkdfigekgixmxdexijhxjhxegffidxfkhxhhxlflexgli",
  },
  {
    from: "logix indie",
    title: "easy 6",
    replay:
      "eifgeidhjjjfjfjhfgeefgggjhihjhgegghghghkihikikifhkfkfkfdifijijgjfdededeegeegegdfdhgeedgegjgfgfefeefeedfedffdjjihgeedgeiefdhfefhfxgeikdhhkfkgggjdfifjdfdkjieefjeedhfjhekijhkkiihehhieidgxixedxijgxghxllijxheexflxlgdlkxgfj",
  },
  {
    from: "logix indie",
    title: "easy 5",
    replay:
      "fgefefdgjfihjfigeidgdgeeihjjihijdghghghjijigijghhjgjeegfghfgigfggffdgjjjgjikigekeidhdhffikkjfgkgjjjhjhkhekigkgigkhkikiiiigegegefxigikdgekijefghhjhggjfdkjkikgkhiidhefdjjhffkfejkdijjghexdxdexjmfxgkxfdmfixejixijxlgjkxjg",
  },
  {
    from: "logix indie",
    title: "easy 4",
    replay:
      "eeeifghejfihjfhdeiefefffjjgjgjkjffifheifkjkkihgihejeifjehdegeggieedgifjfegdigihhjfjgjgjehhkkhhihjgkhjeiedifhihfhieigigggihjjfhfexkkhegjhddgkjefffgijfdijeeghhggihedkhiefegegfkfjjkgiieixgxdexjhdxhmxmkiikxfkkxgmxlgfjxj",
  },
  {
    from: "logix indie",
    title: "easy 3",
    replay:
      "eifgeidhihgjjjgjfgdhfgdegjgkgkggeedeeedfgggegehededfdeefjfhejfhfefijdhfihfhghghefihhhhijhgiijjiihhgiijgijjkhhehiijhkhkgjhiiihijkxgkdfdhdehfgehhggijkhiiefgigjfijdedgefhhkfjjkkkieighjifxkxedxjhfxjexlljlxiffxiexkmdgmxkg",
  },
  {
    from: "logix indie",
    title: "easy 2",
    replay:
      "eifgeidhjfihjfhhfgdhfgheihjjihkhdhejheifjjkhjjjiifghghjkkhiijiiieedejkdejiikhhigjkkkejgiiiigiiggkkjkdejkgghfhfgededdddidgeiggejexikjihhdhkhhejkifejgeghkkggigidgjddehgijefkdjfihfhkiihixmxedxjmfxhlxlkmmxhmiximxifkgfxehd",
  },
  {
    from: "logix indie",
    title: "easy 1",
    replay:
      "eifgeigkihgjjjgjfgeefgfejjikikgifefgeefggjgigjjgeededehejfhghggihekekekfhggggggikfkhkhfhjggdggfigkfjfhjhgiiiiijijhihihidjifijikgxgkikkffedegjhegdfijgggkhjikefhhgidfjiifddjkikgkegjkjefxhxedxjlexhixekjldxjiixiexllgfjxhkk",
  },
];

const REPLAYS_MENU = {
  // list of raw replay data (string) /// nKA
  // when finish a game, add rawStr into this. (beside add to this.replay)
  // when delete a replay, filter. (beside remove in this.replays)
  // after add or delete, save to local
  personalRawReplays: [],

  hasLoaded: false,
  btns: [],
  category: "EASY", // EASY, HARD, CUSTOM
  sortBy: "RECENT", // RECENT, SCORE, TIME
  isAtCommunity: true,
  paging: {
    doNotReset: false,
    index: 0,
    length: 3,
    isGoingUp: false,
    progress: 1,
    cards: [],
  },
  // sorted by recent, contains replay{title, from, replay(first 4 are numStrings, rest are numbers)}
  replays: {
    EASY: {
      personal: [],
      community: [],
    },
    HARD: {
      personal: [],
      community: [],
    },
    CUSTOM: {
      personal: [],
      community: [],
    },
  },
  viewingReplays: null,
  alert: {
    text: "sample text",
    progress: 1,
  },
  submit: {
    isShown: false,
    bgImage: null,
    msgIndex: 0,
  },

  setIsAtCommunity: function (bool) {
    if (this.isAtCommunity === bool) return;
    this.isAtCommunity = bool;
    this.setViewingReplays();
  },
  setSortBy: function (val) {
    if (this.sortBy === val) return;
    this.sortBy = val;
    this.setViewingReplays();
  },

  unpackReplayStr(replayStr) {
    const arr = replayStr.split("x").map(function (item) {
      return item
        .split("")
        .map((char) => char.charCodeAt(0) - 100)
        .join("");
    });
    for (let i = 4; i < arr.length; i++) {
      arr[i] = Number(arr[i]);
    }
    return arr;
  },

  getRawStr: function (arr) {
    return arr
      .map(function (str) {
        if (typeof str === "number") str = str.toString();
        return str
          .split("")
          .map((num) => String.fromCharCode(100 + Number(num)))
          .join("");
      })
      .join("x");
  },

  setViewingReplays: function () {
    // do not reset as was just watching a replay
    if (this.paging.doNotReset) {
      this.paging.doNotReset = false;
      return;
    }
    const category = this.replays[this.category];
    this.viewingReplays = this.isAtCommunity
      ? category.community.slice()
      : category.personal.slice();

    // set to sort by recent if is custom game
    if (this.category === "CUSTOM") this.sortBy = "RECENT";
    else if (this.sortBy === "SCORE") {
      this.viewingReplays.sort(function (rep1, rep2) {
        const rep1IsWhite = rep1.replay[3][0] === "0";
        const rep2IsWhite = rep2.replay[3][0] === "0";

        let rep1Score = rep1IsWhite ? rep1.replay[5] : rep1.replay[8];
        // amplify if won
        if (
          rep1IsWhite
            ? rep1.replay[5] > rep1.replay[8]
            : rep1.replay[5] < rep1.replay[8]
        ) {
          rep1Score += 500;
        }

        let rep2Score = rep2IsWhite ? rep2.replay[5] : rep2.replay[8];
        // amplify if won
        if (
          rep2IsWhite
            ? rep2.replay[5] > rep2.replay[8]
            : rep2.replay[5] < rep2.replay[8]
        ) {
          rep2Score += 500;
        }

        // decreasing
        return rep2Score - rep1Score;
      });
    } else if (this.sortBy === "TIME") {
      this.viewingReplays.sort(function (rep1, rep2) {
        const rep1IsWhite = rep1.replay[3][0] === "0";
        const rep2IsWhite = rep2.replay[3][0] === "0";

        let rep1Time = rep1IsWhite ? rep1.replay[6] : rep1.replay[9];
        // amplify if lost
        if (
          !(rep1IsWhite
            ? rep1.replay[5] > rep1.replay[8]
            : rep1.replay[5] < rep1.replay[8])
        ) {
          rep1Time += 100000000;
        }

        let rep2Time = rep2IsWhite ? rep2.replay[6] : rep2.replay[9];
        if (
          !(rep2IsWhite
            ? rep2.replay[5] > rep2.replay[8]
            : rep2.replay[5] < rep2.replay[8])
        ) {
          rep2Time += 100000000;
        }

        // increasing
        return rep1Time - rep2Time;
      });
    }

    this.paging.index = 0;
    this.paging.length = max(1, ceil(this.viewingReplays.length / 4));
    this.setCards();
  },

  setCards: function () {
    this.paging.cards = this.viewingReplays
      .slice(this.paging.index * 4, this.paging.index * 4 + 4)
      .map(this.createCard);
  },
  createCard: function (item) {
    // create card image
    const allNames = ["player", "easy bot", "", "hard bot"];
    const whiteColor = color(240);
    const blackColor = color(20);
    const frameColor = BOARD_INFO.color2;
    const color1 = BOARD_INFO.color1;

    background(color1);

    // result mark (if player vs bot)
    const botCodeWhite = item.replay[3][0];
    const botCodeBlack = item.replay[3][1];
    if (
      (botCodeWhite === "0" && botCodeBlack !== "0") ||
      (botCodeWhite !== "0" && botCodeBlack === "0")
    ) {
      const wScore = item.replay[5];
      const bScore = item.replay[8];
      if (wScore === bScore) {
        fill(250, 100, 220);
      } else if (
        (botCodeWhite === "0" && wScore > bScore) ||
        (botCodeBlack === "0" && bScore > wScore)
      ) {
        fill(100, 245, 100);
      } else {
        fill(240, 80, 80);
      }
      noStroke();
      triangle(410, 215, 390, 215, 410, 195);
    }

    // frame
    strokeWeight(6);
    noFill();
    stroke(frameColor);
    rect(50, 130, 360, 85);
    noStroke();
    fill(frameColor);
    rect(50, 130, 360, 38);

    // title & from
    myText(item.title, 58, 146, 10, color1);
    myText("from " + item.from, 58, 162, 10, color1);

    // white score
    myText(item.replay[5] + "", 70, 200, 26, whiteColor);
    // white name
    const wName = allNames[Number(item.replay[3][0])];
    myText(wName, 125, 187, 12, whiteColor);
    if (wName === "player") {
      stroke(whiteColor);
      strokeWeight(2);
      line(125, 190, 185, 190);
    }
    // white time
    const wTotalTime = item.replay[6];
    const wTimeSec = floor((wTotalTime % 60000) / 1000) + "";
    myText(
      floor(wTotalTime / 60000) +
        ":" +
        (wTimeSec.length === 1 ? "0" : "") +
        wTimeSec,
      125,
      207,
      12,
      whiteColor
    );

    // black score
    myText(item.replay[8] + "", 250, 200, 26, blackColor);
    // black name
    const bName = allNames[Number(item.replay[3][1])];
    myText(bName, 305, 187, 12, blackColor);
    if (bName === "player") {
      stroke(blackColor);
      strokeWeight(2);
      line(305, 190, 365, 190);
    }
    // black time
    const bTotalTime = item.replay[9];
    const bTimeSec = floor((bTotalTime % 60000) / 1000) + "";
    myText(
      floor(bTotalTime / 60000) +
        ":" +
        (bTimeSec.length === 1 ? "0" : "") +
        bTimeSec,
      305,
      207,
      12,
      blackColor
    );

    return {
      image: get(50, 130, 360, 85),
      title: item.title,
      from: item.from,
      replay: item.replay,
      isHovered: false,
      progress: 0,
      hoveredBtn: null, // "COPY" "DELETE"
    };
  },

  initializeScene: function () {
    if (this.hasLoaded) {
      this.setViewingReplays();
      return;
    }

    // unpack personal replays
    const localPRR = localStorage.getItem("personalRawReplays");
    this.personalRawReplays =
      typeof localPRR === "string" && localPRR.length !== 0
        ? localPRR.split("_")
        : [];

    for (let i = 0; i < this.personalRawReplays.length; i++) {
      const arr = this.unpackReplayStr(this.personalRawReplays[i]);
      let category;
      // standard
      if (arr[2].length === 1) {
        const botCode = arr[3];
        if (botCode[0] === "3" || botCode[1] === "3") {
          category = this.replays.HARD;
        } else category = this.replays.EASY;
      }
      // custom
      else category = this.replays.CUSTOM;
      category.personal.push({
        replay: arr,
        title: "untitled",
        from: "you",
      });
    }

    // unpack community replays
    const CRS = COMMUNITY_REPLAYS;
    for (let i = 0; i < CRS.length; i++) {
      const CR = CRS[i];
      CR.replay = this.unpackReplayStr(CR.replay);
      let category;
      // standard
      if (CR.replay[2].length === 1) {
        const botCode = CR.replay[3];
        if (botCode[0] === "3" || botCode[1] === "3") {
          category = this.replays.HARD;
        } else category = this.replays.EASY;
      }
      // custom
      else category = this.replays.CUSTOM;
      category.community.push(CR);
    }

    this.setViewingReplays();
    this.hasLoaded = true;
  },

  render: function () {
    const { color1, color2 } = BOARD_INFO;

    // submit modal
    if (this.submit.isShown) {
      const s = this.submit;
      image(s.bgImg, 250, 300, 500, 600);

      const msg =
        "if you would like to share your\nreplays for other players to see,\nplease copy the replay data and\nshare it with me. also tell me if\nyou have a name for the replay.";
      if (s.msgIndex < msg.length) s.msgIndex += 2;
      myText(msg.substring(0, s.msgIndex), 30, 220, 16, color(240));

      myText("click anywhere to close", 130, 525, 12, color(180));

      return;
    }

    background(color1);
    // buttons
    for (let i = 0; i < 6; i++) {
      this.btns[i].render();
    }

    // sort render if is not at custom
    if (this.category !== "CUSTOM") {
      myText("sort by", 60, 98, 16, color2);
      for (let i = 6; i < 9; i++) {
        this.btns[i].render();
      }
    }

    // page progress
    const paging = this.paging;
    stroke(color2);
    strokeWeight(3);
    noFill();
    rect(455, 202, 10, 230, 4); // empty bar
    noStroke();
    fill(color2);

    const segLength = 230 / paging.length;
    paging.progress = min(1, paging.progress + 0.04);
    const animatedYOffset =
      (1 - RENDER.easeOutExpo(paging.progress)) *
      segLength *
      (paging.isGoingUp ? 1 : -1);
    rect(
      455,
      202 + segLength * paging.index + animatedYOffset,
      10,
      segLength,
      4
    );

    // render alert text
    if (this.alert.progress < 1) {
      this.alert.progress += 0.007;
      noStroke();
      fill(0, 220);
      rect(0, 0, 500, 45);
      myText(this.alert.text, 20, 30, 15, color1);
    }

    // 'no replay' message
    if (this.viewingReplays.length === 0) {
      myText("no replays found.", 100, 330, 18, color2);
    }
    // render replay cards
    else {
      const cards = this.paging.cards;
      const eoe = RENDER.easeOutElastic;
      const mouseXIsWithin = _mouseX > 50 && _mouseX < 410;
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        card.progress = min(1, card.progress + 0.02);

        const yValue = 130 + i * 98;
        if (mouseXIsWithin && _mouseY > yValue && _mouseY < yValue + 85) {
          if (!card.isHovered) {
            card.progress = 0; // initial hover
          }
          card.isHovered = true;
          cursor(HAND);
        } else {
          card.isHovered = false; // not hovered
        }

        push(); /// KA
        translate(230, yValue + 42);

        if (!this.isAtCommunity) {
          card.hoveredBtn = null;
          noStroke();

          // copy button
          if (dist(_mouseX, _mouseY, 230 - 205, yValue + 22) < 15) {
            fill(lerpColor(color2, color(0), 0.3));
            cursor(HAND);
            card.hoveredBtn = "COPY";
          } else fill(color2);
          ellipse(-205, -20, 30, 30);
          fill(color1);
          triangle(-205, -10, -213, -18, -197, -18);
          rect(-207, -28, 4, 12);

          // delete button
          if (dist(_mouseX, _mouseY, 230 - 205, yValue + 62) < 15) {
            fill(lerpColor(color2, color(0), 0.3));
            cursor(HAND);
            card.hoveredBtn = "DELETE";
          } else fill(color2);
          ellipse(-205, 20, 30, 30);
          fill(color1);
          quad(-199.5, 28.5, -196.5, 25.5, -210.5, 11.5, -213.5, 14.5);
          quad(-210.5, 28.5, -213.5, 25.5, -199.5, 11.5, -196.5, 14.5);
        }

        if (card.progress < 0.08) card.progress = 0.08;
        else if (card.progress > 0.4) card.progress = 1;
        let scaleFactor = eoe(card.progress);
        scaleFactor *= 0.2; // animated range
        scale(0.8 + scaleFactor, 1.2 - scaleFactor); // 1 - or + range
        image(card.image, 0, 0, 360, 85);
        pop(); /// KA
      }
    }
  },
  clicked: function () {
    // submit close
    if (this.submit.isShown) {
      this.btns[0].animateProgress = 1; // reset animation for submit button
      this.submit.isShown = false;
      return;
    }

    // button clicked
    for (let i = 0; i < this.btns.length; i++) {
      const b = this.btns[i];
      if (b.isHovered) return b.clicked();
    }

    // card clicked or card button clicked
    const cards = this.paging.cards;
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (card.isHovered) {
        REPLAYSYS.loadReplay(card.replay);
        return;
      }
      if (card.hoveredBtn !== null) {
        const getRawStr = this.getRawStr;
        const cardRawStr = getRawStr(card.replay);
        if (card.hoveredBtn === "COPY") {
          /// KA
          this.alert.text = "copied data to clipboard!";
          this.alert.progress = 0;
          /// KA
          navigator.clipboard.writeText("begin_" + cardRawStr + "_end");
          return;
        }
        if (card.hoveredBtn === "DELETE") {
          this.alert.text = "deleted replay.";
          this.alert.progress = 0;

          // remove from personalRawReplays /// nKA
          this.personalRawReplays = this.personalRawReplays.filter(function (
            rawStr
          ) {
            return rawStr !== cardRawStr;
          });
          localStorage.setItem(
            "personalRawReplays",
            this.personalRawReplays.join("_")
          );

          // remove from this.replays
          const category = this.replays[this.category];
          category.personal = category.personal.filter(function (item) {
            return getRawStr(item.replay) !== cardRawStr;
          });
          this.setViewingReplays();

          return;
        }
      }
    }
  },
};
