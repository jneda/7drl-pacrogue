const Game = {
  display: null,
  map: {},
  player: null,
  engine: null,
  ananas: null,
  pedro: null,

  init: function () {
    // create and store ROT console
    this.display = new ROT.Display();
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
    this.drawMap();

    this.player = this.createBeing(Player, freeCells);
    this.pedro = this.createBeing(Pedro, freeCells);
  },

  generateGoodies: function (freeCells) {
    const nbGoodies = 10;
    for (let i = 0; i < nbGoodies; i++) {
      const index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
      // remove empty cell from list and get its key
      const [key] = freeCells.splice(index, 1);
      this.map[key] = 2;

      if (i === 0) {
        this.ananas = key;
      }
    }
  },

  createBeing: function (what, freeCells) {
    const index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    const [key] = freeCells.splice(index, 1);
    let [x, y] = key.split(',');
    x = parseInt(x);
    y = parseInt(y);
    return new what(x, y);
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

  if (code === 'Enter' || code === 'NumpadEnter' || code === 'Space') {
    this.checkBox();
    return;
  }

  if (!(code in keyMap)) {
    return;
  }

  const [dx, dy] = ROT.DIRS[8][keyMap[code]];
  const newX = this.x + dx;
  const newY = this.y + dy;
  const newKey = newX + ',' + newY;

  if (!(newKey in Game.map) || Game.map[newKey] === 1) {
    return;
  }

  Game.display.draw(this.x, this.y, Game.map[this.x + ',' + this.y]);
  this.x = newX;
  this.y = newY;
  this.draw();
  window.removeEventListener('keydown', this);
  Game.engine.unlock();
};

Player.prototype.checkBox = function () {
  const key = this.x + ',' + this.y;
  if (Game.map[key] !== 2) {
    alert('There is no box here!');
  } else if (key === Game.ananas) {
    alert('Horray! You found an ananas and won this game.');
    Game.engine.lock();
    window.removeEventListener('keydown', this);
  } else {
    alert('This box is empty. :-(');
  }
};

Player.prototype.getX = function () {
  return this.x;
};

Player.prototype.getY = function () {
  return this.y;
};

const Pedro = function (x, y) {
  this.x = x;
  this.y = y;
  this.draw();
};

Pedro.prototype.draw = function () {
  Game.display.draw(this.x, this.y, 'P', 'red');
};

Pedro.prototype.act = function () {
  const [x, y] = [Game.player.getX(), Game.player.getY()];

  const isPassable = function (x, y) {
    const tileKey = x + ',' + y;
    return tileKey in Game.map && Game.map[tileKey] !== 1;
  };

  const astar = new ROT.Path.AStar(x, y, isPassable, { topology: 4 });

  const path = [];
  const getPath = function (x, y) {
    path.push([x, y]);
  };
  astar.compute(this.x, this.y, getPath);
  path.shift(); // remove Pedro's position
  console.log(path);

  if (path.length === 1) {
    Game.engine.lock();
    alert('Game over - you were captured by Pedro!');
  } else {
    const [x, y] = path[0];
    Game.display.draw(this.x, this.y, Game.map[this.x + ',' + this.y]);
    this.x = x;
    this.y = y;
    this.draw();
  }
};

window.onload = Game.init();
