const displayConfig = {
  width: 21,
  height: 21,
  fontFamily: 'VGA',
  fontSize: 32,
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
        const key = this.toKey(x, y);
        if (!value) {
          this.freeCells.push(key);
        }
        this.map[key] = value;
      }.bind(this)
    ); // necessary to ensure the callback is called within a correct context

    this.generateGoodies();
    this.drawMap();

    this.player = this.createBeing(Player);
    this.pedro = this.createBeing(Pedro);
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
