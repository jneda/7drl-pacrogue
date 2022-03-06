class Player {
  constructor (x, y) {
    this.x = x;
    this.y = y;
    this.glyph = ['@', '#fdc253', '#15171c'];
    this.draw();
  }

  draw  () {
    Game.display.draw(this.x, this.y, ...this.glyph);
  }

  act () {
    Game.engine.lock();
    window.addEventListener('keydown', this);
  }

  handleEvent (event) {
    const keyMap = {
      Numpad8: 0,
      Numpad9: 1,
      Numpad6: 2,
      Numpad3: 3,
      Numpad2: 4,
      Numpad1: 5,
      Numpad4: 6,
      Numpad7: 7,
    }

    const code = event.code;
    // console.log(code);

    if (code === 'Enter' || code === 'NumpadEnter' || code === 'Space') {
      this.checkBox();
      return;
    }

    if (!(code in keyMap)) {
      return;
    }

    const [dx, dy] = ROT.DIRS[8][keyMap[code]];
    const newX = this.x + dx;
    const newY = this.y + dy;
    const newKey = newX + ',' + newY;

    if (!(newKey in Game.map) || Game.map[newKey] === 1) {
      return;
    }

    const tileKey = Game.toKey(this.x, this.y);
    const tileGlyph = Glyphs[Game.map[tileKey]];
    Game.display.draw(this.x, this.y, ...tileGlyph);
    this.x = newX;
    this.y = newY;
    this.draw();
    window.removeEventListener('keydown', this);
    Game.engine.unlock();
  }

  checkBox () {
    const tileKey = Game.toKey(this.x, this.y);
    if (Game.map[tileKey] !== 2) {
      alert('There is no box here!');
    } else if (tileKey === Game.ananas) {
      alert('Horray! You found an ananas and won this game.');
      Game.engine.lock();
      window.removeEventListener('keydown', this);
    } else {
      alert('This box is empty. :-(');
    }
  }

  getX () {
    return this.x;
  };

  getY () {
    return this.y;
  }

}
