const mapConfig = {
  width: 21,
  height: 27,
};

class MapGenerator {
  constructor(mapConfig) {
    this.mapWidth = mapConfig.width;
    this.mapHeight = mapConfig.height;
    this.map = {};
    this.freeCells = [];
    this.pellets = [];
  }

  init() {
    const quarterMazeConfig = {
      width: Math.ceil(mapConfig.width / 2),
      height: Math.ceil(mapConfig.height / 2),
    };

    // generate top left quadrant
    const maze = this.makeMaze(quarterMazeConfig);

    // // add some rooms ?
    // this.spreadRooms(maze, quarterMazeConfig);

    this.map = maze.map;
    this.freeCells = maze.freeCells;

    // // mirror and paste the maze onto other quadrants
    // const flippedMazeH = this.flipMaze(maze, quarterMazeConfig, true);
    // this.stitchMaze(flippedMazeH, quarterMazeConfig, true);

    // const flippedMazeV = this.flipMaze(maze, quarterMazeConfig, false, true);
    // this.stitchMaze(flippedMazeV, quarterMazeConfig, false, true);

    // const flippedMazeHV = this.flipMaze(maze, quarterMazeConfig, true, true);
    // this.stitchMaze(flippedMazeHV, quarterMazeConfig, true, true);

    // this.carveOuterRing(mapConfig);

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

    // put pellets
    for (let i = 0; i < this.freeCells.length; i++) {
      this.pellets[i] = this.freeCells[i];
    }

    return [this.map, this.freeCells, this.pellets];
  }

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
    digger.create(
      function (x, y, value) {
        // // carve out the outer ring
        // if (
        //   this.isOuterRing(x, y, mazeConfig)
        // ) {
        //   value = 0;
        // }

        // // carve out the inner ring
        // if (
        //   this.isInnerRing(x, y, mazeConfig)
        // ) {
        //   value = 0;
        // }

        const key = Game.toKey(x, y);
        if (!value) {
          maze.freeCells.push(key);
        }
        maze.map[key] = value;
      }.bind(this)
    );
    // console.log(maze.map);
    // punch holes into decidedly too long walls
    // check each row for long walls
    for (let i = 0; i < mazeConfig.height + 2; i++) {
      let consecutiveWalls = 0;
      for (let j = 0; j < mazeConfig.width + 2; j++) {
        const isInBounds =
          j >= 2 && j <= mazeConfig.width && i >= 2 && i < mazeConfig.height;
        if (isInBounds) {
          // console.log(
          //   'checking tile ',
          //   Game.toKey(j, i),
          //   ' : ',
          //   maze.map[Game.toKey(j, i)]
          // );
          if (maze.map[Game.toKey(j, i)] === 0) {
            consecutiveWalls = 0;
          } else {
            // console.log('found wall');
            consecutiveWalls++;
            if (consecutiveWalls > 3) {
              // console.log('found 4th consecutive wall');
              consecutiveWalls = 0;
              // dig out the fourth wall
              maze.map[Game.toKey(j, i)] = 0;
              maze.freeCells.push(Game.toKey(j, i));
              // make the following tile a wall to prevent from having to big a gap
              maze.map[Game.toKey(j + 1, i)] = 1;
              maze.freeCells.splice(
                maze.freeCells.indexOf(Game.toKey(j + 1, i)),
                1
              );
              // if the tile below is a wall, dig it out
              // to prevent from having a diagonal hole
              if (maze.map[Game.toKey(j, i + 1)] === 1) {
                maze.map[Game.toKey(j, i + 1)] = 0;
                if (maze.freeCells.indexOf(Game.toKey(j, i + 1)) === -1) {
                  maze.freeCells.push(Game.toKey(j, i + 1));
                }
              }
            }
          }
        }
      }
    }

    // check each column for long walls
    for (let j = 0; j < mazeConfig.width + 2; j++) {
      let consecutiveWalls = 0;
      for (let i = 0; i < mazeConfig.height + 2; i++) {
        const isInBounds =
          j >= 2 && j <= mazeConfig.width && i >= 2 && i < mazeConfig.height;
        if (isInBounds) {
          // console.log(
          //   'checking tile ',
          //   Game.toKey(j, i),
          //   ' : ',
          //   maze.map[Game.toKey(j, i)]
          // );
          if (maze.map[Game.toKey(j, i)] === 0) {
            consecutiveWalls = 0;
          } else {
            // console.log('found wall');
            consecutiveWalls++;
            if (consecutiveWalls > 3) {
              // console.log('found 4th consecutive wall');
              consecutiveWalls = 0;

              maze.map[Game.toKey(j, i)] = 0;
              maze.freeCells.push(Game.toKey(j, i));

              maze.map[Game.toKey(j, i + 1)] = 1;
              maze.freeCells.splice(
                maze.freeCells.indexOf(Game.toKey(j, i + 1)),
                1
              );

              if (maze.map[Game.toKey(j + 1, i)] === 1) {
                maze.map[Game.toKey(j + 1, i)] = 0;
                if (maze.freeCells.indexOf(Game.toKey(j+ 1, i)) === -1) {
                  maze.freeCells.push(Game.toKey(j + 1, i));
                }
              }
            }
          }
        }
      }
    }

    // console.log(maze.map);

    // console.dir(maze);
    return maze;
  }

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
  }

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
  }

  carveOuterRing(mapConfig) {
    for (let i = 1; i < mapConfig.height - 1; i++) {
      for (let j = 1; j < mapConfig.width - 1; j++) {
        if (this.isOuterRing(j, i, mapConfig)) {
          const key = Game.toKey(j, i);
          this.map[key] = 0;
          this.freeCells.push(key);
        }
      }
    }
  }

  isOuterRing(x, y, mazeConfig) {
    return (
      ((x === 1 || x === mazeConfig.width - 2) &&
        y > 0 &&
        y < mazeConfig.height - 1) ||
      ((y === 1 || y === mazeConfig.height - 2) &&
        x > 0 &&
        x < mazeConfig.width - 1)
    );
  }

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
  }

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
          const key = Game.toKey(j, i);
          if (maze.map[key] === 1) {
            maze.freeCells.push(key);
            maze.map[key] = 0;
          }
        }
      }
    }
  }
}
