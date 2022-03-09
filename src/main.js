const displayConfig = {
  width: 27,
  height: 31,
  fontFamily: 'VGA',
  fontSize: 16,
  forceSquareRatio: true,
};

const Glyphs = {
  0: ['', '#b2b8c2', '#15171c'],
  1: ['', '#ffffff', '#b2b8c2'],
  2: ['¤', '#58c2c0', '#15171c'],
};

const Game = {
  display: null,
  map: {},
  freeCells: [],
  engine: null,
  player: null,
  actors: [],
  actorKeys: [],
  ananas: null,

  init: function () {
    // create and store ROT console
    this.display = new ROT.Display(displayConfig);
    document.getElementById('canvas').appendChild(this.display.getContainer());

    // generate the map
    this.generateMap();
    // console.dir(this.map);

    // set up the scheduler
    const scheduler = new ROT.Scheduler.Simple();
    for (const actor of this.actors) {
      scheduler.add(actor, true);
    }
    this.engine = new ROT.Engine(scheduler);
    this.engine.start();
  },

  generateMap: function () {
    const quarterMazeConfig = {
      width: Math.ceil(displayConfig.width / 2),
      height: Math.ceil(displayConfig.height / 2),
    };

    // generate top left quadrant
    const maze = this.makeMaze(quarterMazeConfig);

    // add some rooms ?
    this.spreadRooms(maze, quarterMazeConfig);

    this.map = maze.map;
    this.freeCells = maze.freeCells;

    const flippedMazeH = this.flipMaze(maze, quarterMazeConfig, true);
    this.stitchMaze(flippedMazeH, quarterMazeConfig, true);

    const flippedMazeV = this.flipMaze(maze, quarterMazeConfig, false, true);
    this.stitchMaze(flippedMazeV, quarterMazeConfig, false, true);

    const flippedMazeHV = this.flipMaze(maze, quarterMazeConfig, true, true);
    this.stitchMaze(flippedMazeHV, quarterMazeConfig, true, true);

    const mapConfig = {
      width: displayConfig.width,
      height: displayConfig.height,
    };

    this.carveOuterRing(mapConfig);
    // const digger = new ROT.Map.IceyMaze(
    //   quarterMaze.width,
    //   quarterMaze.height
    // );

    // digger.create(
    //   function (x, y, value) {
    //     // carve out the outer ring
    //     if (this.isOuterRing(x, y, quarterMaze) || this.isInnerRing(x, y, quarterMaze)) {
    //       value = 0;
    //     }
    //     const key = this.toKey(x, y);
    //     if (!value) {
    //       this.freeCells.push(key);
    //     }
    //     this.map[key] = value;
    //   }.bind(this)
    // ); // necessary to ensure the callback is called within a correct context

    // this.spreadRooms();

    // this.generateGoodies();
    this.drawMap();

    this.actors.push(this.createBeing(Player));
    this.player = this.actors[0];
    this.actorKeys.push(this.getActorKey(this.player));

    const monstersNumber = 2;
    const monsters = [Blinky, Pinky];
    for (let i = 0; i < monstersNumber; i++) {
      const enemy = this.createBeing(monsters[i]);
      this.actors.push(enemy);
      this.actorKeys.push(this.getActorKey(enemy));
    }
  },

  makeMaze(mazeConfig) {
    const maze = {
      map: {},
      freeCells: [],
    };
    const digger = new ROT.Map.IceyMaze(
      mazeConfig.width + 2,
      mazeConfig.height + 2,
      1
    );
    digger.create(function (x, y, value) {
      // // carve out the outer ring
      // if (
      //   Game.isOuterRing(x, y, mazeConfig)
      // ) {
      //   value = 0;
      // }

      // // carve out the inner ring
      // if (
      //   Game.isInnerRing(x, y, mazeConfig)
      // ) {
      //   value = 0;
      // }

      const key = Game.toKey(x, y);
      if (!value) {
        maze.freeCells.push(key);
      }
      maze.map[key] = value;
    });
    // console.dir(maze);
    return maze;
  },

  flipMaze(maze, mazeConfig, horizontal = false, vertical = false) {
    if (!horizontal && !vertical) {
      throw 'Flipping axis not defined.';
    }
    const flippedMaze = {
      map: {},
      freeCells: [],
    };
    for (let i = 0; i < mazeConfig.height; i++) {
      for (let j = 0; j < mazeConfig.width; j++) {
        const tileKey = Game.toKey(j, i);
        let [fetchX, fetchY] = [j, i];
        if (horizontal) {
          fetchX = mazeConfig.width - 1 - j;
        }
        if (vertical) {
          fetchY = mazeConfig.height - 1 - i;
        }
        const fetchKey = Game.toKey(fetchX, fetchY);
        const fetchedTile = maze.map[fetchKey];
        flippedMaze.map[tileKey] = fetchedTile;
        if (fetchedTile === 0) {
          flippedMaze.freeCells.push(tileKey);
        }
      }
    }

    return flippedMaze;
  },

  stitchMaze(maze, mazeConfig, horizontal = false, vertical = false) {
    if (!horizontal && !vertical) {
      throw 'Stitching axis not defined.';
    }
    for (let i = 0; i < mazeConfig.height; i++) {
      for (let j = 0; j < mazeConfig.width; j++) {
        const tileKey = Game.toKey(j, i);
        let [stitchX, stitchY] = [j, i];
        if (horizontal) {
          stitchX = mazeConfig.width - 1 + j;
        }
        if (vertical) {
          stitchY = mazeConfig.height - 1 + i;
        }
        const stitchKey = Game.toKey(stitchX, stitchY);
        const mazeTile = maze.map[tileKey];
        this.map[stitchKey] = mazeTile;
        if (mazeTile === 0) {
          this.freeCells.push(stitchKey);
        }
      }
    }
  },

  carveOuterRing(mapConfig) {
    for (let i = 1; i < mapConfig.height - 1; i++) {
      for (let j = 1; j < mapConfig.width - 1; j++) {
        if (this.isOuterRing(j, i, mapConfig)) {
          const key = this.toKey(j, i);
          this.map[key] = 0;
          this.freeCells.push(key);
        }
      }
    }
  },

  isPassable(x, y) {
    const tileKey = Game.toKey(x, y);

    const isInBounds = tileKey in Game.map;
    const isNotWall = Game.map[tileKey] !== 1;
    return isInBounds && isNotWall;
  },

  isOuterRing(x, y, mazeConfig) {
    return (
      ((x === 1 || x === mazeConfig.width - 2) &&
        y > 0 &&
        y < mazeConfig.height - 1) ||
      ((y === 1 || y === mazeConfig.height - 2) &&
        x > 0 &&
        x < mazeConfig.width - 1)
    );
  },

  isInnerRing(x, y, mazeConfig) {
    const midpointX = Math.floor(mazeConfig.width / 2);
    const midpointY = Math.floor(mazeConfig.height / 2);
    const halfSize = 3;
    const lowXBound = midpointX - halfSize;
    const highXBound = midpointX + halfSize;
    const lowYBound = midpointY - halfSize;
    const highYBound = midpointY + halfSize;
    return (
      ((x === lowXBound || x === highXBound) &&
        y > lowYBound - 1 &&
        y < highYBound + 1) ||
      ((y === lowYBound || y === highYBound) &&
        x > lowXBound - 1 &&
        x < highXBound + 1)
    );
  },

  spreadRooms(maze, mazeConfig) {
    const digger2 = new ROT.Map.Uniform(mazeConfig.width, mazeConfig.height, {
      roomWidth: [3, 3],
      roomHeight: [3, 3],
      roomDugPercentage: 0.1,
    });

    digger2.create();

    const rooms = digger2.getRooms();
    for (const room of rooms) {
      // console.dir(room);
      for (let i = room.getTop(); i <= room.getBottom(); i++) {
        for (let j = room.getLeft(); j <= room.getRight(); j++) {
          const key = this.toKey(j, i);
          if (maze.map[key] === 1) {
            maze.freeCells.push(key);
            maze.map[key] = 0;
          }
        }
      }
    }
  },

  getActorKey(actor) {
    const actorX = actor.getX();
    const actorY = actor.getY();
    return this.toKey(actorX, actorY);
  },

  updateActorKey(originKey, destinationKey) {
    const actorId = this.actorKeys.indexOf(originKey);
    this.actorKeys[actorId] = destinationKey;
  },

  hasActor(key) {
    return this.actorKeys.indexOf(key) !== -1;
  },

  toKey(x, y) {
    return x + ',' + y;
  },

  toCoords(key) {
    let [x, y] = key.split(',');
    x = parseInt(x);
    y = parseInt(y);
    return [x, y];
  },

  generateGoodies: function () {
    const nbGoodies = 10;
    for (let i = 0; i < nbGoodies; i++) {
      const key = this.getRandomFreeCellKey();
      this.map[key] = 2;

      if (i === 0) {
        this.ananas = key;
      }
    }
  },

  createBeing: function (what) {
    const key = this.getRandomFreeCellKey();
    const [x, y] = this.toCoords(key);
    return new what(x, y);
  },

  getRandomFreeCellKey() {
    const index = Math.floor(ROT.RNG.getUniform() * this.freeCells.length);
    const [key] = this.freeCells.splice(index, 1);
    return key;
  },

  drawMap: function () {
    for (const key in this.map) {
      const [x, y] = this.toCoords(key);
      const glyph = Glyphs[this.map[key]];
      this.display.draw(x, y, ...glyph);
    }
  },
};

window.onload = Game.init();
