class Enemy {
  constructor(x, y, countdown) {
    this.x = x;
    this.y = y;
    this.direction = null;
    this.glyph = ['\u03a9', '#ec5f67', '#212121'];
    this.count = countdown;
    // this.draw();
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  draw() {
    Game.display.draw(this.x + displayOffsetX, this.y + displayOffsetY, ...this.glyph);
  }

  act() {
    // use this.count to make the enemys start moving after a delay in turns
    if (this.count > 0) {
      this.count--;
      return;
    }
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

      const tileHasActor = Game.hasActor(Game.toKey(x, y));
      const tileHasPlayer =
        Game.toKey(x, y) === Game.toKey(Game.player.getX(), Game.player.getY());
      const thisTile = Game.toKey(this.x, this.y);
      const tileHasEnemy = tileHasActor && !tileHasPlayer && !thisTile;

      const debugPath = {
        x: x,
        y: y,
        tileIsEmpty: tileIsEmpty,
        tileIsBehind: tileIsBehind,
        tileHasActor: tileHasActor,
        tileHasPlayer: tileHasPlayer,
      };

      if (tileHasEnemy) {
        console.log(debugPath);
      }

      return tileIsEmpty && !tileIsBehind && !tileHasEnemy;
    }.bind(this);
    const astar = new ROT.Path.AStar(x, y, isPassable, { topology: 4 });
    // console.dir(astar);
    const path = [];
    const getPath = function (x, y) {
      path.push([x, y]);

      // // DEBUG: display path
      // console.log('drawing tile');
      // Game.display.drawOver(x, y, null, null, '#88e985');
    };
    astar.compute(this.x, this.y, getPath);
    path.shift(); // remove Pedro's position
    // console.log(path);

    // check if distance with player was 1
    const distance = Game.getDistance(
      Game.player.getX(),
      Game.player.getY(),
      this.x,
      this.y
    );
    if (Game.startsTurnNextToPlayer(this)) {
      Game.playerCaptured = true;
      // alert('Player captured!');
      // Player captured logic
      // Game.engine.lock();
      // this.draw();
      // alert('Game over - you were captured by Pedro!');
    } else {
      console.log(`${this.name} path: ${path}`);
      if (path.length === 0) {
        console.log('path is empty');
        return;
      }
      const [x, y] = path[0];
      const destinationKey = Game.toKey(x, y);

      // prevent enemy from walking onto another actor
      // // TODO: allow in case of actor being the player
      if (Game.hasActor(destinationKey)) {
        return;
      }

      // DEBUG: display path
      // Game.display.drawOver(x, y, null, null, '#ec5f67');
      // setTimeout(function () {}, 1000);

      // restore the display of the origin tile
      Game.drawMapAt(this.x, this.y);
      // const tileGlyph = Glyphs[Game.map[originKey]];
      // Game.display.draw(this.x, this.y, ...tileGlyph);

      // update position and display of the enemy
      this.computeDirection(x, y);
      const originKey = Game.toKey(this.x, this.y);
      Game.updateActorKey(originKey, destinationKey);

      this.x = x;
      this.y = y;
      this.draw();
      // debug
      // console.log(this.name + ' has moved');
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
    this.glyph = ['\u03a9', '#ec5f67', '#212121'];
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
    this.glyph = ['\u03a9', '#bf83c0', '#212121'];
    this.name = 'Pinky';
    this.draw();
  }

  setTarget() {
    const offset = 4;
    const [x, y] = Game.player.getOffsetTarget(offset);
    return [x, y];
  }
}

class Clyde extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.origin = [x, y];
    console.log('Clyde origin: ', this.origin);
    this.glyph = ['\u03a9', '#88e985', '#212121'];
    this.name = 'Clyde';
    this.draw();
  }

  setTarget() {
    const [playerX, playerY] = [Game.player.getX(), Game.player.getY()];
    const distance = Game.getDistance(playerX, playerY, this.x, this.y);

    if (distance >= 8) {
      return [playerX, playerY];
    }
    return origin;
  }
}

class Inky extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.glyph = ['\u03a9', '#5485c0', '#212121'];
    this.name = 'Inky';
    this.draw();
  }

  setTarget() {
    const offset = 2;
    const [playerX, playerY] = Game.player.getOffsetTarget(offset);
    const [blinkyX, blinkyY] = Game.toCoords(Game.getBlinkysKey());

    function clampX(x) {
      x = Math.min(x, mapConfig.width - 2);
      x = Math.max(x, 1);
      return x;
    }

    function clampY(y) {
      y = Math.min(y, mapConfig.height - 2);
      y = Math.max(y, 1);
      return y;
    }

    let deltaX = (playerX - blinkyX) * 2;
    let deltaY = (playerY - blinkyY) * 2;

    const targetX = clampX(blinkyX + deltaX);
    const targetY = clampY(blinkyY + deltaY);

    console.log(`${this.name} target: ${targetX},${targetY}`);
    return [targetX, targetY];
  }
}
