const { COORD_Y, COORD_X, GRID_SIZE } = require("./constants.js");

class Square {
  constructor() {
    this.wasHit = 0;// by enemy
    this.wasUsedAsTarget = false;
    this.hasShip = false;
    this.shipSize = 0;
    this.killed = false;
  }
}

class Grid {
  constructor(gridSize) {
    console.log("Inside GRID constructor");
    if (gridSize == undefined) {
      gridSize = GRID_SIZE;
    }
    this.grid = [];
    for (let i = 0; i < gridSize; i++) {
      this.grid[i] = [];
      for (let j = 0; j < gridSize; j++) {
        this.grid[i].push(new Square());
      }
    }
  }

  getSquare(y, x) {
    return Array.isArray(y)
      ? this.grid[y[COORD_Y]][y[COORD_X]]
      : this.grid[y][x];
  }

  consoleRender() {
    console.log("  0 1 2 3 4 5 6 7 8 9");
    let resultString = "";
    for (let i = 0; i < this.grid.length; i++) {
      resultString += `${i} `;
      for (let j = 0; j < this.grid[i].length; j++) {
        let outputSquareString = (this.grid[i][j].shipSize == 0)
          ? ". "
          : `${this.getSquare(i, j).shipSize} `;
        if (this.getSquare(i, j).wasHit != 0) {
          outputSquareString = outputSquareString.replace(".", "o");
        }
        if (this.getSquare(i, j).killed == true) {
          outputSquareString = outputSquareString.replace(
            `${this.getSquare(i, j).shipSize}`,
            "x",
          );
        }
        resultString += outputSquareString;
      }
      resultString += "\n";
    }
    console.log(resultString);
  }
}

module.exports = { Square, Grid };
