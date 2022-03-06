const Game = {
  display: null,
  map: {},

  init: function () {
    // create and store ROT console
    this.display = new ROT.Display();
    document.getElementById('canvas').appendChild(this.display.getContainer());

    // generate the map
    this.generateMap();
    // console.dir(this.map);

    // draw the map
    this.drawMap();
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

  drawMap: function () {
    for (const key in this.map) {
      let [x, y] = key.split(',');
      x = parseInt(x);
      y = parseInt(y);
      this.display.draw(x, y, this.map[key]);
    }
  },
};

window.onload = Game.init();
