const REPLAYS_MENU = {
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
