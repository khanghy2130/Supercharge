const COMMUNITY_REPLAYS = [
  {
    from: "logix indie",
    title: "custom 1st",
    replay:
      "eifgeigkjjkjihkjeeegegfgihifjfkdegghfgfeifjfkdjfgkfjghfjkdkfkjjighdefefhjikhkfkhfhghdeghkfjgjfkhdegegehejfdfjgkhghfifikdjgiiiijkxdeegghgkifkffjjikdfhhefegekhjgiifidffdkdgdgghhhdegjkddxdeffedxeexjhexjdxlligxifdxiixlhlhxeie",
  },
  {
    from: "logix indie",
    title: "custom 2nd",
    replay:
      "fgijijjijfihjfigeeefefeiihjjihiiefgegeidighfiiieidkejifeieififhfeiegegejifkhjjkhejekkeidjjhhhhjfekfkfkikkhjfkhijikjkjkjijfihihkgxiijiiggeijidefkehffeegejjfifkhekhhkgjkijfkkfikfidfehjixdeffedxeexkfixgixllmjxemjxgkxlhdgxhfl",
  },
  {
    from: "logix indie",
    title: "easy 1st",
    replay:
      "eifgeihfjfihjfkefgeefgdgihjjiheheedgeeheehkhjjkhhehfheifjjijijiihfifhfiekejfkhiiifieifdkkhkkkkekdkjeiejeekegegfgiehddgfffgegegefxkeheehijhfdgiiifiekhdkjfegkkjefeefgdhdekfgkdeehfddgeedxdxdeximmxjhxhgdijxifkxhlxlhjexki",
  },
];

const REPLAYS_MENU = {
  hasLoaded: false,
  btns: [],
  category: "EASY", // EASY, HARD, CUSTOM
  sortBy: "RECENT", // RECENT, SCORE, TIME
  isAtCommunity: true,
  paging: {
    index: 0,
    length: 3,
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
    //// set paging length after deciding how many replays to show at once (maybe 4)
  },

  initializeScene: function () {
    if (this.hasLoaded) {
      this.isAtCommunity = true;
      this.sortBy = "RECENT";
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
    background(BOARD_INFO.color1);
    // buttons
    for (let i = 0; i < 6; i++) {
      this.btns[i].render();
    }

    // sort render if is not at custom
    if (this.category !== "CUSTOM") {
      myText("sort by", 60, 98, 16, BOARD_INFO.color2);
      for (let i = 6; i < 9; i++) {
        this.btns[i].render();
      }
    }

    // 'no replay' message
    if (this.viewingReplays.length === 0) {
      myText("no replays found.", 90, 300, 18, BOARD_INFO.color2);
    }

    // page progress
    stroke(BOARD_INFO.color2);
    strokeWeight(3);
    noFill();
    rect(455, 205, 10, 230, 4); // empty bar
    noStroke();
    fill(BOARD_INFO.color2);
    const segLength = 230 / this.paging.length;
    rect(455, 205 + segLength * this.paging.index, 10, segLength, 4);
  },
  clicked: function () {
    // button clicked
    for (let i = 0; i < this.btns.length; i++) {
      const b = this.btns[i];
      if (b.isHovered) return b.clicked();
    }
  },
};
