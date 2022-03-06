const displayConfig = {
  width: 21,
  height: 21,
  fontFamily: 'VGA',
  fontSize: 16,
  forceSquareRatio: true,
};

const Glyphs = {
  0: ['', '#b2b8c2', '#15171c'],
  1: ['', '#ffffff', '#b2b8c2'],
  2: ['ù', '#b2b8c2', '#15171c'],
};

const Game = {
  display: null,
  map: {},
  freeCells: [],
  player: null,
  engine: null,
  ananas: null,
  pedro: null,

  init: function () {
    // create and store ROT console
    this.display = new ROT.Display(displayConfig);
    document.getElementById('canvas').appendChild(this.display.getContainer());

    // generate the map
    this.generateMap();
    // console.dir(this.map);

    // set up the scheduler
    const scheduler = new ROT.Scheduler.Simple();
    scheduler.add(this.player, true);
    scheduler.add(this.pedro, true);
    this.engine = new ROT.Engine(scheduler);
    this.engine.start();
  },

  generateMap: function () {
    const digger = new ROT.Map.IceyMaze(
      displayConfig.width,
      displayConfig.height
    );

    digger.create(
      function (x, y, value) {
        // carve out the outer ring
        if (this.isOuterRing(x, y) || this.isInnerRing(x, y)) {
          value = 0;
        }
        const key = this.toKey(x, y);
        if (!value) {
          this.freeCells.push(key);
        }
        this.map[key] = value;
      }.bind(this)
    ); // necessary to ensure the callback is called within a correct context

    this.spreadRooms();

    this.generateGoodies();
    this.drawMap();

    this.player = this.createBeing(Player);
    this.pedro = this.createBeing(Pedro);
  },

  isOuterRing(x, y) {
    return (
      ((x === 1 || x === displayConfig.width - 2) &&
        y > 0 &&
        y < displayConfig.height - 1) ||
      ((y === 1 || y === displayConfig.height - 2) &&
        x > 0 &&
        x < displayConfig.width - 1)
    );
  },

  isInnerRing(x, y) {
    const midpointX = Math.floor(displayConfig.width / 2);
    const midpointY = Math.floor(displayConfig.height / 2);
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

  spreadRooms() {
    const digger2 = new ROT.Map.Uniform(
      displayConfig.width,
      displayConfig.height,
      {
        roomWidth: [3, 3],
        roomHeight: [3, 3],
        roomDugPercentage: 0.3,
      }
    );

    digger2.create();

    const rooms = digger2.getRooms();
    for (const room of rooms) {
      // console.dir(room);
      for (let i = room.getTop(); i <= room.getBottom(); i++) {
        for (let j = room.getLeft(); j <= room.getRight(); j++) {
          const key = this.toKey(j, i);
          if (this.map[key] === 1) {
            this.freeCells.push(key);
            this.map[key] = 0;
          }
        }
      }
    }
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
