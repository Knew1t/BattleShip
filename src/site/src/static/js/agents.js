const { Square, Grid } = require("./grid.js");
const Warship = require("./ship.js");
const Fleet = require("./fleet.js");
const { GRID_SIZE, BIGGEST_SHIP_LEN, COORD_X, COORD_Y, HIT, MISS, KILL } =
  require(
    "./constants.js",
  );
const helpers = require("./helpers.js");
class Agent {
  constructor(/* firendlyFleet, enemyFleet, enemyGrid */) {
    console.log("   Agent Construction");
    this.fleet = new Fleet(new Grid());
    this.myTurn = false;
    this.attackCoords;
  }

  createRandomFleet() {
    const randomGrid = new Grid(GRID_SIZE);
    const randomFleet = new Fleet(randomGrid);
    for (
      let shipLength = 4;
      randomFleet.size < 10 && shipLength > 0;
    ) {
      // check if len is still needed
      if (
        randomFleet.ships[shipLength - 1].length >=
          BIGGEST_SHIP_LEN - (shipLength - 1)
      ) {
        shipLength--;
        continue;
      }
      const { start, end, direction } = helpers.generatePossibleCoordinates(
        randomFleet,
        shipLength,
      );
      console.log("start:", start, "endl: ", end, "direction: ", direction);
      const newShip = new Warship(start, end, direction);
      if (randomFleet.addShip(newShip) == undefined) shipLength--;
      randomFleet.grid.consoleRender();
    }
    randomFleet.grid.consoleRender();
    return randomFleet;
  }

  checkHealth() {
    return this.fleet.health;
  }

  markSurroundingCoords(coord, callback) {
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
      [1, 0],
      [1, -1],
      [0, -1],
    ];
    for (const direction of directions) {
      const check = [
        coord[COORD_Y] + direction[COORD_Y],
        coord[COORD_X] + direction[COORD_X],
      ];
      if (
        check[COORD_Y] < 0 ||
        check[COORD_Y] >= GRID_SIZE ||
        check[COORD_X] < 0 ||
        check[COORD_X] >= GRID_SIZE
      ) continue;
      // this.fleet.grid.getSquare(check).wasUsedAsTarget = true;
      callback(this.fleet.grid.getSquare(check));
      // this.fleet.grid.getSquare(check).wasHit = 1;
    }
  }
  markAsHitCoordsAroundKilledShip(targetShip, callback) {
    for (let i = 0; i < targetShip.len; i++) {
      const bodyCoord = targetShip.bodyCoords[i];
      this.markSurroundingCoords(bodyCoord, callback);
    }
  }

  evaluateStrike(y, x) {
    const result = {};
    const targetLength = this.fleet.grid.getSquare(y, x).shipSize;
    const targetShip = this.fleet.findShip(
      targetLength,
      [y, x],
    );
    this.fleet.grid.getSquare(y, x).wasHit = 1; //new
    if (targetShip != undefined) {
      this.fleet.health--;
      targetShip.health--;
      if (targetShip.health) {
        result.state = HIT;
        console.log("TARGET HIT");
      } else {
        result.state = KILL;
        result.killedShip = targetShip;
        console.log("TARGET KILLED");
        for (const square of targetShip.bodyCoords) {
          this.fleet.grid.getSquare(square).killed = true;
        }
        this.markAsHitCoordsAroundKilledShip(targetShip, (sq) => sq.wasHit = 1);
        this.fleet.grid.consoleRender();
      }
    } else {
      result.state = MISS;
      console.log("TARGET MISS");
      this.myTurn = true;
    }
    this.fleet.grid.consoleRender();
    return result;
  }

  takeIncomingStrike(y, x) {
    return this.evaluateStrike(y, x);
  }
}

module.exports = Agent;
