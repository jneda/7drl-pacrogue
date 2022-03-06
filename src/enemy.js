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
    const thisKey = Game.getActorKey(this);

    const isPassable = function (x, y) {
      const tileKey = Game.toKey(x, y);
      let hasActor = false;
      if (tileKey !== thisKey) {
        // do not check the enemy's own tile else pathfinding fails
        hasActor = Game.actorKeys.indexOf(tileKey) >= 0;
      }
      const isInBounds = tileKey in Game.map;
      const isNotWall = Game.map[tileKey] !== 1;
      return isInBounds && isNotWall && !hasActor;
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
      const destinationKey = path[0];

      const originKey = Game.toKey(this.x, this.y);
      const tileGlyph = Glyphs[Game.map[originKey]];
      Game.display.draw(this.x, this.y, ...tileGlyph);

      Game.updateActorKey(originKey, destinationKey);

      const [x, y] = destinationKey;
      this.x = x;
      this.y = y;
      this.draw();
    }
  }
}
