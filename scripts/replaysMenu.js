const COMMUNITY_REPLAYS = [];
const MY_REPLAYS = [];

const REPLAYS_MENU = {
  replays: {
    // comReplay: {username, title, replay}
    EASY: {
      myReplays: [],
      comReplays: [],
    },
    HARD: {
      myReplays: [],
      comReplays: [],
    },
    CUSTOM: {
      myReplays: [],
      comReplays: [],
    },
  },
  category: "EASY", // EASY, HARD, CUSTOM
  btns: [],
  isAtCommunity: true,
  sortBy: "RECENT", // RECENT, SCORE, TIME

  setIsAtCommunity: function (bool) {
    if (this.isAtCommunity === bool) return;
    this.isAtCommunity = bool;

    /// change tab
  },
  setSortBy: function (val) {
    if (this.sortBy === val) return;
    this.sortBy = val;
    /// change sort
  },

  render: function () {
    background(BOARD_INFO.color1);
    // buttons
    for (let i = 0; i < this.btns.length; i++) {
      this.btns[i].render();
    }
    myText("sort by", 60, 98, 16, BOARD_INFO.color2);
  },
  clicked: function () {
    // button clicked
    for (let i = 0; i < this.btns.length; i++) {
      const b = this.btns[i];
      if (b.isHovered) return b.clicked();
    }
  },
};
