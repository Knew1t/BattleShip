// import { MAX_FLEET_SIZE } from "./constants.js";

const Agent = require("./agents.js");
const helpers = require("./helpers.js");
// const { Square, Grid } = require("./grid.js");
const Warship = require("./ship.js");
// const Fleet = require("./fleet.js");

class PlayerAgent extends Agent {
  // OLD CONSTRUCTOR
  // constructor(firendlyFleet, enemyFleet, enemyGrid) {
  //   console.log("PlayerAgent Construction");
  //   super(firendlyFleet, enemyFleet, enemyGrid);
  // }

  // NEW CONSTRUCTOR
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
};

module.exports = PlayerAgent;
