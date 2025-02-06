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

  render: function () {
    background(BOARD_INFO.color1);
    MENU.reusableBackBtn.render();
  },
  clicked: function () {
    // back button
    if (MENU.reusableBackBtn.isHovered) {
      return MENU.reusableBackBtn.clicked();
    }
  },
};
