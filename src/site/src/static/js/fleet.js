const helpers = require("./helpers.js");

const {
  MAX_HEALTH,
  BIGGEST_SHIP_LEN,
  GRID_SIZE,
  MAX_FLEET_SIZE,
  COORD_X,
  COORD_Y,
  MISS,
  HIT,
  KILL,
  UP,
  LEFT,
  DOWN,
  RIGHT,
  DIRECTIONS,
} = require("./constants.js");

module.exports = class Fleet {
  constructor(grid) {
    this.ships = [[], [], [], []];
    this.size = 0;
    this.grid = grid;
    this.health = MAX_HEALTH;
  }

  addShip(newShip) {
    // next if statement check if fleet allowed to have another ship of curtain len
    if (newShip === undefined) {
      return undefined;
    }
    if (
      this.ships[newShip.len - 1].length < BIGGEST_SHIP_LEN - (newShip.len - 1)
    ) {
      this.ships[newShip.len - 1].push(newShip);
      this.placeShipOnGrid(newShip);
      ++this.size;
      return newShip;
    } else {
      return undefined;
    }
  }

  placeShipOnGrid(newShip) {
    for (let i = 0; i < newShip.len; i++) {
      const yCoord = newShip.bodyCoords[i][COORD_Y];
      const xCoord = newShip.bodyCoords[i][COORD_X];
      // this.grid.grid[yCoord][xCoord] = newShip.len;
      this.grid.getSquare(yCoord, xCoord).shipSize = newShip.len;
      this.grid.getSquare(yCoord, xCoord).hasShip = true;
    }
  }

  findShip(length, bodyCoord) {
    if (length == 0) {
      return undefined;
    }
    const ship = this.ships[length - 1].find((ship) => {
      const check = ship.bodyCoords.some((coord) =>
        coord.every((value, id) => value === bodyCoord[id])
      );
      if (check) return ship;
    });
    return ship;
  }

  removeShip(ship){
    // remove from grid
    for (let i = 0; i < ship.len; i++) {
      const yCoord = ship.bodyCoords[i][COORD_Y];
      const xCoord = ship.bodyCoords[i][COORD_X];
      this.grid.getSquare(yCoord, xCoord).shipSize = 0;
      this.grid.getSquare(yCoord, xCoord).hasShip = false;
    }
    const index = this.ships[ship.len-1].indexOf(ship);
    if (index > -1){
      // console.log(this.ships[ship.len-1]);
      // console.log("success");
      this.ships[ship.len-1].splice(index,1);
      --this.size;
      // console.log(this.ships[ship.len-1]);
    }
  }

  checkAroundSquare(square) {
    const directions = [
      [0, 0],
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
      [1, 0],
      [1, -1],
      [0, -1],
    ];
    function getSquareValueFromDirection(direction) {
      //TODO: CHANGE TRYCATCH TO IF STATEMENT 
      try {
        const returnVal = this.grid.getSquare(
          square[COORD_Y] + direction[COORD_Y],
          square[COORD_X] + direction[COORD_X],
        ).hasShip;
        console.log("retval is ", returnVal);

        if (returnVal === undefined) throw "Out of array";
        return returnVal;
      } catch (error) {
        throw error;
      }
    }
    for (let i = 0; i < directions.length; i++) {
      const direction = directions[i];
      try {
        if (getSquareValueFromDirection.call(this, direction) != false) {
          return false;
        }
      } catch (_error) {
        continue;
      }
    }
    return true;
  }

  isPossible(start, end, direction) {
    //check if in grid
    if (end[COORD_X] >= GRID_SIZE || end[COORD_Y] >= GRID_SIZE) {
      return false;
    }

    const len = helpers.calcShipLength(start, end);
    console.log("length is ", len);
    if (len > BIGGEST_SHIP_LEN) return false;
    console.log(this.checkAroundSquare(start));
    return this.checkAroundSquare(start) && this.checkAroundSquare(end);
  }
};
