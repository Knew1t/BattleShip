const Agent = require("./agents.js");
const helpers = require("./helpers.js");
const Warship = require("./ship.js");

class PlayerAgent extends Agent {
  constructor() {
    super();
    console.log("PlayerAgent Construction");
  }
  attack() {
    if (this.myTurn && this.attackCoords != undefined) {
      console.log("PLAYER ATTACKS--------------------------");
      if (super.attack() > 0) {
        console.log("TODO: send info about killed ship");
      }
      this.enemyFleet.grid
        .grid[this.attackCoords[COORD_Y]][this.attackCoords[COORD_X]] = 0;
      this.attackCoords = undefined;
    }
  }

  removeShip(y, x) {
    const targetLength = this.fleet.grid.getSquare(y, x).shipSize;
    const targetShip = this.fleet.findShip(
      targetLength,
      [y, x],
    );
    this.fleet.removeShip(targetShip);
  }
  addShipToFleet(start, end) {
    if (
      this.fleet.isPossible(
        start,
        end,
        helpers.isHorizontal(start, end),
      )
    ) {
      const newShip = new Warship(
        start,
        end,
        helpers.isHorizontal(start, end),
      );
      if (this.fleet.addShip(newShip) === undefined) {
        alert("ERROR: Wrong type of a ship");
        return;
      }
      this.fleet.grid.consoleRender();
    } else {
      alert("Wrong Coordinates");
    }
  }
  evaluateStrike(y, x) {
    console.log("AI ATTACKS");
    return super.evaluateStrike(y, x);
  }
}

module.exports = PlayerAgent;
