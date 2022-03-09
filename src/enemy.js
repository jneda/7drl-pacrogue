class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.direction = null;
    this.glyph = ['\u03a9', '#ec5f67', '#15171c'];
    // this.draw();
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
    // // go for the player's position
    // const [x, y] = [Game.player.getX(), Game.player.getY()];

    // // go for a tile further up the player's direction of travel
    // const [x, y] = Game.player.getOffsetTarget();
    const [x, y] = this.setTarget();

    // set up ROT AStar pathfinding
    const isPassable = function (x, y) {
      const tileIsEmpty = Game.isPassable(x, y);

      const tileBehind = this.getTileBehind();
      let tileIsBehind = false;
      if (tileBehind !== null) {
        tileIsBehind = x === tileBehind.x && y === tileBehind.y;
      }

      return tileIsEmpty && !tileIsBehind;
    }.bind(this);
    const astar = new ROT.Path.AStar(x, y, isPassable, { topology: 4 });
    // console.dir(astar);
    const path = [];
    const getPath = function (x, y) {
      path.push([x, y]);

      //   // DEBUG: display path
      //   console.log('drawing tile');
      // Game.display.drawOver(x, y, null, null, '#88e985');
    };
    astar.compute(this.x, this.y, getPath);
    path.shift(); // remove Pedro's position
    // console.log(path);

    if (path.length < 2) {
      // Player captured logic
      // Game.engine.lock();
      // this.draw();
      // alert('Game over - you were captured by Pedro!');
    } else {
      const [x, y] = path[0];
      const destinationKey = Game.toKey(x, y);

      // prevent enemy from walking onto another actor
      // TODO: allow in case of actor being the player
      if (Game.hasActor(destinationKey)) {
        return;
      }

      // // DEBUG: display path
      // Game.display.drawOver(x, y, null, null, '#ec5f67');
      // setTimeout(function () {}, 1000);

      // restore the display of the origin tile
      const originKey = Game.toKey(this.x, this.y);
      const tileGlyph = Glyphs[Game.map[originKey]];
      Game.display.draw(this.x, this.y, ...tileGlyph);

      // update position and display of the enemy
      this.computeDirection(x, y);
      Game.updateActorKey(originKey, destinationKey);

      this.x = x;
      this.y = y;
      this.draw();
      // debug
      console.log(this.name + ' has moved');
    }
  }

  computeDirection(newX, newY) {
    const direction = [newX - this.x, newY - this.y];
    this.direction = direction;
  }

  getTileBehind() {
    if (this.direction === null) {
      return null;
    }
    const [dx, dy] = this.direction;
    const tileBehind = {
      x: this.x - dx,
      y: this.y - dy,
    };
    return tileBehind;
  }

  setTarget() {}
}

class Blinky extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.glyph = ['\u03a9', '#ec5f67', '#15171c'];
    this.name = 'Blinky';
    this.draw();
  }

  setTarget() {
    const [x, y] = [Game.player.getX(), Game.player.getY()];
    return [x, y];
  }
}

class Pinky extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.glyph = ['\u03a9', '#bf83c0', '#15171c'];
    this.name = 'Pinky';
    this.draw();
  }

  setTarget() {
    const [x, y] = Game.player.getOffsetTarget();
    return [x, y];
  }
}
