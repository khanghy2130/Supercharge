const SCENE_CONTROL = {
  isClosing: false,
  progress: 1,
  // scenes: MENU, STANDARD, CUSTOM, REPLAYS, PLAY
  targetScene: "MENU",
  currentScene: "MENU",

  changeScene: function (targetScene) {
    this.targetScene = targetScene;
    this.isClosing = true;
    this.progress = 0;
  },
};
