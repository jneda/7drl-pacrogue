const Game = {
  display: null,
  map: {},
  player: null,
  engine: null,

  init: function () {
    // create and store ROT console
    this.display = new ROT.Display();
    document.getElementById('canvas').appendChild(this.display.getContainer());

    // generate the map
    this.generateMap();
    // console.dir(this.map);

    // draw the map
    this.drawMap();

    // set up the scheduler
    const scheduler = new ROT.Scheduler.Simple();
    scheduler.add(this.player, true);
    this.engine = new ROT.Engine(scheduler);
    this.engine.start();
  },

  generateMap: function () {
    const digger = new ROT.Map.Digger();
    const freeCells = [];

    digger.create(
      function (x, y, value) {
        const key = x + ',' + y;
        if (!value) {
          freeCells.push(key);
        }
        this.map[key] = value;
      }.bind(this)
    ); // necessary to ensure the callback is called within a correct context

    this.generateGoodies(freeCells);

    this.createPlayer(freeCells);
  },

  generateGoodies: function (freeCells) {
    const nbGoodies = 10;
    for (let i = 0; i < nbGoodies; i++) {
      const index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
      // remove empty cell from list and get its key
      const [key] = freeCells.splice(index, 1);
      this.map[key] = 2;
    }
  },

  createPlayer: function (freeCells) {
    const index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    const [key] = freeCells.splice(index, 1);
    let [x, y] = key.split(',');
    x = parseInt(x);
    y = parseInt(y);
    this.player = new Player(x, y);
  },

  drawMap: function () {
    for (const key in this.map) {
      let [x, y] = key.split(',');
      x = parseInt(x);
      y = parseInt(y);
      this.display.draw(x, y, this.map[key]);
    }
  },
};

// Player is defined by its constructor function
const Player = function (x, y) {
  this.x = x;
  this.y = y;
  this.draw();
};

Player.prototype.draw = function () {
  Game.display.draw(this.x, this.y, '@', '#ff0');
};

Player.prototype.act = function () {
  Game.engine.lock();
  window.addEventListener('keydown', this);
};

Player.prototype.handleEvent = function (event) {
  const keyMap = {
    Numpad8: 0,
    Numpad9: 1,
    Numpad6: 2,
    Numpad3: 3,
    Numpad2: 4,
    Numpad1: 5,
    Numpad4: 6,
    Numpad7: 7,
  };

  const code = event.code;
  console.log(code);

  if (!(code in keyMap)) {
    return;
  }

  const [dx, dy] = ROT.DIRS[8][keyMap[code]];
  const newX = this.x + dx;
  const newY = this.y + dy;
  const newKey = newX + ',' + newY;

  if (!(newKey in Game.map)) {
    return;
  }

  Game.display.draw(this.x, this.y, Game.map[this.x + ',' + this.y]);
  this.x = newX;
  this.y = newY;
  this.draw();
  window.removeEventListener('keydown', this);
  Game.engine.unlock();
};

window.onload = Game.init();
