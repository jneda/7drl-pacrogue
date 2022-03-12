class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.direction = null;
    this.glyph = ['@', '#fdc253', '#212121'];
    this.draw();
  }

  draw() {
    Game.display.draw(this.x + displayOffsetX, this.y + displayOffsetY, ...this.glyph);
  }

  act() {
    Game.engine.lock();
    window.addEventListener('keydown', this);
  }

  handleEvent(event) {
    const keyMap = {
      Numpad8: 0,
      Numpad6: 2,
      Numpad2: 4,
      Numpad4: 6,
      ArrowUp: 0,
      ArrowRight: 2,
      ArrowDown: 4,
      ArrowLeft: 6,};

    const code = event.code;

    if (!(code in keyMap)) {
      return;
    }

    const direction = ROT.DIRS[8][keyMap[code]];
    const [dx, dy] = direction;
    const newX = this.x + dx;
    const newY = this.y + dy;
    const newKey = Game.toKey(newX, newY);

    if (!(newKey in Game.map) || Game.map[newKey] === 1) {
      return;
    }

    if (Game.pellets.indexOf(newKey) !== -1) {
      Game.pellets.splice(Game.pellets.indexOf(newKey), 1);
      Game.score++;
      console.log('score: ', Game.score);
    }

    // restore the empty tile display
    Game.drawMapAt(this.x, this.y);

    Game.updateActorKey(Game.toKey(this.x, this.y), newKey);

    this.direction = direction;

    this.x = newX;
    this.y = newY;
    this.draw();
    window.removeEventListener('keydown', this);
    Game.engine.unlock();
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getDirection() {
    return this.direction;
  }

  getOffsetTarget(offset) {
    // debug: draw direction with offset
    let [targetX, targetY] = [0, 0];
    const [dx, dy] = this.direction;
    while (!Game.isPassable(targetX, targetY)) {
      targetX = this.x + dx * offset;
      targetY = this.y + dy * offset;
      offset--;
    }

    return [targetX, targetY];
  }
}
