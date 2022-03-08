class Pedro {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.glyph = ['\u03a9', '#ec5f67', '#15171c'];
    this.draw();
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  draw() {
    Game.display.draw(this.x, this.y, ...this.glyph);
  }

  act() {
    const [x, y] = [Game.player.getX(), Game.player.getY()];
    const isPassable = function (x, y) {
      const tileKey = Game.toKey(x, y);

      const isInBounds = tileKey in Game.map;
      const isNotWall = Game.map[tileKey] !== 1;
      return isInBounds && isNotWall;
    };

    const astar = new ROT.Path.AStar(x, y, isPassable, { topology: 4 });
    // console.dir(astar);
    const path = [];
    const getPath = function (x, y) {
      path.push([x, y]);

      //   // DEBUG: display path
      //   console.log('drawing tile');
      //   Game.display.drawOver(x, y, null, null, '#88e985');
    };
    astar.compute(this.x, this.y, getPath);
    path.shift(); // remove Pedro's position
    // console.log(path);

    if (path.length < 2) {
      Game.engine.lock();
      this.draw();
      alert('Game over - you were captured by Pedro!');
    } else {
      const [x, y] = path[0];
      const destinationKey = Game.toKey(x, y);

      if (Game.hasActor(destinationKey)) {
        return;
      }

      // // DEBUG: display path
      // Game.display.drawOver(x, y, null, null, '#ec5f67');
      // setTimeout(function () {}, 1000);

      const originKey = Game.toKey(this.x, this.y);
      const tileGlyph = Glyphs[Game.map[originKey]];
      Game.display.draw(this.x, this.y, ...tileGlyph);

      Game.updateActorKey(originKey, destinationKey);

      this.x = x;
      this.y = y;
      this.draw();
    }
  }
}
