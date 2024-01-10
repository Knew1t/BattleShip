const Agent = require("./agents.js");
const helpers = require("./helpers.js");
const { Square, Grid } = require("./grid.js");
const Warship = require("./ship.js");
const Fleet = require("./fleet.js");

class AiAgent extends Agent {
  // OLD CONSTRUCTOR
  // constructor(firendlyFleet, enemyFleet, enemyGrid) {
  //   console.log("AiAgent Construction");
  //   super(firendlyFleet, enemyFleet, enemyGrid);
  //   this.prevAttacks = [];
  //   this.memory = null;
  // }
  // NEW CONSTRUCTOR
  constructor() {
    console.log("PlayerAgent Construction");
    super();
    this.fleet = this.createRandomFleet();
    this.memory = null;
    this.prevAttacks = [];
  }

  memorise(attackResult) {
    if (!this.memory) {
      this.memory = {
        successfulHits: 1,
        firstHit: Object.assign([], this.attackCoords),
        nextHit: [],
        direction: UP,
      };
      let i = 0;
      while (
        !helpers.checkDirection(
          this.attackCoords,
          this.memory.direction,
          this.prevAttacks,
        )
      ) {
        this.memory.direction = DIRECTIONS[i + 1];
        ++i;
      }
      this.memory.nextHit = Object.assign([], this.memory.firstHit);
      this.memory.nextHit[COORD_Y] += this.memory.direction[COORD_Y];
      this.memory.nextHit[COORD_X] += this.memory.direction[COORD_X];
      return;
    }
    if (attackResult == HIT) {
      ++this.memory.successfulHits;
      let i = DIRECTIONS.indexOf(this.memory.direction);
      while (
        i < 4 &&
        !helpers.checkDirection(
          this.attackCoords,
          this.memory.direction,
          this.prevAttacks,
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
        this.memory.nextHit[COORD_Y] = this.memory.nextHit[COORD_Y] +
          this.memory.direction[COORD_Y];
        this.memory.nextHit[COORD_X] = this.memory.nextHit[COORD_X] +
          this.memory.direction[COORD_X];
      } else {
        this.memory.direction--;
        this.memory.nextHit = Object.assign([], this.memory.firstHit);
        this.memory.nextHit[COORD_Y] = this.memory.nextHit[COORD_Y] +
          this.memory.direction[COORD_Y];
        this.memory.nextHit[COORD_X] = this.memory.nextHit[COORD_X] +
          this.memory.direction[COORD_X];
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
            this.prevAttacks,
          )
        ) {
          this.memory.direction = DIRECTIONS[i + 1];
          ++i;
        }
        this.memory.nextHit = Object.assign([], this.memory.firstHit);
        this.memory.nextHit[COORD_Y] = this.memory.nextHit[COORD_Y] +
          this.memory.direction[COORD_Y];
        this.memory.nextHit[COORD_X] = this.memory.nextHit[COORD_X] +
          this.memory.direction[COORD_X];
      } else {
        this.memory.direction = [
          -this.memory.direction[COORD_Y],
          -this.memory.direction[COORD_X],
        ];
        this.memory.nextHit = Object.assign([], this.memory.firstHit);
        this.memory.nextHit[COORD_Y] = this.memory.nextHit[COORD_Y] +
          this.memory.direction[COORD_Y];
        this.memory.nextHit[COORD_X] = this.memory.nextHit[COORD_X] +
          this.memory.direction[COORD_X];
      }
    }
  }

  getAttackFromMemory() {
    return Object.assign([], this.memory.nextHit);
  }

  attack() {
    if (!this.myTurn) return;
    try {
      while (true) {
        this.attackCoords = this.getAttackFromMemory();
        if (!helpers.customContains(this.prevAttacks, this.attackCoords)) break;
      }
    } catch (_error) {
      while (true) {
        this.attackCoords = [helpers.getRandomInt(9), helpers.getRandomInt(9)];
        if (!helpers.customContains(this.prevAttacks, this.attackCoords)) break;
      }
    }
    paintSquare(this.attackCoords);
    this.prevAttacks.push(this.attackCoords);
    console.log("----------------------AI ATTACK ---------------------");
    const attackResult = super.attack();
    if (attackResult == KILL) {
      this.addCoordsAroundKilledShip();
      this.memory = null;
    }
    if (attackResult == HIT) {
      this.memorise(attackResult);
    }
    if (attackResult == MISS) {
      if (this.memory) {
        this.memorise(attackResult);
      }
    }
    paintSquare(this.attackCoords);
  }

  generateStrikeCoords() {
    let attackCoords;
    try {
      while (true) {
        attackCoords = this.getAttackFromMemory();
        if (!helpers.customContains(this.prevAttacks, this.attackCoords)) break;
      }
    } catch (_error) {
      while (true) {
        attackCoords = [helpers.getRandomInt(9), helpers.getRandomInt(9)];
        if (!helpers.customContains(this.prevAttacks, attackCoords)) break;
      }
    }
    console.log(...attackCoords);
    return attackCoords;
  }
}

module.exports = AiAgent;
