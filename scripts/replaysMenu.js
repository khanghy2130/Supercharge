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

  render: function () {
    background(BOARD_INFO.color1);
    for (let i = 0; i < this.btns.length; i++) {
      this.btns[i].render();
    }
  },
  clicked: function () {
    // button clicked
    for (let i = 0; i < this.btns.length; i++) {
      const b = this.btns[i];
      if (b.isHovered) return b.clicked();
    }
  },
};
