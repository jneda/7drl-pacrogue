class IsGameOver {
  act() {
    if (Game.pellets.length === 0) {
      Game.engine.lock();
      Game.levelWon();
      window.addEventListener('keydown', this);
    }

    if (Game.playerCaptured) {
      Game.engine.lock();
      Game.levelLost();
      window.addEventListener('keydown', this);
    }
  }

  handleEvent(event) {
    console.log(this);
    window.removeEventListener('keydown', this);
    Game.display.clear();
    Game.startNewMap();
  }
}
