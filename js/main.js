const displayConfig = {
  width: 27,
  height: 31,
  fontFamily: 'VGA',
  fontSize: 16,
  forceSquareRatio: true,
  bg: "#212121",
};

const displayOffsetX = Math.floor((displayConfig.width - mapConfig.width) / 2);
const displayOffsetY = Math.floor((displayConfig.height - mapConfig.height) / 2);

const Glyphs = {
  0: ['', '#b2b8c2', '#212121'],
  1: ['', '#ffffff', '#b2b8c2'],
  2: ['¤', '#58c2c0', '#212121'],
  3: ['.', '#58c2c0', null],
};

const Game = {
  display: null,
  map: {},
  freeCells: [],
  monsterPenCells: [],
  playerAreaCells: [],
  pellets: [],
  scheduler: null,
  engine: null,
  player: null,
  playerCaptured: false,
  actors: [],
  actorKeys: [],
  score: 0,

  start() {
    let title = 'PacRogue';
    const titleLength = title.length;
    title = '%c{#fdc253}'.concat(title);
    const titleX = Math.floor(displayConfig.width / 2 - titleLength / 2);
    const titleY = Math.floor(displayConfig.height / 4);

    this.display.drawText(titleX, titleY, title);

    let description = 'A 7 Day Roguelike';
    const descriptionLength = description.length;
    description = '%c{#b2b8c2}'.concat(description);
    const descriptionX = Math.floor(displayConfig.width / 2 - descriptionLength / 2);
    const descriptionY = titleY + 2;

    this.display.drawText(descriptionX, descriptionY, description);

    let instructions = '%c{#ffffff}You are the yellow @.\n\n' +
    'Try to eat all the blue pills without getting caught!\n\n' +
    'Move around using the keyboard arrows.\n\n' +
    'Press any key to start.';
    const instructionsX = Math.floor(displayConfig.width / 8);
    const instructionsY = descriptionY + 4;
    const instructionsWidth = displayConfig.width - instructionsX * 2;

    this.display.drawText(instructionsX, instructionsY, instructions, instructionsWidth);

  },

  levelWon() {
    this.display.clear();
    let title = 'You won this level!';
    const titleLength = title.length;
    title = '%c{#fdc253}'.concat(title);
    const titleX = Math.floor(displayConfig.width / 2 - titleLength / 2);
    const titleY = Math.floor(displayConfig.height / 4);

    this.display.drawText(titleX, titleY, title);

    let scoreText = 'Your score: ' + this.score.toString();
    const scoreLength = scoreText.length;
    scoreText = '%c{#b2b8c2}'.concat(scoreText);
    const scoreX = Math.floor(displayConfig.width / 2 - scoreLength / 2);
    const scoreY = titleY + 2;

    this.display.drawText(scoreX, scoreY, scoreText);

    let instructions = 'Press any key to restart';
    const instructionsLength = instructions.length;
    instructions = '%c{#b2b8c2}'.concat(instructions);
    const instructionsX = Math.floor(displayConfig.width / 2 - instructionsLength / 2);
    const instructionsY = scoreY + 2;

    this.display.drawText(instructionsX, instructionsY, instructions);

    this.reset();
  },

  levelLost() {
    this.display.clear();
    let title = 'You lost this level!';
    const titleLength = title.length;
    title = '%c{#ec5f67}'.concat(title);
    const titleX = Math.floor(displayConfig.width / 2 - titleLength / 2);
    const titleY = Math.floor(displayConfig.height / 4);

    this.display.drawText(titleX, titleY, title);

    let scoreText = 'Your score: ' + this.score.toString();
    const scoreLength = scoreText.length;
    scoreText = '%c{#b2b8c2}'.concat(scoreText);
    const scoreX = Math.floor(displayConfig.width / 2 - scoreLength / 2);
    const scoreY = titleY + 2;

    this.display.drawText(scoreX, scoreY, scoreText);

    let instructions = 'Press any key to restart';
    const instructionsLength = instructions.length;
    instructions = '%c{#b2b8c2}'.concat(instructions);
    const instructionsX = Math.floor(displayConfig.width / 2 - instructionsLength / 2);
    const instructionsY = scoreY + 2;

    this.display.drawText(instructionsX, instructionsY, instructions);

    this.reset();
  },

  reset() {
    this.scheduler.clear();
    this.player = null;
    this.playerCaptured = false;
    this.actors = [];
    this.actorKeys = [];
    this.score = 0;
  },

  init() {
    // create and store ROT console
    this.display = new ROT.Display(displayConfig);
    document.getElementById('canvas').appendChild(this.display.getContainer());

    this.start();

    window.addEventListener('keydown', this);
  },

  handleEvent(event) {
    window.removeEventListener('keydown', this);
    this.display.clear();
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

    this.drawMap();

    this.actors.push(this.createBeing([this.playerAreaCells[1]], Player));
    this.player = this.actors[0];
    this.actorKeys.push(this.getActorKey(this.player));

    const monstersNumber = 4;
    const monsters = [Blinky, Pinky, Blinky, Pinky];
    for (let i = 0; i < monstersNumber; i++) {
      const enemy = this.createBeing([this.monsterPenCells[i]], monsters[i], i);
      this.actors.push(enemy);
      this.actorKeys.push(this.getActorKey(enemy));
    }

    // set up the scheduler
    this.scheduler = new ROT.Scheduler.Simple();
    for (const actor of this.actors) {
      this.scheduler.add(actor, true);
    }
    this.scheduler.add(new IsGameOver(), true);
    this.engine = new ROT.Engine(this.scheduler);
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

  startsTurnNextToPlayer(enemy) {
    const [playerX, playerY] = [this.player.getX(), this.player.getY()];
    const [deltaX, deltaY] = [playerX - enemy.x, playerY - enemy.y];
    const neighbourDeltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const neighbourDelta of neighbourDeltas) {
      const [neighbourX, neighbourY] = neighbourDelta;
      if (neighbourX === deltaX && neighbourY === deltaY) {
        return true;
      }
    }
    return false;
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

  createBeing(positions, what, countdown) {
    const key = this.getRandomFreeCellKey(positions);
    const [x, y] = this.toCoords(key);
    if (countdown) {
      return new what(x, y, countdown);
    }
    return new what(x, y);
  },

  getRandomFreeCellKey(positions) {
    const index = Math.floor(ROT.RNG.getUniform() * positions.length);
    const [key] = positions.splice(index, 1);
    return key;
  },

  drawMap() {for (const key in this.map) {
      const [x, y] = this.toCoords(key);
      const glyph = Glyphs[this.map[key]];
      this.display.draw(x + displayOffsetX, y + displayOffsetY, ...glyph);

      if (this.pellets.indexOf(key) !== -1) {
        this.display.drawOver(x + displayOffsetX, y + displayOffsetY, ...Glyphs['3']);
      }
    }
  },

  drawMapAt(x, y) {
    const tileKey = this.toKey(x, y);
    const glyph = Glyphs[this.map[tileKey]];
    this.display.draw(x + displayOffsetX, y + displayOffsetY, ...glyph);

    if (this.pellets.indexOf(tileKey) !== -1) {
      this.display.drawOver(x + displayOffsetX, y + displayOffsetY, ...Glyphs['3']);
    }
  },
};

window.onload = Game.init();
