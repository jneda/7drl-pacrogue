class Pedro {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.glyph = ['\u03a9', '#ec5f67', '#15171c'];
    this.draw();
  }

  draw() {
    Game.display.draw(this.x, this.y, ...this.glyph);
  }

  act() {
    const [x, y] = [Game.player.getX(), Game.player.getY()];

    const isPassable = function (x, y) {
      const tileKey = Game.toKey(x, y);
      return tileKey in Game.map && Game.map[tileKey] !== 1;
    };

    const astar = new ROT.Path.AStar(x, y, isPassable, { topology: 4 });

    const path = [];
    const getPath = function (x, y) {
      path.push([x, y]);
    };
    astar.compute(this.x, this.y, getPath);
    path.shift(); // remove Pedro's position
    // console.log(path);

    if (path.length <= 1) {
      Game.engine.lock();
      alert('Game over - you were captured by Pedro!');
      this.draw();
    } else {
      const [x, y] = path[0];
      const tileKey = Game.toKey(this.x, this.y);
      const tileGlyph = Glyphs[Game.map[tileKey]];
      Game.display.draw(this.x, this.y, ...tileGlyph);
      this.x = x;
      this.y = y;
      this.draw();
    }
  }
}
