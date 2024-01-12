const Agent = require("./agents.js");
const helpers = require("./helpers.js");
const { Square, Grid } = require("./grid.js");
const Warship = require("./ship.js");
const Fleet = require("./fleet.js");
const { COORD_X, COORD_Y, DIRECTIONS, UP, KILL, MISS, HIT } = require(
  "./constants.js",
);

class AiAgent extends Agent {
  constructor() {
    console.log("PlayerAgent Construction");
    super();
    this.fleet = this.createRandomFleet();
    this.memory = null;
    this.currentAttackCoords;
  }

  think(attackResult) {
    if (attackResult.state == KILL) {
      this.markAsHitCoordsAroundKilledShip(
        attackResult.killedShip,
        (square) => square.wasUsedAsTarget = true,
      );
      this.memory = null;
    } else if (attackResult.state == HIT) {
      this.memorise(attackResult.state);
    } else if (this.memory) {
      this.memorise(attackResult.state);
    }
  }

  memorise(attackResult) {
    if (!this.memory) {
      this.memory = {
        successfulHits: 1,
        firstHit: Object.assign([], this.currentAttackCoords),
        nextHit: [],
        direction: UP,
        setNextHit: function () {
          this.nextHit[COORD_Y] = this.nextHit[COORD_Y] +
            this.direction[COORD_Y];
          this.nextHit[COORD_X] = this.nextHit[COORD_X] +
            this.direction[COORD_X];
        },
      };
      let i = 0;
      while (
        !helpers.checkDirection(
          this.currentAttackCoords,
          this.memory.direction,
          this.fleet,
        )
      ) {
        this.memory.direction = DIRECTIONS[i + 1];
        ++i;
      }
      this.memory.nextHit = Object.assign([], this.memory.firstHit);
      this.memory.setNextHit();
      return;
    }
    if (attackResult == HIT) {
      ++this.memory.successfulHits;
      let i = DIRECTIONS.indexOf(this.memory.direction);
      while (
        i < 4 &&
        !helpers.checkDirection(
          this.currentAttackCoords,
          this.memory.direction,
          this.fleet,
        )
      ) {
        if (this.memory.successfulHits > 1) {
          this.memory.direction = [
            -this.memory.direction[COORD_Y],
            -this.memory.direction[COORD_X],
          ];
          this.memory.nextHit = Object.assign([], this.memory.firstHit);
          break;
        }
        this.memory.direction = DIRECTIONS[i + 1];
        ++i;
      }
      if (i < 4) {
        this.memory.setNextHit();
      }
    }
    if (attackResult == MISS) {
      if (this.memory.successfulHits == 1) {
        let i = DIRECTIONS.indexOf(this.memory.direction);
        this.memory.direction = DIRECTIONS[i + 1];
        while (
          !helpers.checkDirection(
            this.memory.firstHit,
            this.memory.direction,
            this.fleet,
          )
        ) {
          this.memory.direction = DIRECTIONS[i + 1];
          ++i;
        }
        this.memory.nextHit = Object.assign([], this.memory.firstHit);
        this.memory.setNextHit();
      } else {
        this.memory.direction = [
          -this.memory.direction[COORD_Y],
          -this.memory.direction[COORD_X],
        ];
        this.memory.nextHit = Object.assign([], this.memory.firstHit);
        this.memory.setNextHit();
      }
    }
  }

  getAttackFromMemory() {
    return Object.assign([], this.memory.nextHit);
  }

  generateStrikeCoords() {
    if (this.memory) {
      while (true) {
        this.currentAttackCoords = this.getAttackFromMemory();
        if (
          this.fleet.grid.getSquare(this.currentAttackCoords).wasUsedAsTarget ==
            false
        ) {
          break;
        }
      }
    } else {
      while (true) {
        this.currentAttackCoords = [
          helpers.getRandomInt(9),
          helpers.getRandomInt(9),
        ];
        if (
          this.fleet.grid.getSquare(this.currentAttackCoords).wasUsedAsTarget ==
            false
        ) {
          break;
        }
      }
    }
    this.fleet.grid.getSquare(this.currentAttackCoords).wasUsedAsTarget = true;
    console.log(...this.currentAttackCoords);
    return this.currentAttackCoords;
  }
  evaluateStrike(y, x) {
    console.log("PLAYER ATTACKS");
    return super.evaluateStrike(y, x);
  }
}

module.exports = AiAgent;
