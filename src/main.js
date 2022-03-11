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
  3: ['.', '#58c2c0', null],
};

const Game = {
  display: null,
  map: {},
  freeCells: [],
  pellets: [],
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
    const mapGenerator = new MapGenerator(mapConfig);
    [this.map, this.freeCells, this.pellets] = mapGenerator.init();
    // console.dir(this.map);

    this.generateGoodies();
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

    // set up the scheduler
    const scheduler = new ROT.Scheduler.Simple();
    for (const actor of this.actors) {
      scheduler.add(actor, true);
    }
    this.engine = new ROT.Engine(scheduler);
    this.engine.start();
  },

  isPassable(x, y) {
    const tileKey = Game.toKey(x, y);

    const isInBounds = tileKey in Game.map;
    const isNotWall = Game.map[tileKey] !== 1;
    return isInBounds && isNotWall;
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

      if (this.pellets.indexOf(key) !== -1) {
        this.display.drawOver(x, y, ...Glyphs['3']);
      }
    }
  },
};

window.onload = Game.init();
