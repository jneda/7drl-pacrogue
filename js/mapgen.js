const mapConfig = {
  width: 17,
  height: 23,
};

class MapGenerator {
  constructor(mapConfig) {
    this.mapWidth = mapConfig.width;
    this.mapHeight = mapConfig.height;
    this.map = {};
    this.freeCells = [];
    this.monsterPenCells = [];
    this.playerAreaCells = [];
    this.pellets = [];
  }

  init() {
    const quarterMazeConfig = {
      width: Math.ceil(mapConfig.width / 2),
      height: Math.ceil(mapConfig.height / 2),
    };

    // generate top left quadrant
    const maze = this.makeMaze(quarterMazeConfig);

    this.map = maze.map;

    // mirror and paste the maze onto other quadrants
    const flippedMazeH = this.flipMaze(maze, quarterMazeConfig, true);
    this.stitchMaze(flippedMazeH, quarterMazeConfig, true);

    const flippedMazeV = this.flipMaze(maze, quarterMazeConfig, false, true);
    this.stitchMaze(flippedMazeV, quarterMazeConfig, false, true);

    const flippedMazeHV = this.flipMaze(maze, quarterMazeConfig, true, true);
    this.stitchMaze(flippedMazeHV, quarterMazeConfig, true, true);

    // final touches : outer ring, starting areas for monsters and player
    this.carveOuterRing(mapConfig);

    this.putMonsterPen(mapConfig);
    this.putPlayerStartArea(mapConfig);

    for (const key in this.map) {
      if (this.map[key] === 0) {
        this.freeCells.push(key);
      }
    }

    // put pellets
    for (let i = 0; i < this.freeCells.length; i++) {
      const tileKey = this.freeCells[i];
      const tileIsInMonsterPen = this.monsterPenCells.indexOf(tileKey) !== -1;
      const tileIsInPlayerArea = this.playerAreaCells.indexOf(tileKey) !== -1;
      if (!tileIsInMonsterPen && !tileIsInPlayerArea) {
        this.pellets.push(this.freeCells[i]);
      }
    }

    return [
      this.map,
      this.freeCells,
      this.pellets,
      this.monsterPenCells,
      this.playerAreaCells,
    ];
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
    digger.create(function (x, y, value) {
      const key = Game.toKey(x, y);
      maze.map[key] = value;
    });

    maze.map = this.checkRowsForLongWalls(maze.map, mazeConfig);

    maze.map = this.checkColumnsForLongWalls(maze.map, mazeConfig);

    return maze;
  }

  checkRowsForLongWalls(mazemap, mazeConfig) {
    // punch holes into decidedly too long walls

    // check each row for long walls
    for (let i = 0; i < mazeConfig.height + 2; i++) {
      let consecutiveWalls = 0;
      for (let j = 0; j < mazeConfig.width + 2; j++) {
        const isInBounds =
          j >= 2 && j <= mazeConfig.width && i >= 2 && i < mazeConfig.height;
        if (isInBounds) {
          if (mazemap[Game.toKey(j, i)] === 0) {
            consecutiveWalls = 0;
          } else {
            consecutiveWalls++;
            if (consecutiveWalls > 3) {
              consecutiveWalls = 0;
              // dig out the fourth wall
              mazemap[Game.toKey(j, i)] = 0;
              // make the following tile a wall to prevent from having to big a gap
              mazemap[Game.toKey(j + 1, i)] = 1;
              // if the tile below is a wall, dig it out
              // to prevent from having a diagonal hole
              if (mazemap[Game.toKey(j, i + 1)] === 1) {
                mazemap[Game.toKey(j, i + 1)] = 0;
              }
            }
          }
        }
      }
    }

    return mazemap;
  }

  checkColumnsForLongWalls(mazemap, mazeConfig) {
    // check each column for long walls
    for (let j = 0; j < mazeConfig.width + 2; j++) {
      let consecutiveWalls = 0;
      for (let i = 0; i < mazeConfig.height + 2; i++) {
        const isInBounds =
          j >= 2 && j <= mazeConfig.width && i >= 2 && i < mazeConfig.height;
        if (isInBounds) {
          if (mazemap[Game.toKey(j, i)] === 0) {
            consecutiveWalls = 0;
          } else {
            consecutiveWalls++;
            if (consecutiveWalls > 3) {
              consecutiveWalls = 0;

              mazemap[Game.toKey(j, i)] = 0;

              mazemap[Game.toKey(j, i + 1)] = 1;

              if (mazemap[Game.toKey(j + 1, i)] === 1) {
                mazemap[Game.toKey(j + 1, i)] = 0;
              }
            }
          }
        }
      }
    }
    return mazemap;
  }

  flipMaze(maze, mazeConfig, horizontal = false, vertical = false) {
    if (!horizontal && !vertical) {
      throw 'Flipping axis not defined.';
    }
    const flippedMaze = {
      map: {},
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
      }
    }
  }

  carveOuterRing(mapConfig) {
    for (let i = 1; i < mapConfig.height - 1; i++) {
      for (let j = 1; j < mapConfig.width - 1; j++) {
        if (this.isOuterRing(j, i, mapConfig)) {
          const key = Game.toKey(j, i);
          this.map[key] = 0;
        }
      }
    }
  }

  putMonsterPen(mapConfig) {
    const penCenter = {
      x: Math.floor(mapConfig.width / 2),
      y: Math.ceil(mapConfig.height / 2) - 2,
    };

    const penMap = [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 0, 1, 1, 0],
      [0, 1, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ];

    let penMapRowIndex = 0;
    for (let row = penCenter.y - 3; row < penCenter.y + 2; row++) {
      let penMapColumnIndex = 0;
      for (let column = penCenter.x - 3; column < penCenter.x + 4; column++) {
        const key = Game.toKey(column, row);
        const penCell = penMap[penMapRowIndex][penMapColumnIndex];
        this.map[key] = penCell;
        const isCellInsidePen =
          penCell === 0 &&
          penMapRowIndex > 0 &&
          penMapRowIndex < 3 &&
          penMapColumnIndex > 1 &&
          penMapColumnIndex < 5;
        if (isCellInsidePen) {
          this.monsterPenCells.push(key);
        }
        penMapColumnIndex++;
      }
      penMapRowIndex++;
    }
  }

  putPlayerStartArea(mapConfig) {
    const areaCenter = {
      x: Math.floor(mapConfig.width / 2),
      y: mapConfig.height - Math.ceil(mapConfig.height / 4) - 1,
    };

    const areaMap = [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 1, 0, 0, 0, 1, 0],
      [0, 1, 1, 0, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ];

    let penMapRowIndex = 0;
    for (let row = areaCenter.y - 2; row < areaCenter.y + 3; row++) {
      let penMapColumnIndex = 0;
      for (let column = areaCenter.x - 3; column < areaCenter.x + 4; column++) {
        const key = Game.toKey(column, row);
        const areaCell = areaMap[penMapRowIndex][penMapColumnIndex];
        this.map[key] = areaCell;

        const isCellInsideArea =
          areaCell === 0 &&
          penMapRowIndex > 1 &&
          penMapRowIndex < 4 &&
          penMapColumnIndex > 1 &&
          penMapColumnIndex < 5;
        if (isCellInsideArea) {
          this.playerAreaCells.push(key);
        }
        penMapColumnIndex++;
      }
      penMapRowIndex++;
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
