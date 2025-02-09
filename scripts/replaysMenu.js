// add new replay to the beginning
const COMMUNITY_REPLAYS = [
  {
    from: "logix indie",
    title: "custom 2nd",
    replay:
      "fgijijjijfihjfigeeefefeiihjjihiiefgegeidighfiiieidkejifeieififhfeiegegejifkhjjkhejekkeidjjhhhhjfekfkfkikkhjfkhijikjkjkjijfihihkgxiijiiggeijidefkehffeegejjfifkhekhhkgjkijfkkfikfidfehjixdeffedxeexkfixgixllmjxemjxgkxlhdgxhfl",
  },
  {
    from: "logix indie",
    title: "custom 1st",
    replay:
      "eifgeigkjjkjihkjeeegegfgihifjfkdegghfgfeifjfkdjfgkfjghfjkdkfkjjighdefefhjikhkfkhfhghdeghkfjgjfkhdegegehejfdfjgkhghfifikdjgiiiijkxdeegghgkifkffjjikdfhhefegekhjgiifidffdkdgdgghhhdegjkddxdeffedxeexjhexjdxlligxifdxiixlhlhxeie",
  },
  {
    from: "logix indie",
    title: "easy 6 is very good in my big opinion",
    replay:
      "eifgeihfjfihjfkefgeefgdgihjjiheheedgeeheehkhjjkhhehfheifjjijijiihfifhfiekejfkhiiifieifdkkhkkkkekdkjeiejeekegegfgiehddgfffgegegefxkeheehijhfdgiiifiekhdkjfegkkjefeefgdhdekfgkdeehfddgeedxdxdeximmxjhxhgdijxifkxhlxlhjexki",
  },
  {
    from: "logix indie",
    title: "easy 5",
    replay:
      "eifgeihfjfihjfkefgeefgdgihjjiheheedgeeheehkhjjkhhehfheifjjijijiihfifhfiekejfkhiiifieifdkkhkkkkekdkjeiejeekegegfgiehddgfffgegegefxkeheehijhfdgiiifiekhdkjfegkkjefeefgdhdekfgkdeehfddgeedxdxdeximmxjhxhgdijxifkxhlxlhjexki",
  },
  {
    from: "logix indie",
    title: "easy 4",
    replay:
      "eifgeihfjfihjfkefgeefgdgihjjiheheedgeeheehkhjjkhhehfheifjjijijiihfifhfiekejfkhiiifieifdkkhkkkkekdkjeiejeekegegfgiehddgfffgegegefxkeheehijhfdgiiifiekhdkjfegkkjefeefgdhdekfgkdeehfddgeedxdxdeximmxjhxhgdijxifkxhlxlhjexki",
  },
  {
    from: "logix indie",
    title: "easy 3 lost",
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
  hasLoaded: false,
  btns: [],
  category: "EASY", // EASY, HARD, CUSTOM
  sortBy: "RECENT", // RECENT, SCORE, TIME
  isAtCommunity: true,
  hoveredReplayIndex: null,
  paging: {
    doNotReset: false,
    index: 0,
    length: 3,
    isGoingUp: false,
    progress: 1,
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

  setViewingReplays: function () {
    // do not reset as was just watching a replay
    if (this.paging.doNotReset) {
      this.paging.doNotReset = false;
      return;
    }
    const category = this.replays[this.category];
    this.viewingReplays = this.isAtCommunity
      ? category.community
      : category.personal;

    // set to sort by recent if is custom game
    if (this.category === "CUSTOM") this.sortBy = "RECENT";
    else if (this.sortBy === "SCORE") {
      this.viewingReplays.sort(function (rep1, rep2) {
        const rep1IsWhite = rep1.replay[3][0] === "0";
        const rep2IsWhite = rep2.replay[3][0] === "0";
        const rep1Won = rep1IsWhite
          ? rep1.replay[5] > rep1.replay[8]
          : rep1.replay[5] < rep1.replay[8];
        const rep2Won = rep1IsWhite
          ? rep2.replay[5] > rep2.replay[8]
          : rep2.replay[5] < rep2.replay[8];
        if (!rep1Won) return 1;
        if (!rep2Won) return -1;
        return (
          (rep2IsWhite ? rep2.replay[5] : rep2.replay[8]) -
          (rep1IsWhite ? rep1.replay[5] : rep1.replay[8])
        );
      });
    } else if (this.sortBy === "TIME") {
      this.viewingReplays.sort(function (rep1, rep2) {
        const rep1IsWhite = rep1.replay[3][0] === "0";
        const rep2IsWhite = rep2.replay[3][0] === "0";
        const rep1Won = rep1IsWhite
          ? rep1.replay[5] > rep1.replay[8]
          : rep1.replay[5] < rep1.replay[8];
        const rep2Won = rep1IsWhite
          ? rep2.replay[5] > rep2.replay[8]
          : rep2.replay[5] < rep2.replay[8];
        if (!rep1Won) return 1;
        if (!rep2Won) return -1;
        return (
          (rep1IsWhite ? rep1.replay[6] : rep1.replay[9]) -
          (rep2IsWhite ? rep2.replay[6] : rep2.replay[9])
        );
      });
    }

    this.paging.index = 0;
    this.paging.length = max(1, ceil(this.viewingReplays.length / 4));
  },

  initializeScene: function () {
    if (this.hasLoaded) {
      this.setViewingReplays();
      return;
    }

    /// unpack personal replays from local

    // unpack community replays (convert string into array of numStrings)
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
    this.hoveredReplayIndex = null; // reset hover
    const { color1, color2 } = BOARD_INFO;
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
    rect(455, 205, 10, 230, 4); // empty bar
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
      205 + segLength * paging.index + animatedYOffset,
      10,
      segLength,
      4
    );

    // 'no replay' message
    if (this.viewingReplays.length === 0) {
      myText("no replays found.", 100, 330, 18, color2);
    }
    // render replay cards
    else {
      const replayItems = this.viewingReplays.slice(
        paging.index * 4,
        paging.index * 4 + 4
      );
      const allNames = ["-player-", "easy bot", "", "hard bot"];
      const whiteColor = color(240);
      const blackColor = color(20);
      const mouseXIsWithin = _mouseX > 50 && _mouseX < 410;
      for (let i = 0; i < replayItems.length; i++) {
        const item = replayItems[i];
        const yValue = 130 + i * 98;

        let frameColor = color2;

        const isHovered =
          mouseXIsWithin && _mouseY > yValue && _mouseY < yValue + 85;
        if (isHovered) {
          this.hoveredReplayIndex = i;
          frameColor = lerpColor(frameColor, color(0), 0.3);
          cursor(HAND);
        }

        // frame
        strokeWeight(3);
        noFill();
        stroke(frameColor);
        rect(50, yValue, 360, 85);
        noStroke();
        fill(frameColor);
        rect(50, yValue, 360, 38);

        // title & from
        myText(item.title, 58, yValue + 16, 10, color1);
        myText("from " + item.from, 58, yValue + 32, 10, color1);

        // white score
        myText(item.replay[5] + "", 70, yValue + 70, 26, whiteColor);
        // white name
        myText(
          allNames[Number(item.replay[3][0])],
          125,
          yValue + 57,
          12,
          whiteColor
        );
        // white time
        const wTotalTime = item.replay[6];
        const wTimeSec = floor((wTotalTime % 60000) / 1000) + "";
        myText(
          floor(wTotalTime / 60000) +
            ":" +
            (wTimeSec.length === 1 ? "0" : "") +
            wTimeSec,
          125,
          yValue + 77,
          12,
          whiteColor
        );

        // black score
        myText(item.replay[8] + "", 250, yValue + 70, 26, blackColor);
        // black name
        myText(
          allNames[Number(item.replay[3][1])],
          305,
          yValue + 57,
          12,
          blackColor
        );
        // black time
        const bTotalTime = item.replay[9];
        const bTimeSec = floor((bTotalTime % 60000) / 1000) + "";
        myText(
          floor(bTotalTime / 60000) +
            ":" +
            (bTimeSec.length === 1 ? "0" : "") +
            bTimeSec,
          305,
          yValue + 77,
          12,
          blackColor
        );
      }
    }
  },
  clicked: function () {
    // button clicked
    for (let i = 0; i < this.btns.length; i++) {
      const b = this.btns[i];
      if (b.isHovered) return b.clicked();
    }

    // replay clicked
    if (this.hoveredReplayIndex !== null) {
      this.paging.doNotReset = true;
      const replayItems = this.viewingReplays.slice(
        this.paging.index * 4,
        this.paging.index * 4 + 4
      );
      REPLAYSYS.loadReplay(replayItems[this.hoveredReplayIndex].replay);
    }
  },
};
