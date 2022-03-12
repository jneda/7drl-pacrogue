const displayConfig = {
  width: 27,
  height: 31,
  fontFamily: 'VGA',
  fontSize: 16,
  forceSquareRatio: true,
  bg: "#212121",
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
  monsterPenCells: [],
  playerAreaCells: [],
  pellets: [],
  engine: null,
  player: null,
  actors: [],
  actorKeys: [],
  ananas: null,
  score: 0,

  start() {
    let title = 'PacRogue';
    const titleLength = title.length;
    title = '%c{#fdc253}'.concat(title);
    // console.log(title);
    const titleX = Math.floor(displayConfig.width / 2 - titleLength / 2);
    const titleY = Math.floor(displayConfig.height / 4);

    // console.log(this.display);
    this.display.drawText(titleX, titleY, title);

    let description = 'A 7 Day Roguelike';
    const descriptionLength = description.length;
    description = '%c{#b2b8c2}'.concat(description);
    const descriptionX = Math.floor(displayConfig.width / 2 - descriptionLength / 2);
    const descriptionY = Math.floor(displayConfig.height / 3);

    this.display.drawText(descriptionX, descriptionY, description);

    let instructions = '%c{#b2b8c2}You are the yellow @.\n' +
    'Try to eat all the blue pills without getting caught!\n' +
    'Move around using the keyboard arrows.\n\n' +
    'Press any key to start.';
    const instructionsX = Math.floor(displayConfig.width / 8);
    const instructionsY = descriptionY + 2;
    const instructionsWidth = displayConfig.width - instructionsX * 2;

    this.display.drawText(instructionsX, instructionsY, instructions, instructionsWidth);

  },

  init() {
    // create and store ROT console
    this.display = new ROT.Display(displayConfig);
    document.getElementById('canvas').appendChild(this.display.getContainer());

    this.start();

    window.addEventListener('keydown', this);
  },

  handleEvent(event) {
    console.log(this);
    window.removeEventListener('keydown', this);
    this.startNewMap();
  },

  startNewMap() {
    // generate the map
    const mapGenerator = new MapGenerator(mapConfig);
    [
      this.map,
      this.freeCells,
      this.pellets,
      this.monsterPenCells,
      this.playerAreaCells,
    ] = mapGenerator.init();
    // console.dir(this.map);

    // this.generateGoodies();
    this.drawMap();

    this.actors.push(this.createBeing([this.playerAreaCells[1]], Player));
    this.player = this.actors[0];
    this.actorKeys.push(this.getActorKey(this.player));

    const monstersNumber = 3;
    const monsters = [Blinky, Inky, Pinky, Clyde];
    for (let i = 0; i < monstersNumber; i++) {
      const enemy = this.createBeing([this.monsterPenCells[i]], monsters[i]);
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

    this.score = 0;
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

  getBlinkysKey() {
    let blinky;
    for (let i = 0; i < this.actors.length; i++) {
      if (this.actors[i].name === 'Blinky') {
        blinky = this.actors[i];
        return this.getActorKey(blinky);
      }
    }
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

  getDistance(x1, y1, x2, y2) {
    const distance = Math.round(
      Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
    );
    return distance;
  },

  generateGoodies() {
    const nbGoodies = 10;
    for (let i = 0; i < nbGoodies; i++) {
      const key = this.getRandomFreeCellKey();
      this.map[key] = 2;

      if (i === 0) {
        this.ananas = key;
      }
    }
  },

  createBeing(positions, what) {
    const key = this.getRandomFreeCellKey(positions);
    const [x, y] = this.toCoords(key);
    return new what(x, y);
  },

  getRandomFreeCellKey(positions) {
    const index = Math.floor(ROT.RNG.getUniform() * positions.length);
    const [key] = positions.splice(index, 1);
    return key;
  },

  drawMap() {
    for (const key in this.map) {
      const [x, y] = this.toCoords(key);
      const glyph = Glyphs[this.map[key]];
      this.display.draw(x, y, ...glyph);

      if (this.pellets.indexOf(key) !== -1) {
        this.display.drawOver(x, y, ...Glyphs['3']);
      }
    }
  },

  drawMapAt(x, y) {
    const tileKey = this.toKey(x, y);
    const glyph = Glyphs[this.map[tileKey]];
    this.display.draw(x, y, ...glyph);

    if (this.pellets.indexOf(tileKey) !== -1) {
      this.display.drawOver(x, y, ...Glyphs['3']);
    }
  },
};

window.onload = Game.init();
