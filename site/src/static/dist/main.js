/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./source_code/refactoring/agent_ai.js":
/*!*********************************************!*\
  !*** ./source_code/refactoring/agent_ai.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Agent = __webpack_require__(/*! ./agents.js */ "./source_code/refactoring/agents.js");
const helpers = __webpack_require__(/*! ./helpers.js */ "./source_code/refactoring/helpers.js");
const { Square, Grid } = __webpack_require__(/*! ./grid.js */ "./source_code/refactoring/grid.js");
const Warship = __webpack_require__(/*! ./ship.js */ "./source_code/refactoring/ship.js");
const Fleet = __webpack_require__(/*! ./fleet.js */ "./source_code/refactoring/fleet.js");

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

  pushSurroundingSquaresToArray(coord, array) {
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
      if (!helpers.customContains(array, check)) {
        array.push([
          check[COORD_Y],
          check[COORD_X],
        ]);
      }
    }
  }

  addCoordsAroundKilledShip() {
    const targetLength = this.enemyFleet.grid
      .grid[this.attackCoords[COORD_Y]][this.attackCoords[COORD_X]];
    const targetShip = this.enemyFleet.findShip(
      targetLength,
      this.attackCoords,
    );
    // NOT EFFECTIVE, DOUBLE ADDITION FOR SAME COORDS !!
    for (let i = 0; i < targetShip.bodyCoords.length; i++) {
      const bodyCoord = targetShip.bodyCoords[i];
      this.pushSurroundingSquaresToArray(bodyCoord, this.prevAttacks);
    }
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


/***/ }),

/***/ "./source_code/refactoring/agent_player.js":
/*!*************************************************!*\
  !*** ./source_code/refactoring/agent_player.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// import { MAX_FLEET_SIZE } from "./constants.js";

const Agent = __webpack_require__(/*! ./agents.js */ "./source_code/refactoring/agents.js");
const helpers = __webpack_require__(/*! ./helpers.js */ "./source_code/refactoring/helpers.js");
// const { Square, Grid } = require("./grid.js");
const Warship = __webpack_require__(/*! ./ship.js */ "./source_code/refactoring/ship.js");
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


/***/ }),

/***/ "./source_code/refactoring/agents.js":
/*!*******************************************!*\
  !*** ./source_code/refactoring/agents.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { Square, Grid } = __webpack_require__(/*! ./grid.js */ "./source_code/refactoring/grid.js");
const Warship = __webpack_require__(/*! ./ship.js */ "./source_code/refactoring/ship.js");
const Fleet = __webpack_require__(/*! ./fleet.js */ "./source_code/refactoring/fleet.js");
const { GRID_SIZE, BIGGEST_SHIP_LEN, COORD_X, COORD_Y, HIT, MISS, KILL } =
  __webpack_require__(
    /*! ./constants.js */ "./source_code/refactoring/constants.js",
  );
const helpers = __webpack_require__(/*! ./helpers.js */ "./source_code/refactoring/helpers.js");
class Agent {
  constructor(/* firendlyFleet, enemyFleet, enemyGrid */) {
    console.log("   Agent Construction");
    // OLD MEMBERS
    // this.enemyGrid = enemyGrid;
    // this.fleet = firendlyFleet;
    // this.enemyFleet = enemyFleet;
    // this.myTurn = true;
    // this.attackCoords = undefined;
    // NEW MEMBERS
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

  attack() {
    let result;
    const targetLength = this.enemyFleet.grid
      .grid[this.attackCoords[COORD_Y]][this.attackCoords[COORD_X]];
    const targetShip = this.enemyFleet.findShip(
      targetLength,
      this.attackCoords,
    );
    if (targetShip != undefined) {
      // this.enemyFleet.grid
      //   .grid[this.attackCoords[COORD_Y]][this.attackCoords[COORD_X]] = 0;
      this.enemyFleet.health--;
      targetShip.health--;
      if (targetShip.health) {
        result = HIT;
        console.log("TARGET HIT");
        this.enemyGrid[this.attackCoords[COORD_Y]][this.attackCoords[COORD_X]]
          .classList
          .toggle(
            "paint-hit",
          );
      } else {
        result = KILL;
        console.log("TARGET KILLED");
        paintShip(this.enemyGrid, targetShip, "paint-killed"); //PROBLEM PAINT
        paintSurroundKilledShip(this.enemyGrid, targetShip, "paint-miss");
      }
    } else {
      // TODO:fix tightly coupled with view
      result = MISS;
      console.log("TARGET MISS");
      this.enemyGrid[this.attackCoords[COORD_Y]][this.attackCoords[COORD_X]]
        .classList
        .toggle(
          "paint-miss",
        );
      this.myTurn = false;
    }
    return result;
  }
  evaluateStrike(y, x) {
    let result;
    const targetLength = this.fleet.grid.getSquare(y, x).shipSize;
    const targetShip = this.fleet.findShip(
      targetLength,
      [y, x],
    );
    this.fleet.grid.getSquare(y, x).wasHit = 1; //new
    if (targetShip != undefined) {
      // this.enemyFleet.grid
      //   .grid[this.attackCoords[COORD_Y]][this.attackCoords[COORD_X]] = 0;
      this.fleet.health--;
      targetShip.health--;
      if (targetShip.health) {
        result = HIT;
        console.log("TARGET HIT");
      } else {
        result = KILL;
        console.log("TARGET KILLED");
        for (const square of targetShip.bodyCoords) {
          this.fleet.grid.getSquare(square).killed = true;
        }
        // paintShip(this.enemyGrid, targetShip, "paint-killed"); //PROBLEM PAINT
        // paintSurroundKilledShip(this.enemyGrid, targetShip, "paint-miss");
      }
    } else {
      result = MISS;
      console.log("TARGET MISS");
      // this.enemyGrid[this.attackCoords[COORD_Y]][this.attackCoords[COORD_X]]
      //   .classList
      //   .toggle(
      //     "paint-miss",
      //   );
      this.myTurn = true;
    }
    console.log("HP: ", this.checkHealth());
    return result;
  }

  takeIncomingStrike(y, x) {
    return this.evaluateStrike(y, x);
  }
}

module.exports = Agent;


/***/ }),

/***/ "./source_code/refactoring/constants.js":
/*!**********************************************!*\
  !*** ./source_code/refactoring/constants.js ***!
  \**********************************************/
/***/ ((module) => {

const MAX_HEALTH = 20;
const BIGGEST_SHIP_LEN = 4;

const GAME_MODE_BATTLE = 2; //
const GAME_MODE_SHIP_PLACEMENT = 1;
const GAME_MODE_MENU = 0;

const GRID_SIZE = 10;
const MAX_FLEET_SIZE = 10;

const COORD_X = 1;
const COORD_Y = 0;

const MISS = 0;
const HIT = 1;
const KILL = 2;

// directions
const UP = [-1, 0];
const LEFT = [0, 1];
const DOWN = [1, 0];
const RIGHT = [0, -1];
const DIRECTIONS = [UP, LEFT, DOWN, RIGHT];

module.exports = {
  MAX_HEALTH,
  BIGGEST_SHIP_LEN,
  GAME_MODE_BATTLE,
  GAME_MODE_SHIP_PLACEMENT,
  GAME_MODE_MENU,
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
};


/***/ }),

/***/ "./source_code/refactoring/controller.js":
/*!***********************************************!*\
  !*** ./source_code/refactoring/controller.js ***!
  \***********************************************/
/***/ ((module) => {

module.exports = class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.model.controller = this;

    this.view.bindFightClick(this.handleFightClick.bind(this));
    this.view.bindFriendlySquareClick(
      this.handleFriendlySquareClick.bind(this),
    );
    // this.view.bindGetSquareData(this.getSquareData.bind(this));
    this.view.bindEnemySquareClick(
      this.handleEnemySquareClick.bind(this),
    );
    // this.model.bindUpdateFriendlyGrid(this.handleUpdateFriendlyGrid.bind(this));
    this.model.updateEnemyGrid = this.handleUpdateEnemyGrid.bind(this);
    this.model.updateFriendlyGrid = this.handleUpdateFriendlyGrid.bind(this);
    this.model.updateGameMode = this.handleUpdateGameMode.bind(this);
    // this.model.updateFriendlySquare = this.handleUpdateFriendlySquare.bind(
    //   this,
    // );
  }

  getSquareData(isFriendly, y, x) {
    if (isFriendly) {
      console.log(this.model.playerAgent.fleet.grid.getSquare(y, x).hasShip);
      return this.model.playerAgent.fleet.grid.getSquare(y, x).hasShip;
    } else {
      return this.model.aiAgent.fleet.grid.getSquare(y, x).hasShip;
    }
  }

  init() {
    console.log("hello");
  }

  handleFightClick() {
    this.model.initSession();
    this.view.setScoreIcons();
  }

  handleFriendlySquareClick(start, end) {
    this.model.addPlayerShip(start, end);
  }

  handleEnemySquareClick(y, x) {
    this.model.initGameTurn(y, x);
  }

  // handleUpdateFriendlySquare() {
  //   this.view.updateFriendlyGrid(this.model.playerAgent.fleet.grid.grid);
  // }

  handleUpdateFriendlyGrid() {
    this.view.redrawFriendlyGrid(this.model.playerAgent.fleet.grid.grid);
  }
  handleUpdateEnemyGrid() {
    this.view.redrawEnemyGrid(this.model.aiAgent.fleet.grid.grid);
  }
  handleUpdateGameMode() {
    this.view.getGameMode(this.model.gameMode);
  }
};


/***/ }),

/***/ "./source_code/refactoring/fleet.js":
/*!******************************************!*\
  !*** ./source_code/refactoring/fleet.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const helpers = __webpack_require__(/*! ./helpers.js */ "./source_code/refactoring/helpers.js");

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
} = __webpack_require__(/*! ./constants.js */ "./source_code/refactoring/constants.js");

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


/***/ }),

/***/ "./source_code/refactoring/grid.js":
/*!*****************************************!*\
  !*** ./source_code/refactoring/grid.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { COORD_Y, COORD_X, GRID_SIZE } = __webpack_require__(/*! ./constants.js */ "./source_code/refactoring/constants.js");

class Square {
  constructor() {
    this.wasHit = 0;
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


/***/ }),

/***/ "./source_code/refactoring/helpers.js":
/*!********************************************!*\
  !*** ./source_code/refactoring/helpers.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { COORD_X, COORD_Y, GRID_SIZE } = __webpack_require__(/*! ./constants.js */ "./source_code/refactoring/constants.js");

function generatePossibleCoordinates(fleet, len) {
  let start, end, direction;
  while (true) {
    start = [getRandomInt(GRID_SIZE - 1), getRandomInt(GRID_SIZE - 1)];
    direction = getRandomInt(1); //direction horizontal or vertical
    end = (direction == COORD_X)
      ? [start[COORD_Y], start[COORD_X] + len - 1]
      : [start[COORD_Y] + len - 1, start[COORD_X]];
    if (fleet.isPossible(start, end, direction)) {
      return { start, end, direction };
    }
  }
}
function calcShipLength(start, end) {
  return ((start[COORD_X] == end[COORD_X])
    ? Math.abs(start[COORD_Y] - end[COORD_Y])
    : Math.abs(start[COORD_X] - end[COORD_X])) + 1;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

function isHorizontal(start, end) {
  return (start[COORD_Y] == end[COORD_Y]) ? 1 : 0;
}
function customContains(array, element) {
  for (let index = 0; index < array.length; index++) {
    const el = array[index];
    if (el[0] === element[0] && el[1] === element[1]) {
      return true;
    }
  }
  return false;
}
function checkDirection(currentCoord, direction, prevAttacks) {
  const check = [
    currentCoord[COORD_Y] + direction[COORD_Y],
    currentCoord[COORD_X] + direction[COORD_X],
  ];
  if (
    check[COORD_Y] < 0 ||
    check[COORD_Y] >= GRID_SIZE ||
    check[COORD_X] < 0 ||
    check[COORD_X] >= GRID_SIZE ||
    customContains(prevAttacks, check)
  ) {
    return false;
  }
  return true;
}
module.exports = {
  isHorizontal,
  generatePossibleCoordinates,
  calcShipLength,
  getRandomInt,
  customContains,
  checkDirection,
};


/***/ }),

/***/ "./source_code/refactoring/model.js":
/*!******************************************!*\
  !*** ./source_code/refactoring/model.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const AiAgent = __webpack_require__(/*! ./agent_ai.js */ "./source_code/refactoring/agent_ai.js");
const PlayerAgent = __webpack_require__(/*! ./agent_player.js */ "./source_code/refactoring/agent_player.js");
const {
  // MAX_HEALTH,
  // BIGGEST_SHIP_LEN,
  GAME_MODE_BATTLE,
  GAME_MODE_SHIP_PLACEMENT,
  GAME_MODE_MENU,
  // GRID_SIZE,
  MAX_FLEET_SIZE,
  // COORD_X,
  // COORD_Y,
  MISS,
  // HIT,
  // KILL,
  // UP,
  // LEFT,
  // DOWN,
  // RIGHT,
  // DIRECTIONS,
} = __webpack_require__(/*! ./constants.js */ "./source_code/refactoring/constants.js");

class Model {
  constructor() {
    this.gameMode = GAME_MODE_MENU;
    this.aiAgent;
    this.playerAgent;
    this.updateFriendlyGrid = null;
    this.updateEnemyGrid = null;
    this.updateGameMode = null;
  }

  initSession() {
    console.log("SESSION STARTED");
    this.aiAgent = new AiAgent();
    this.playerAgent = new PlayerAgent();
    // this.updateFriendlyGrid();
    // this.updateEnemyGrid();
    this.initShipPlacement();
  }

  initShipPlacement() {
    console.log("Mode: Ship placement");
    this.setGameMode(GAME_MODE_SHIP_PLACEMENT);
    this.playerAgent.fleet = this.playerAgent.createRandomFleet();
    this.checkFleetSize();
  }

  initGameTurn(y, x) {
    console.log(`Turn: y = ${y}; x = ${x}`);
    if (this.aiAgent.takeIncomingStrike(y, x) == MISS) {
      this.updateEnemyGrid();
      while (
        this.playerAgent.takeIncomingStrike(
          ...this.aiAgent.generateStrikeCoords(),
        ) != MISS
      ) {
        this.checkScore();
        this.updateFriendlyGrid();
      }
      this.updateFriendlyGrid();
    }
    this.updateEnemyGrid();
    this.checkScore();
  }

  checkScore() {
    const playerHP = this.playerAgent.checkHealth();
    const aiHP = this.aiAgent.checkHealth();
    if (
      playerHP == 0 || aiHP == 0
    ) {
      this.setGameMode(GAME_MODE_MENU);
      if (playerHP > aiHP) {
        return "YOU WON";
      } else if (aiHP < playerHP) {
        return "YOU LOST";
      } else {
        return "DRAW";
      }
    }
  }

  announceWinner() {
  }

  addPlayerShip(start, end) {
    console.log("view data recieved in controller: ", start, end);
    this.playerAgent.addShipToFleet(start, end);
    this.updateFriendlyGrid();
    this.checkFleetSize();
  }

  setGameMode(mode) {
    this.gameMode = mode;
    this.updateGameMode(this.gameMode);
  }

  checkFleetSize() {
    if (this.playerAgent.fleet.size == MAX_FLEET_SIZE) {
      this.setGameMode(GAME_MODE_BATTLE);
      this.updateFriendlyGrid();
      this.updateEnemyGrid();
    }
  }
}

module.exports = Model;


/***/ }),

/***/ "./source_code/refactoring/ship.js":
/*!*****************************************!*\
  !*** ./source_code/refactoring/ship.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { COORD_X, COORD_Y } = __webpack_require__(/*! ./constants.js */ "./source_code/refactoring/constants.js");
const helpers = __webpack_require__(/*! ./helpers.js */ "./source_code/refactoring/helpers.js");

module.exports = class Warship {
  constructor(start, end, direction) {
    this.isHorizontal = direction;
    this.len = helpers.calcShipLength(start, end);
    this.health = this.len;
    const sign =
      ((start[COORD_X] == end[COORD_X])
        ? (start[COORD_Y] - end[COORD_Y])
        : (start[COORD_X] - end[COORD_X])) + 1;
    this.bodyCoords = [start];
    let nextSquare = Object.assign([], start);
    while (this.bodyCoords.length < this.len) {
      // add or sub depends on which coord we chose first
      nextSquare[direction] += (sign <= 0) ? 1 : -1;
      this.bodyCoords.push(nextSquare);
      nextSquare = Object.assign([], nextSquare);
    }
  }
};


/***/ }),

/***/ "./source_code/refactoring/view.js":
/*!*****************************************!*\
  !*** ./source_code/refactoring/view.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const {
  BIGGEST_SHIP_LEN,
  GAME_MODE_BATTLE,
  GAME_MODE_SHIP_PLACEMENT,
  GAME_MODE_MENU,
  GRID_SIZE,
  COORD_X,
  COORD_Y,
} = __webpack_require__(/*! ./constants.js */ "./source_code/refactoring/constants.js");
module.exports = class View {
  constructor() {
    this.playerGridDiv = document.getElementById("player-grid");
    this.aiGridDiv = document.getElementById("ai-grid");
    this.startGameButton = document.getElementById("start-game-button");
    //ship selection
    this.shipSelectors = document.getElementsByClassName("ship-selector");
    this.shipStartEndData = []; // array
    // divs
    this.playerGrid = this.createGrid(this.playerGridDiv);
    this.aiGrid = this.createGrid(this.aiGridDiv);
    this.gameMode = GAME_MODE_MENU;
  }

  getGameMode(gameMode) {
    if (this.gameMode == GAME_MODE_BATTLE && gameMode == GAME_MODE_MENU) {
      this.toggleStartGameButtonVisibility();
      alert("GAME IS OVER");
    }
    this.gameMode = gameMode;
    return gameMode;
  }

  checkIfCanBeClicked(element) {
    return !(element.classList.contains("paint-killed") ||
      element.classList.contains("paint-miss") ||
      element.classList.contains("paint-hit"));
  }
  redrawFriendlyGrid(grid) {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const element = grid[i][j];
        if (element.hasShip) {
          this.playerGrid[i][j].classList.add("paint-friendly");
        }
        if (element.killed) {
          this.playerGrid[i][j].classList.add("paint-killed");
        }
        if (element.wasHit && !element.hasShip) {
          this.playerGrid[i][j].classList.add("paint-miss");
        }
        if (element.wasHit && element.hasShip) {
          this.playerGrid[i][j].classList.add("paint-hit");
        }
      }
    }
  }

  redrawEnemyGrid(grid) {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const element = grid[i][j];
        if (element.hasShip) {
          this.aiGrid[i][j].classList.add("cheat-ships");
        }
        if (element.killed) {
          this.aiGrid[i][j].classList.add("paint-killed");
        }
        if (element.wasHit && !element.hasShip) {
          this.aiGrid[i][j].classList.add("paint-miss");
        }
        if (element.wasHit && element.hasShip) {
          this.aiGrid[i][j].classList.add("paint-hit");
        }
      }
    }
  }

  toggleStartGameButtonVisibility() {
    this.startGameButton.classList.toggle("hidden");
  }

  createGrid(gridDiv) {
    const squares = [];
    // DocumentFragment is better than appending to DOM directly
    const tmpGrid = document.createDocumentFragment();
    for (let i = 0; i < GRID_SIZE; i++) {
      squares[i] = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        const square = document.createElement("div");
        square.classList.add("square");
        square.setAttribute("y", `${i}`);
        square.setAttribute("x", `${j}`);
        squares[i][j] = tmpGrid.appendChild(square);
      }
    }
    gridDiv.appendChild(tmpGrid);
    return squares;
  }

  renderGrid(grid, callback) {
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid.length; j++) {
        callback(grid[i][j]);
      }
    }
  }

  setScoreIcons() {
    const selectorOne = Array.from(this.shipSelectors);
    for (let i = 0; i < selectorOne.length; i++) {
      const elem = selectorOne[i];
      let score = BIGGEST_SHIP_LEN - elem.classList[1][1] + 1;
      const scoreDiv = document.createElement("div");
      const appendSym = (elem.classList.contains("ai")) ? "●" : "○";
      while (score--) scoreDiv.textContent += appendSym;
      elem.appendChild(scoreDiv);
    }
  }

  /*====================bindings============================*/
  bindFightClick(handler) {
    this.startGameButton.addEventListener("click", () => {
      handler();
      this.toggleStartGameButtonVisibility();
      this.clearPlayerBoard();
    });
  }

  // getSquareData(handler) {
  //   return handler();
  // }
  bindFriendlySquareClick(handler) {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        this.playerGrid[i][j].addEventListener("click", (ev) => {
          if (this.gameMode == GAME_MODE_SHIP_PLACEMENT) {
            const y = Number(ev.target.getAttribute("y"));
            const x = Number(ev.target.getAttribute("x"));
            this.shipStartEndData.push([y, x]);
            if (
              this.shipStartEndData.length == 2
            ) {
              if (
                this.shipStartEndData[0][COORD_X] !=
                  this.shipStartEndData[1][COORD_X] &&
                this.shipStartEndData[0][COORD_Y] !=
                  this.shipStartEndData[1][COORD_Y]
              ) {
                alert("ERROR: Ships can not be placed diagonally.");
              } else {
                handler(...this.shipStartEndData);
              }
              this.shipStartEndData = [];
            }
          } else if (this.gameMode == GAME_MODE_BATTLE) {
            return;
          }
        });
      }
    }
  }

  bindEnemySquareClick(handler) {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        this.aiGrid[i][j].addEventListener("click", (ev) => {
          if (
            this.gameMode == GAME_MODE_BATTLE &&
            this.checkIfCanBeClicked(ev.target)
          ) {
            const y = Number(ev.target.getAttribute("y"));
            const x = Number(ev.target.getAttribute("x"));
            handler(y, x);
          }
        });
      }
    }
  }
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*****************************************!*\
  !*** ./source_code/refactoring/main.js ***!
  \*****************************************/
const Model = __webpack_require__(/*! ./model.js */ "./source_code/refactoring/model.js");
const View = __webpack_require__(/*! ./view.js */ "./source_code/refactoring/view.js");
const Controller = __webpack_require__(/*! ./controller.js */ "./source_code/refactoring/controller.js");
const { Square, Grid } = __webpack_require__(/*! ./grid.js */ "./source_code/refactoring/grid.js");

const app = new Controller(new Model(), new View());
//
//
//
app.init();
// console.log("hello");

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0Esb0JBQW9CLGVBQWU7QUFDbkMsc0JBQXNCLGVBQWU7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O1VDbExBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7Ozs7OztBQ3RCQSxjQUFjLG1CQUFPLENBQUMsc0RBQVk7QUFDbEMsYUFBYSxtQkFBTyxDQUFDLG9EQUFXO0FBQ2hDLG1CQUFtQixtQkFBTyxDQUFDLGdFQUFpQjtBQUM1QyxRQUFRLGVBQWUsRUFBRSxtQkFBTyxDQUFDLG9EQUFXOztBQUU1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zdGF0aWMvLi9zb3VyY2VfY29kZS9yZWZhY3RvcmluZy9hZ2VudF9haS5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zb3VyY2VfY29kZS9yZWZhY3RvcmluZy9hZ2VudF9wbGF5ZXIuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc291cmNlX2NvZGUvcmVmYWN0b3JpbmcvYWdlbnRzLmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NvdXJjZV9jb2RlL3JlZmFjdG9yaW5nL2NvbnN0YW50cy5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zb3VyY2VfY29kZS9yZWZhY3RvcmluZy9jb250cm9sbGVyLmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NvdXJjZV9jb2RlL3JlZmFjdG9yaW5nL2ZsZWV0LmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NvdXJjZV9jb2RlL3JlZmFjdG9yaW5nL2dyaWQuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc291cmNlX2NvZGUvcmVmYWN0b3JpbmcvaGVscGVycy5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zb3VyY2VfY29kZS9yZWZhY3RvcmluZy9tb2RlbC5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zb3VyY2VfY29kZS9yZWZhY3RvcmluZy9zaGlwLmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NvdXJjZV9jb2RlL3JlZmFjdG9yaW5nL3ZpZXcuanMiLCJ3ZWJwYWNrOi8vc3RhdGljL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3N0YXRpYy8uL3NvdXJjZV9jb2RlL3JlZmFjdG9yaW5nL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgQWdlbnQgPSByZXF1aXJlKFwiLi9hZ2VudHMuanNcIik7XG5jb25zdCBoZWxwZXJzID0gcmVxdWlyZShcIi4vaGVscGVycy5qc1wiKTtcbmNvbnN0IHsgU3F1YXJlLCBHcmlkIH0gPSByZXF1aXJlKFwiLi9ncmlkLmpzXCIpO1xuY29uc3QgV2Fyc2hpcCA9IHJlcXVpcmUoXCIuL3NoaXAuanNcIik7XG5jb25zdCBGbGVldCA9IHJlcXVpcmUoXCIuL2ZsZWV0LmpzXCIpO1xuXG5jbGFzcyBBaUFnZW50IGV4dGVuZHMgQWdlbnQge1xuICAvLyBPTEQgQ09OU1RSVUNUT1JcbiAgLy8gY29uc3RydWN0b3IoZmlyZW5kbHlGbGVldCwgZW5lbXlGbGVldCwgZW5lbXlHcmlkKSB7XG4gIC8vICAgY29uc29sZS5sb2coXCJBaUFnZW50IENvbnN0cnVjdGlvblwiKTtcbiAgLy8gICBzdXBlcihmaXJlbmRseUZsZWV0LCBlbmVteUZsZWV0LCBlbmVteUdyaWQpO1xuICAvLyAgIHRoaXMucHJldkF0dGFja3MgPSBbXTtcbiAgLy8gICB0aGlzLm1lbW9yeSA9IG51bGw7XG4gIC8vIH1cbiAgLy8gTkVXIENPTlNUUlVDVE9SXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGNvbnNvbGUubG9nKFwiUGxheWVyQWdlbnQgQ29uc3RydWN0aW9uXCIpO1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5mbGVldCA9IHRoaXMuY3JlYXRlUmFuZG9tRmxlZXQoKTtcbiAgICB0aGlzLm1lbW9yeSA9IG51bGw7XG4gICAgdGhpcy5wcmV2QXR0YWNrcyA9IFtdO1xuICB9XG5cbiAgbWVtb3Jpc2UoYXR0YWNrUmVzdWx0KSB7XG4gICAgaWYgKCF0aGlzLm1lbW9yeSkge1xuICAgICAgdGhpcy5tZW1vcnkgPSB7XG4gICAgICAgIHN1Y2Nlc3NmdWxIaXRzOiAxLFxuICAgICAgICBmaXJzdEhpdDogT2JqZWN0LmFzc2lnbihbXSwgdGhpcy5hdHRhY2tDb29yZHMpLFxuICAgICAgICBuZXh0SGl0OiBbXSxcbiAgICAgICAgZGlyZWN0aW9uOiBVUCxcbiAgICAgIH07XG4gICAgICBsZXQgaSA9IDA7XG4gICAgICB3aGlsZSAoXG4gICAgICAgICFoZWxwZXJzLmNoZWNrRGlyZWN0aW9uKFxuICAgICAgICAgIHRoaXMuYXR0YWNrQ29vcmRzLFxuICAgICAgICAgIHRoaXMubWVtb3J5LmRpcmVjdGlvbixcbiAgICAgICAgICB0aGlzLnByZXZBdHRhY2tzLFxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5tZW1vcnkuZGlyZWN0aW9uID0gRElSRUNUSU9OU1tpICsgMV07XG4gICAgICAgICsraTtcbiAgICAgIH1cbiAgICAgIHRoaXMubWVtb3J5Lm5leHRIaXQgPSBPYmplY3QuYXNzaWduKFtdLCB0aGlzLm1lbW9yeS5maXJzdEhpdCk7XG4gICAgICB0aGlzLm1lbW9yeS5uZXh0SGl0W0NPT1JEX1ldICs9IHRoaXMubWVtb3J5LmRpcmVjdGlvbltDT09SRF9ZXTtcbiAgICAgIHRoaXMubWVtb3J5Lm5leHRIaXRbQ09PUkRfWF0gKz0gdGhpcy5tZW1vcnkuZGlyZWN0aW9uW0NPT1JEX1hdO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoYXR0YWNrUmVzdWx0ID09IEhJVCkge1xuICAgICAgKyt0aGlzLm1lbW9yeS5zdWNjZXNzZnVsSGl0cztcbiAgICAgIGxldCBpID0gRElSRUNUSU9OUy5pbmRleE9mKHRoaXMubWVtb3J5LmRpcmVjdGlvbik7XG4gICAgICB3aGlsZSAoXG4gICAgICAgIGkgPCA0ICYmXG4gICAgICAgICFoZWxwZXJzLmNoZWNrRGlyZWN0aW9uKFxuICAgICAgICAgIHRoaXMuYXR0YWNrQ29vcmRzLFxuICAgICAgICAgIHRoaXMubWVtb3J5LmRpcmVjdGlvbixcbiAgICAgICAgICB0aGlzLnByZXZBdHRhY2tzLFxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgaWYgKHRoaXMubWVtb3J5LnN1Y2Nlc3NmdWxIaXRzID4gMSkge1xuICAgICAgICAgIHRoaXMubWVtb3J5LmRpcmVjdGlvbiA9IFtcbiAgICAgICAgICAgIC10aGlzLm1lbW9yeS5kaXJlY3Rpb25bQ09PUkRfWV0sXG4gICAgICAgICAgICAtdGhpcy5tZW1vcnkuZGlyZWN0aW9uW0NPT1JEX1hdLFxuICAgICAgICAgIF07XG4gICAgICAgICAgdGhpcy5tZW1vcnkubmV4dEhpdCA9IE9iamVjdC5hc3NpZ24oW10sIHRoaXMubWVtb3J5LmZpcnN0SGl0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1lbW9yeS5kaXJlY3Rpb24gPSBESVJFQ1RJT05TW2kgKyAxXTtcbiAgICAgICAgKytpO1xuICAgICAgfVxuICAgICAgaWYgKGkgPCA0KSB7XG4gICAgICAgIHRoaXMubWVtb3J5Lm5leHRIaXRbQ09PUkRfWV0gPSB0aGlzLm1lbW9yeS5uZXh0SGl0W0NPT1JEX1ldICtcbiAgICAgICAgICB0aGlzLm1lbW9yeS5kaXJlY3Rpb25bQ09PUkRfWV07XG4gICAgICAgIHRoaXMubWVtb3J5Lm5leHRIaXRbQ09PUkRfWF0gPSB0aGlzLm1lbW9yeS5uZXh0SGl0W0NPT1JEX1hdICtcbiAgICAgICAgICB0aGlzLm1lbW9yeS5kaXJlY3Rpb25bQ09PUkRfWF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1lbW9yeS5kaXJlY3Rpb24tLTtcbiAgICAgICAgdGhpcy5tZW1vcnkubmV4dEhpdCA9IE9iamVjdC5hc3NpZ24oW10sIHRoaXMubWVtb3J5LmZpcnN0SGl0KTtcbiAgICAgICAgdGhpcy5tZW1vcnkubmV4dEhpdFtDT09SRF9ZXSA9IHRoaXMubWVtb3J5Lm5leHRIaXRbQ09PUkRfWV0gK1xuICAgICAgICAgIHRoaXMubWVtb3J5LmRpcmVjdGlvbltDT09SRF9ZXTtcbiAgICAgICAgdGhpcy5tZW1vcnkubmV4dEhpdFtDT09SRF9YXSA9IHRoaXMubWVtb3J5Lm5leHRIaXRbQ09PUkRfWF0gK1xuICAgICAgICAgIHRoaXMubWVtb3J5LmRpcmVjdGlvbltDT09SRF9YXTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGF0dGFja1Jlc3VsdCA9PSBNSVNTKSB7XG4gICAgICBpZiAodGhpcy5tZW1vcnkuc3VjY2Vzc2Z1bEhpdHMgPT0gMSkge1xuICAgICAgICBsZXQgaSA9IERJUkVDVElPTlMuaW5kZXhPZih0aGlzLm1lbW9yeS5kaXJlY3Rpb24pO1xuICAgICAgICB0aGlzLm1lbW9yeS5kaXJlY3Rpb24gPSBESVJFQ1RJT05TW2kgKyAxXTtcbiAgICAgICAgd2hpbGUgKFxuICAgICAgICAgICFoZWxwZXJzLmNoZWNrRGlyZWN0aW9uKFxuICAgICAgICAgICAgdGhpcy5tZW1vcnkuZmlyc3RIaXQsXG4gICAgICAgICAgICB0aGlzLm1lbW9yeS5kaXJlY3Rpb24sXG4gICAgICAgICAgICB0aGlzLnByZXZBdHRhY2tzLFxuICAgICAgICAgIClcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhpcy5tZW1vcnkuZGlyZWN0aW9uID0gRElSRUNUSU9OU1tpICsgMV07XG4gICAgICAgICAgKytpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWVtb3J5Lm5leHRIaXQgPSBPYmplY3QuYXNzaWduKFtdLCB0aGlzLm1lbW9yeS5maXJzdEhpdCk7XG4gICAgICAgIHRoaXMubWVtb3J5Lm5leHRIaXRbQ09PUkRfWV0gPSB0aGlzLm1lbW9yeS5uZXh0SGl0W0NPT1JEX1ldICtcbiAgICAgICAgICB0aGlzLm1lbW9yeS5kaXJlY3Rpb25bQ09PUkRfWV07XG4gICAgICAgIHRoaXMubWVtb3J5Lm5leHRIaXRbQ09PUkRfWF0gPSB0aGlzLm1lbW9yeS5uZXh0SGl0W0NPT1JEX1hdICtcbiAgICAgICAgICB0aGlzLm1lbW9yeS5kaXJlY3Rpb25bQ09PUkRfWF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1lbW9yeS5kaXJlY3Rpb24gPSBbXG4gICAgICAgICAgLXRoaXMubWVtb3J5LmRpcmVjdGlvbltDT09SRF9ZXSxcbiAgICAgICAgICAtdGhpcy5tZW1vcnkuZGlyZWN0aW9uW0NPT1JEX1hdLFxuICAgICAgICBdO1xuICAgICAgICB0aGlzLm1lbW9yeS5uZXh0SGl0ID0gT2JqZWN0LmFzc2lnbihbXSwgdGhpcy5tZW1vcnkuZmlyc3RIaXQpO1xuICAgICAgICB0aGlzLm1lbW9yeS5uZXh0SGl0W0NPT1JEX1ldID0gdGhpcy5tZW1vcnkubmV4dEhpdFtDT09SRF9ZXSArXG4gICAgICAgICAgdGhpcy5tZW1vcnkuZGlyZWN0aW9uW0NPT1JEX1ldO1xuICAgICAgICB0aGlzLm1lbW9yeS5uZXh0SGl0W0NPT1JEX1hdID0gdGhpcy5tZW1vcnkubmV4dEhpdFtDT09SRF9YXSArXG4gICAgICAgICAgdGhpcy5tZW1vcnkuZGlyZWN0aW9uW0NPT1JEX1hdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldEF0dGFja0Zyb21NZW1vcnkoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oW10sIHRoaXMubWVtb3J5Lm5leHRIaXQpO1xuICB9XG5cbiAgcHVzaFN1cnJvdW5kaW5nU3F1YXJlc1RvQXJyYXkoY29vcmQsIGFycmF5KSB7XG4gICAgY29uc3QgZGlyZWN0aW9ucyA9IFtcbiAgICAgIFstMSwgLTFdLFxuICAgICAgWy0xLCAwXSxcbiAgICAgIFstMSwgMV0sXG4gICAgICBbMCwgMV0sXG4gICAgICBbMSwgMV0sXG4gICAgICBbMSwgMF0sXG4gICAgICBbMSwgLTFdLFxuICAgICAgWzAsIC0xXSxcbiAgICBdO1xuICAgIGZvciAoY29uc3QgZGlyZWN0aW9uIG9mIGRpcmVjdGlvbnMpIHtcbiAgICAgIGNvbnN0IGNoZWNrID0gW1xuICAgICAgICBjb29yZFtDT09SRF9ZXSArIGRpcmVjdGlvbltDT09SRF9ZXSxcbiAgICAgICAgY29vcmRbQ09PUkRfWF0gKyBkaXJlY3Rpb25bQ09PUkRfWF0sXG4gICAgICBdO1xuICAgICAgaWYgKFxuICAgICAgICBjaGVja1tDT09SRF9ZXSA8IDAgfHxcbiAgICAgICAgY2hlY2tbQ09PUkRfWV0gPj0gR1JJRF9TSVpFIHx8XG4gICAgICAgIGNoZWNrW0NPT1JEX1hdIDwgMCB8fFxuICAgICAgICBjaGVja1tDT09SRF9YXSA+PSBHUklEX1NJWkVcbiAgICAgICkgY29udGludWU7XG4gICAgICBpZiAoIWhlbHBlcnMuY3VzdG9tQ29udGFpbnMoYXJyYXksIGNoZWNrKSkge1xuICAgICAgICBhcnJheS5wdXNoKFtcbiAgICAgICAgICBjaGVja1tDT09SRF9ZXSxcbiAgICAgICAgICBjaGVja1tDT09SRF9YXSxcbiAgICAgICAgXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYWRkQ29vcmRzQXJvdW5kS2lsbGVkU2hpcCgpIHtcbiAgICBjb25zdCB0YXJnZXRMZW5ndGggPSB0aGlzLmVuZW15RmxlZXQuZ3JpZFxuICAgICAgLmdyaWRbdGhpcy5hdHRhY2tDb29yZHNbQ09PUkRfWV1dW3RoaXMuYXR0YWNrQ29vcmRzW0NPT1JEX1hdXTtcbiAgICBjb25zdCB0YXJnZXRTaGlwID0gdGhpcy5lbmVteUZsZWV0LmZpbmRTaGlwKFxuICAgICAgdGFyZ2V0TGVuZ3RoLFxuICAgICAgdGhpcy5hdHRhY2tDb29yZHMsXG4gICAgKTtcbiAgICAvLyBOT1QgRUZGRUNUSVZFLCBET1VCTEUgQURESVRJT04gRk9SIFNBTUUgQ09PUkRTICEhXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0YXJnZXRTaGlwLmJvZHlDb29yZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGJvZHlDb29yZCA9IHRhcmdldFNoaXAuYm9keUNvb3Jkc1tpXTtcbiAgICAgIHRoaXMucHVzaFN1cnJvdW5kaW5nU3F1YXJlc1RvQXJyYXkoYm9keUNvb3JkLCB0aGlzLnByZXZBdHRhY2tzKTtcbiAgICB9XG4gIH1cblxuICBhdHRhY2soKSB7XG4gICAgaWYgKCF0aGlzLm15VHVybikgcmV0dXJuO1xuICAgIHRyeSB7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB0aGlzLmF0dGFja0Nvb3JkcyA9IHRoaXMuZ2V0QXR0YWNrRnJvbU1lbW9yeSgpO1xuICAgICAgICBpZiAoIWhlbHBlcnMuY3VzdG9tQ29udGFpbnModGhpcy5wcmV2QXR0YWNrcywgdGhpcy5hdHRhY2tDb29yZHMpKSBicmVhaztcbiAgICAgIH1cbiAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHRoaXMuYXR0YWNrQ29vcmRzID0gW2hlbHBlcnMuZ2V0UmFuZG9tSW50KDkpLCBoZWxwZXJzLmdldFJhbmRvbUludCg5KV07XG4gICAgICAgIGlmICghaGVscGVycy5jdXN0b21Db250YWlucyh0aGlzLnByZXZBdHRhY2tzLCB0aGlzLmF0dGFja0Nvb3JkcykpIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBwYWludFNxdWFyZSh0aGlzLmF0dGFja0Nvb3Jkcyk7XG4gICAgdGhpcy5wcmV2QXR0YWNrcy5wdXNoKHRoaXMuYXR0YWNrQ29vcmRzKTtcbiAgICBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS1BSSBBVFRBQ0sgLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIpO1xuICAgIGNvbnN0IGF0dGFja1Jlc3VsdCA9IHN1cGVyLmF0dGFjaygpO1xuICAgIGlmIChhdHRhY2tSZXN1bHQgPT0gS0lMTCkge1xuICAgICAgdGhpcy5hZGRDb29yZHNBcm91bmRLaWxsZWRTaGlwKCk7XG4gICAgICB0aGlzLm1lbW9yeSA9IG51bGw7XG4gICAgfVxuICAgIGlmIChhdHRhY2tSZXN1bHQgPT0gSElUKSB7XG4gICAgICB0aGlzLm1lbW9yaXNlKGF0dGFja1Jlc3VsdCk7XG4gICAgfVxuICAgIGlmIChhdHRhY2tSZXN1bHQgPT0gTUlTUykge1xuICAgICAgaWYgKHRoaXMubWVtb3J5KSB7XG4gICAgICAgIHRoaXMubWVtb3Jpc2UoYXR0YWNrUmVzdWx0KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcGFpbnRTcXVhcmUodGhpcy5hdHRhY2tDb29yZHMpO1xuICB9XG5cbiAgZ2VuZXJhdGVTdHJpa2VDb29yZHMoKSB7XG4gICAgbGV0IGF0dGFja0Nvb3JkcztcbiAgICB0cnkge1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgYXR0YWNrQ29vcmRzID0gdGhpcy5nZXRBdHRhY2tGcm9tTWVtb3J5KCk7XG4gICAgICAgIGlmICghaGVscGVycy5jdXN0b21Db250YWlucyh0aGlzLnByZXZBdHRhY2tzLCB0aGlzLmF0dGFja0Nvb3JkcykpIGJyZWFrO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKF9lcnJvcikge1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgYXR0YWNrQ29vcmRzID0gW2hlbHBlcnMuZ2V0UmFuZG9tSW50KDkpLCBoZWxwZXJzLmdldFJhbmRvbUludCg5KV07XG4gICAgICAgIGlmICghaGVscGVycy5jdXN0b21Db250YWlucyh0aGlzLnByZXZBdHRhY2tzLCBhdHRhY2tDb29yZHMpKSBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5sb2coLi4uYXR0YWNrQ29vcmRzKTtcbiAgICByZXR1cm4gYXR0YWNrQ29vcmRzO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQWlBZ2VudDtcbiIsIi8vIGltcG9ydCB7IE1BWF9GTEVFVF9TSVpFIH0gZnJvbSBcIi4vY29uc3RhbnRzLmpzXCI7XG5cbmNvbnN0IEFnZW50ID0gcmVxdWlyZShcIi4vYWdlbnRzLmpzXCIpO1xuY29uc3QgaGVscGVycyA9IHJlcXVpcmUoXCIuL2hlbHBlcnMuanNcIik7XG4vLyBjb25zdCB7IFNxdWFyZSwgR3JpZCB9ID0gcmVxdWlyZShcIi4vZ3JpZC5qc1wiKTtcbmNvbnN0IFdhcnNoaXAgPSByZXF1aXJlKFwiLi9zaGlwLmpzXCIpO1xuLy8gY29uc3QgRmxlZXQgPSByZXF1aXJlKFwiLi9mbGVldC5qc1wiKTtcblxuY2xhc3MgUGxheWVyQWdlbnQgZXh0ZW5kcyBBZ2VudCB7XG4gIC8vIE9MRCBDT05TVFJVQ1RPUlxuICAvLyBjb25zdHJ1Y3RvcihmaXJlbmRseUZsZWV0LCBlbmVteUZsZWV0LCBlbmVteUdyaWQpIHtcbiAgLy8gICBjb25zb2xlLmxvZyhcIlBsYXllckFnZW50IENvbnN0cnVjdGlvblwiKTtcbiAgLy8gICBzdXBlcihmaXJlbmRseUZsZWV0LCBlbmVteUZsZWV0LCBlbmVteUdyaWQpO1xuICAvLyB9XG5cbiAgLy8gTkVXIENPTlNUUlVDVE9SXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgY29uc29sZS5sb2coXCJQbGF5ZXJBZ2VudCBDb25zdHJ1Y3Rpb25cIik7XG4gIH1cbiAgYXR0YWNrKCkge1xuICAgIGlmICh0aGlzLm15VHVybiAmJiB0aGlzLmF0dGFja0Nvb3JkcyAhPSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiUExBWUVSIEFUVEFDS1MtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKTtcbiAgICAgIGlmIChzdXBlci5hdHRhY2soKSA+IDApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJUT0RPOiBzZW5kIGluZm8gYWJvdXQga2lsbGVkIHNoaXBcIik7XG4gICAgICB9XG4gICAgICB0aGlzLmVuZW15RmxlZXQuZ3JpZFxuICAgICAgICAuZ3JpZFt0aGlzLmF0dGFja0Nvb3Jkc1tDT09SRF9ZXV1bdGhpcy5hdHRhY2tDb29yZHNbQ09PUkRfWF1dID0gMDtcbiAgICAgIHRoaXMuYXR0YWNrQ29vcmRzID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGFkZFNoaXBUb0ZsZWV0KHN0YXJ0LCBlbmQpIHtcbiAgICBpZiAoXG4gICAgICB0aGlzLmZsZWV0LmlzUG9zc2libGUoXG4gICAgICAgIHN0YXJ0LFxuICAgICAgICBlbmQsXG4gICAgICAgIGhlbHBlcnMuaXNIb3Jpem9udGFsKHN0YXJ0LCBlbmQpLFxuICAgICAgKVxuICAgICkge1xuICAgICAgY29uc3QgbmV3U2hpcCA9IG5ldyBXYXJzaGlwKFxuICAgICAgICBzdGFydCxcbiAgICAgICAgZW5kLFxuICAgICAgICBoZWxwZXJzLmlzSG9yaXpvbnRhbChzdGFydCwgZW5kKSxcbiAgICAgICk7XG4gICAgICBpZiAodGhpcy5mbGVldC5hZGRTaGlwKG5ld1NoaXApID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYWxlcnQoXCJFUlJPUjogV3JvbmcgdHlwZSBvZiBhIHNoaXBcIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuZmxlZXQuZ3JpZC5jb25zb2xlUmVuZGVyKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFsZXJ0KFwiV3JvbmcgQ29vcmRpbmF0ZXNcIik7XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllckFnZW50O1xuIiwiY29uc3QgeyBTcXVhcmUsIEdyaWQgfSA9IHJlcXVpcmUoXCIuL2dyaWQuanNcIik7XG5jb25zdCBXYXJzaGlwID0gcmVxdWlyZShcIi4vc2hpcC5qc1wiKTtcbmNvbnN0IEZsZWV0ID0gcmVxdWlyZShcIi4vZmxlZXQuanNcIik7XG5jb25zdCB7IEdSSURfU0laRSwgQklHR0VTVF9TSElQX0xFTiwgQ09PUkRfWCwgQ09PUkRfWSwgSElULCBNSVNTLCBLSUxMIH0gPVxuICByZXF1aXJlKFxuICAgIFwiLi9jb25zdGFudHMuanNcIixcbiAgKTtcbmNvbnN0IGhlbHBlcnMgPSByZXF1aXJlKFwiLi9oZWxwZXJzLmpzXCIpO1xuY2xhc3MgQWdlbnQge1xuICBjb25zdHJ1Y3RvcigvKiBmaXJlbmRseUZsZWV0LCBlbmVteUZsZWV0LCBlbmVteUdyaWQgKi8pIHtcbiAgICBjb25zb2xlLmxvZyhcIiAgIEFnZW50IENvbnN0cnVjdGlvblwiKTtcbiAgICAvLyBPTEQgTUVNQkVSU1xuICAgIC8vIHRoaXMuZW5lbXlHcmlkID0gZW5lbXlHcmlkO1xuICAgIC8vIHRoaXMuZmxlZXQgPSBmaXJlbmRseUZsZWV0O1xuICAgIC8vIHRoaXMuZW5lbXlGbGVldCA9IGVuZW15RmxlZXQ7XG4gICAgLy8gdGhpcy5teVR1cm4gPSB0cnVlO1xuICAgIC8vIHRoaXMuYXR0YWNrQ29vcmRzID0gdW5kZWZpbmVkO1xuICAgIC8vIE5FVyBNRU1CRVJTXG4gICAgdGhpcy5mbGVldCA9IG5ldyBGbGVldChuZXcgR3JpZCgpKTtcbiAgICB0aGlzLm15VHVybiA9IGZhbHNlO1xuICAgIHRoaXMuYXR0YWNrQ29vcmRzO1xuICB9XG5cbiAgY3JlYXRlUmFuZG9tRmxlZXQoKSB7XG4gICAgY29uc3QgcmFuZG9tR3JpZCA9IG5ldyBHcmlkKEdSSURfU0laRSk7XG4gICAgY29uc3QgcmFuZG9tRmxlZXQgPSBuZXcgRmxlZXQocmFuZG9tR3JpZCk7XG4gICAgZm9yIChcbiAgICAgIGxldCBzaGlwTGVuZ3RoID0gNDtcbiAgICAgIHJhbmRvbUZsZWV0LnNpemUgPCAxMCAmJiBzaGlwTGVuZ3RoID4gMDtcbiAgICApIHtcbiAgICAgIC8vIGNoZWNrIGlmIGxlbiBpcyBzdGlsbCBuZWVkZWRcbiAgICAgIGlmIChcbiAgICAgICAgcmFuZG9tRmxlZXQuc2hpcHNbc2hpcExlbmd0aCAtIDFdLmxlbmd0aCA+PVxuICAgICAgICAgIEJJR0dFU1RfU0hJUF9MRU4gLSAoc2hpcExlbmd0aCAtIDEpXG4gICAgICApIHtcbiAgICAgICAgc2hpcExlbmd0aC0tO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHsgc3RhcnQsIGVuZCwgZGlyZWN0aW9uIH0gPSBoZWxwZXJzLmdlbmVyYXRlUG9zc2libGVDb29yZGluYXRlcyhcbiAgICAgICAgcmFuZG9tRmxlZXQsXG4gICAgICAgIHNoaXBMZW5ndGgsXG4gICAgICApO1xuICAgICAgY29uc29sZS5sb2coXCJzdGFydDpcIiwgc3RhcnQsIFwiZW5kbDogXCIsIGVuZCwgXCJkaXJlY3Rpb246IFwiLCBkaXJlY3Rpb24pO1xuICAgICAgY29uc3QgbmV3U2hpcCA9IG5ldyBXYXJzaGlwKHN0YXJ0LCBlbmQsIGRpcmVjdGlvbik7XG4gICAgICBpZiAocmFuZG9tRmxlZXQuYWRkU2hpcChuZXdTaGlwKSA9PSB1bmRlZmluZWQpIHNoaXBMZW5ndGgtLTtcbiAgICAgIHJhbmRvbUZsZWV0LmdyaWQuY29uc29sZVJlbmRlcigpO1xuICAgIH1cbiAgICByYW5kb21GbGVldC5ncmlkLmNvbnNvbGVSZW5kZXIoKTtcbiAgICByZXR1cm4gcmFuZG9tRmxlZXQ7XG4gIH1cblxuICBjaGVja0hlYWx0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5mbGVldC5oZWFsdGg7XG4gIH1cblxuICBhdHRhY2soKSB7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBjb25zdCB0YXJnZXRMZW5ndGggPSB0aGlzLmVuZW15RmxlZXQuZ3JpZFxuICAgICAgLmdyaWRbdGhpcy5hdHRhY2tDb29yZHNbQ09PUkRfWV1dW3RoaXMuYXR0YWNrQ29vcmRzW0NPT1JEX1hdXTtcbiAgICBjb25zdCB0YXJnZXRTaGlwID0gdGhpcy5lbmVteUZsZWV0LmZpbmRTaGlwKFxuICAgICAgdGFyZ2V0TGVuZ3RoLFxuICAgICAgdGhpcy5hdHRhY2tDb29yZHMsXG4gICAgKTtcbiAgICBpZiAodGFyZ2V0U2hpcCAhPSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIHRoaXMuZW5lbXlGbGVldC5ncmlkXG4gICAgICAvLyAgIC5ncmlkW3RoaXMuYXR0YWNrQ29vcmRzW0NPT1JEX1ldXVt0aGlzLmF0dGFja0Nvb3Jkc1tDT09SRF9YXV0gPSAwO1xuICAgICAgdGhpcy5lbmVteUZsZWV0LmhlYWx0aC0tO1xuICAgICAgdGFyZ2V0U2hpcC5oZWFsdGgtLTtcbiAgICAgIGlmICh0YXJnZXRTaGlwLmhlYWx0aCkge1xuICAgICAgICByZXN1bHQgPSBISVQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVEFSR0VUIEhJVFwiKTtcbiAgICAgICAgdGhpcy5lbmVteUdyaWRbdGhpcy5hdHRhY2tDb29yZHNbQ09PUkRfWV1dW3RoaXMuYXR0YWNrQ29vcmRzW0NPT1JEX1hdXVxuICAgICAgICAgIC5jbGFzc0xpc3RcbiAgICAgICAgICAudG9nZ2xlKFxuICAgICAgICAgICAgXCJwYWludC1oaXRcIixcbiAgICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gS0lMTDtcbiAgICAgICAgY29uc29sZS5sb2coXCJUQVJHRVQgS0lMTEVEXCIpO1xuICAgICAgICBwYWludFNoaXAodGhpcy5lbmVteUdyaWQsIHRhcmdldFNoaXAsIFwicGFpbnQta2lsbGVkXCIpOyAvL1BST0JMRU0gUEFJTlRcbiAgICAgICAgcGFpbnRTdXJyb3VuZEtpbGxlZFNoaXAodGhpcy5lbmVteUdyaWQsIHRhcmdldFNoaXAsIFwicGFpbnQtbWlzc1wiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVE9ETzpmaXggdGlnaHRseSBjb3VwbGVkIHdpdGggdmlld1xuICAgICAgcmVzdWx0ID0gTUlTUztcbiAgICAgIGNvbnNvbGUubG9nKFwiVEFSR0VUIE1JU1NcIik7XG4gICAgICB0aGlzLmVuZW15R3JpZFt0aGlzLmF0dGFja0Nvb3Jkc1tDT09SRF9ZXV1bdGhpcy5hdHRhY2tDb29yZHNbQ09PUkRfWF1dXG4gICAgICAgIC5jbGFzc0xpc3RcbiAgICAgICAgLnRvZ2dsZShcbiAgICAgICAgICBcInBhaW50LW1pc3NcIixcbiAgICAgICAgKTtcbiAgICAgIHRoaXMubXlUdXJuID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgZXZhbHVhdGVTdHJpa2UoeSwgeCkge1xuICAgIGxldCByZXN1bHQ7XG4gICAgY29uc3QgdGFyZ2V0TGVuZ3RoID0gdGhpcy5mbGVldC5ncmlkLmdldFNxdWFyZSh5LCB4KS5zaGlwU2l6ZTtcbiAgICBjb25zdCB0YXJnZXRTaGlwID0gdGhpcy5mbGVldC5maW5kU2hpcChcbiAgICAgIHRhcmdldExlbmd0aCxcbiAgICAgIFt5LCB4XSxcbiAgICApO1xuICAgIHRoaXMuZmxlZXQuZ3JpZC5nZXRTcXVhcmUoeSwgeCkud2FzSGl0ID0gMTsgLy9uZXdcbiAgICBpZiAodGFyZ2V0U2hpcCAhPSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIHRoaXMuZW5lbXlGbGVldC5ncmlkXG4gICAgICAvLyAgIC5ncmlkW3RoaXMuYXR0YWNrQ29vcmRzW0NPT1JEX1ldXVt0aGlzLmF0dGFja0Nvb3Jkc1tDT09SRF9YXV0gPSAwO1xuICAgICAgdGhpcy5mbGVldC5oZWFsdGgtLTtcbiAgICAgIHRhcmdldFNoaXAuaGVhbHRoLS07XG4gICAgICBpZiAodGFyZ2V0U2hpcC5oZWFsdGgpIHtcbiAgICAgICAgcmVzdWx0ID0gSElUO1xuICAgICAgICBjb25zb2xlLmxvZyhcIlRBUkdFVCBISVRcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgPSBLSUxMO1xuICAgICAgICBjb25zb2xlLmxvZyhcIlRBUkdFVCBLSUxMRURcIik7XG4gICAgICAgIGZvciAoY29uc3Qgc3F1YXJlIG9mIHRhcmdldFNoaXAuYm9keUNvb3Jkcykge1xuICAgICAgICAgIHRoaXMuZmxlZXQuZ3JpZC5nZXRTcXVhcmUoc3F1YXJlKS5raWxsZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIHBhaW50U2hpcCh0aGlzLmVuZW15R3JpZCwgdGFyZ2V0U2hpcCwgXCJwYWludC1raWxsZWRcIik7IC8vUFJPQkxFTSBQQUlOVFxuICAgICAgICAvLyBwYWludFN1cnJvdW5kS2lsbGVkU2hpcCh0aGlzLmVuZW15R3JpZCwgdGFyZ2V0U2hpcCwgXCJwYWludC1taXNzXCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSBNSVNTO1xuICAgICAgY29uc29sZS5sb2coXCJUQVJHRVQgTUlTU1wiKTtcbiAgICAgIC8vIHRoaXMuZW5lbXlHcmlkW3RoaXMuYXR0YWNrQ29vcmRzW0NPT1JEX1ldXVt0aGlzLmF0dGFja0Nvb3Jkc1tDT09SRF9YXV1cbiAgICAgIC8vICAgLmNsYXNzTGlzdFxuICAgICAgLy8gICAudG9nZ2xlKFxuICAgICAgLy8gICAgIFwicGFpbnQtbWlzc1wiLFxuICAgICAgLy8gICApO1xuICAgICAgdGhpcy5teVR1cm4gPSB0cnVlO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhcIkhQOiBcIiwgdGhpcy5jaGVja0hlYWx0aCgpKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgdGFrZUluY29taW5nU3RyaWtlKHksIHgpIHtcbiAgICByZXR1cm4gdGhpcy5ldmFsdWF0ZVN0cmlrZSh5LCB4KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFnZW50O1xuIiwiY29uc3QgTUFYX0hFQUxUSCA9IDIwO1xuY29uc3QgQklHR0VTVF9TSElQX0xFTiA9IDQ7XG5cbmNvbnN0IEdBTUVfTU9ERV9CQVRUTEUgPSAyOyAvL1xuY29uc3QgR0FNRV9NT0RFX1NISVBfUExBQ0VNRU5UID0gMTtcbmNvbnN0IEdBTUVfTU9ERV9NRU5VID0gMDtcblxuY29uc3QgR1JJRF9TSVpFID0gMTA7XG5jb25zdCBNQVhfRkxFRVRfU0laRSA9IDEwO1xuXG5jb25zdCBDT09SRF9YID0gMTtcbmNvbnN0IENPT1JEX1kgPSAwO1xuXG5jb25zdCBNSVNTID0gMDtcbmNvbnN0IEhJVCA9IDE7XG5jb25zdCBLSUxMID0gMjtcblxuLy8gZGlyZWN0aW9uc1xuY29uc3QgVVAgPSBbLTEsIDBdO1xuY29uc3QgTEVGVCA9IFswLCAxXTtcbmNvbnN0IERPV04gPSBbMSwgMF07XG5jb25zdCBSSUdIVCA9IFswLCAtMV07XG5jb25zdCBESVJFQ1RJT05TID0gW1VQLCBMRUZULCBET1dOLCBSSUdIVF07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBNQVhfSEVBTFRILFxuICBCSUdHRVNUX1NISVBfTEVOLFxuICBHQU1FX01PREVfQkFUVExFLFxuICBHQU1FX01PREVfU0hJUF9QTEFDRU1FTlQsXG4gIEdBTUVfTU9ERV9NRU5VLFxuICBHUklEX1NJWkUsXG4gIE1BWF9GTEVFVF9TSVpFLFxuICBDT09SRF9YLFxuICBDT09SRF9ZLFxuICBNSVNTLFxuICBISVQsXG4gIEtJTEwsXG4gIFVQLFxuICBMRUZULFxuICBET1dOLFxuICBSSUdIVCxcbiAgRElSRUNUSU9OUyxcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIENvbnRyb2xsZXIge1xuICBjb25zdHJ1Y3Rvcihtb2RlbCwgdmlldykge1xuICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcbiAgICB0aGlzLnZpZXcgPSB2aWV3O1xuXG4gICAgdGhpcy5tb2RlbC5jb250cm9sbGVyID0gdGhpcztcblxuICAgIHRoaXMudmlldy5iaW5kRmlnaHRDbGljayh0aGlzLmhhbmRsZUZpZ2h0Q2xpY2suYmluZCh0aGlzKSk7XG4gICAgdGhpcy52aWV3LmJpbmRGcmllbmRseVNxdWFyZUNsaWNrKFxuICAgICAgdGhpcy5oYW5kbGVGcmllbmRseVNxdWFyZUNsaWNrLmJpbmQodGhpcyksXG4gICAgKTtcbiAgICAvLyB0aGlzLnZpZXcuYmluZEdldFNxdWFyZURhdGEodGhpcy5nZXRTcXVhcmVEYXRhLmJpbmQodGhpcykpO1xuICAgIHRoaXMudmlldy5iaW5kRW5lbXlTcXVhcmVDbGljayhcbiAgICAgIHRoaXMuaGFuZGxlRW5lbXlTcXVhcmVDbGljay5iaW5kKHRoaXMpLFxuICAgICk7XG4gICAgLy8gdGhpcy5tb2RlbC5iaW5kVXBkYXRlRnJpZW5kbHlHcmlkKHRoaXMuaGFuZGxlVXBkYXRlRnJpZW5kbHlHcmlkLmJpbmQodGhpcykpO1xuICAgIHRoaXMubW9kZWwudXBkYXRlRW5lbXlHcmlkID0gdGhpcy5oYW5kbGVVcGRhdGVFbmVteUdyaWQuYmluZCh0aGlzKTtcbiAgICB0aGlzLm1vZGVsLnVwZGF0ZUZyaWVuZGx5R3JpZCA9IHRoaXMuaGFuZGxlVXBkYXRlRnJpZW5kbHlHcmlkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5tb2RlbC51cGRhdGVHYW1lTW9kZSA9IHRoaXMuaGFuZGxlVXBkYXRlR2FtZU1vZGUuYmluZCh0aGlzKTtcbiAgICAvLyB0aGlzLm1vZGVsLnVwZGF0ZUZyaWVuZGx5U3F1YXJlID0gdGhpcy5oYW5kbGVVcGRhdGVGcmllbmRseVNxdWFyZS5iaW5kKFxuICAgIC8vICAgdGhpcyxcbiAgICAvLyApO1xuICB9XG5cbiAgZ2V0U3F1YXJlRGF0YShpc0ZyaWVuZGx5LCB5LCB4KSB7XG4gICAgaWYgKGlzRnJpZW5kbHkpIHtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMubW9kZWwucGxheWVyQWdlbnQuZmxlZXQuZ3JpZC5nZXRTcXVhcmUoeSwgeCkuaGFzU2hpcCk7XG4gICAgICByZXR1cm4gdGhpcy5tb2RlbC5wbGF5ZXJBZ2VudC5mbGVldC5ncmlkLmdldFNxdWFyZSh5LCB4KS5oYXNTaGlwO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5tb2RlbC5haUFnZW50LmZsZWV0LmdyaWQuZ2V0U3F1YXJlKHksIHgpLmhhc1NoaXA7XG4gICAgfVxuICB9XG5cbiAgaW5pdCgpIHtcbiAgICBjb25zb2xlLmxvZyhcImhlbGxvXCIpO1xuICB9XG5cbiAgaGFuZGxlRmlnaHRDbGljaygpIHtcbiAgICB0aGlzLm1vZGVsLmluaXRTZXNzaW9uKCk7XG4gICAgdGhpcy52aWV3LnNldFNjb3JlSWNvbnMoKTtcbiAgfVxuXG4gIGhhbmRsZUZyaWVuZGx5U3F1YXJlQ2xpY2soc3RhcnQsIGVuZCkge1xuICAgIHRoaXMubW9kZWwuYWRkUGxheWVyU2hpcChzdGFydCwgZW5kKTtcbiAgfVxuXG4gIGhhbmRsZUVuZW15U3F1YXJlQ2xpY2soeSwgeCkge1xuICAgIHRoaXMubW9kZWwuaW5pdEdhbWVUdXJuKHksIHgpO1xuICB9XG5cbiAgLy8gaGFuZGxlVXBkYXRlRnJpZW5kbHlTcXVhcmUoKSB7XG4gIC8vICAgdGhpcy52aWV3LnVwZGF0ZUZyaWVuZGx5R3JpZCh0aGlzLm1vZGVsLnBsYXllckFnZW50LmZsZWV0LmdyaWQuZ3JpZCk7XG4gIC8vIH1cblxuICBoYW5kbGVVcGRhdGVGcmllbmRseUdyaWQoKSB7XG4gICAgdGhpcy52aWV3LnJlZHJhd0ZyaWVuZGx5R3JpZCh0aGlzLm1vZGVsLnBsYXllckFnZW50LmZsZWV0LmdyaWQuZ3JpZCk7XG4gIH1cbiAgaGFuZGxlVXBkYXRlRW5lbXlHcmlkKCkge1xuICAgIHRoaXMudmlldy5yZWRyYXdFbmVteUdyaWQodGhpcy5tb2RlbC5haUFnZW50LmZsZWV0LmdyaWQuZ3JpZCk7XG4gIH1cbiAgaGFuZGxlVXBkYXRlR2FtZU1vZGUoKSB7XG4gICAgdGhpcy52aWV3LmdldEdhbWVNb2RlKHRoaXMubW9kZWwuZ2FtZU1vZGUpO1xuICB9XG59O1xuIiwiY29uc3QgaGVscGVycyA9IHJlcXVpcmUoXCIuL2hlbHBlcnMuanNcIik7XG5cbmNvbnN0IHtcbiAgTUFYX0hFQUxUSCxcbiAgQklHR0VTVF9TSElQX0xFTixcbiAgR1JJRF9TSVpFLFxuICBNQVhfRkxFRVRfU0laRSxcbiAgQ09PUkRfWCxcbiAgQ09PUkRfWSxcbiAgTUlTUyxcbiAgSElULFxuICBLSUxMLFxuICBVUCxcbiAgTEVGVCxcbiAgRE9XTixcbiAgUklHSFQsXG4gIERJUkVDVElPTlMsXG59ID0gcmVxdWlyZShcIi4vY29uc3RhbnRzLmpzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEZsZWV0IHtcbiAgY29uc3RydWN0b3IoZ3JpZCkge1xuICAgIHRoaXMuc2hpcHMgPSBbW10sIFtdLCBbXSwgW11dO1xuICAgIHRoaXMuc2l6ZSA9IDA7XG4gICAgdGhpcy5ncmlkID0gZ3JpZDtcbiAgICB0aGlzLmhlYWx0aCA9IE1BWF9IRUFMVEg7XG4gIH1cblxuICBhZGRTaGlwKG5ld1NoaXApIHtcbiAgICAvLyBuZXh0IGlmIHN0YXRlbWVudCBjaGVjayBpZiBmbGVldCBhbGxvd2VkIHRvIGhhdmUgYW5vdGhlciBzaGlwIG9mIGN1cnRhaW4gbGVuXG4gICAgaWYgKG5ld1NoaXAgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgdGhpcy5zaGlwc1tuZXdTaGlwLmxlbiAtIDFdLmxlbmd0aCA8IEJJR0dFU1RfU0hJUF9MRU4gLSAobmV3U2hpcC5sZW4gLSAxKVxuICAgICkge1xuICAgICAgdGhpcy5zaGlwc1tuZXdTaGlwLmxlbiAtIDFdLnB1c2gobmV3U2hpcCk7XG4gICAgICB0aGlzLnBsYWNlU2hpcE9uR3JpZChuZXdTaGlwKTtcbiAgICAgICsrdGhpcy5zaXplO1xuICAgICAgcmV0dXJuIG5ld1NoaXA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgcGxhY2VTaGlwT25HcmlkKG5ld1NoaXApIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5ld1NoaXAubGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IHlDb29yZCA9IG5ld1NoaXAuYm9keUNvb3Jkc1tpXVtDT09SRF9ZXTtcbiAgICAgIGNvbnN0IHhDb29yZCA9IG5ld1NoaXAuYm9keUNvb3Jkc1tpXVtDT09SRF9YXTtcbiAgICAgIC8vIHRoaXMuZ3JpZC5ncmlkW3lDb29yZF1beENvb3JkXSA9IG5ld1NoaXAubGVuO1xuICAgICAgdGhpcy5ncmlkLmdldFNxdWFyZSh5Q29vcmQsIHhDb29yZCkuc2hpcFNpemUgPSBuZXdTaGlwLmxlbjtcbiAgICAgIHRoaXMuZ3JpZC5nZXRTcXVhcmUoeUNvb3JkLCB4Q29vcmQpLmhhc1NoaXAgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGZpbmRTaGlwKGxlbmd0aCwgYm9keUNvb3JkKSB7XG4gICAgaWYgKGxlbmd0aCA9PSAwKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCBzaGlwID0gdGhpcy5zaGlwc1tsZW5ndGggLSAxXS5maW5kKChzaGlwKSA9PiB7XG4gICAgICBjb25zdCBjaGVjayA9IHNoaXAuYm9keUNvb3Jkcy5zb21lKChjb29yZCkgPT5cbiAgICAgICAgY29vcmQuZXZlcnkoKHZhbHVlLCBpZCkgPT4gdmFsdWUgPT09IGJvZHlDb29yZFtpZF0pXG4gICAgICApO1xuICAgICAgaWYgKGNoZWNrKSByZXR1cm4gc2hpcDtcbiAgICB9KTtcbiAgICByZXR1cm4gc2hpcDtcbiAgfVxuXG4gIGNoZWNrQXJvdW5kU3F1YXJlKHNxdWFyZSkge1xuICAgIGNvbnN0IGRpcmVjdGlvbnMgPSBbXG4gICAgICBbMCwgMF0sXG4gICAgICBbLTEsIC0xXSxcbiAgICAgIFstMSwgMF0sXG4gICAgICBbLTEsIDFdLFxuICAgICAgWzAsIDFdLFxuICAgICAgWzEsIDFdLFxuICAgICAgWzEsIDBdLFxuICAgICAgWzEsIC0xXSxcbiAgICAgIFswLCAtMV0sXG4gICAgXTtcbiAgICBmdW5jdGlvbiBnZXRTcXVhcmVWYWx1ZUZyb21EaXJlY3Rpb24oZGlyZWN0aW9uKSB7XG4gICAgICAvL1RPRE86IENIQU5HRSBUUllDQVRDSCBUTyBJRiBTVEFURU1FTlQgXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXR1cm5WYWwgPSB0aGlzLmdyaWQuZ2V0U3F1YXJlKFxuICAgICAgICAgIHNxdWFyZVtDT09SRF9ZXSArIGRpcmVjdGlvbltDT09SRF9ZXSxcbiAgICAgICAgICBzcXVhcmVbQ09PUkRfWF0gKyBkaXJlY3Rpb25bQ09PUkRfWF0sXG4gICAgICAgICkuaGFzU2hpcDtcbiAgICAgICAgY29uc29sZS5sb2coXCJyZXR2YWwgaXMgXCIsIHJldHVyblZhbCk7XG5cbiAgICAgICAgaWYgKHJldHVyblZhbCA9PT0gdW5kZWZpbmVkKSB0aHJvdyBcIk91dCBvZiBhcnJheVwiO1xuICAgICAgICByZXR1cm4gcmV0dXJuVmFsO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGlyZWN0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZGlyZWN0aW9uID0gZGlyZWN0aW9uc1tpXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChnZXRTcXVhcmVWYWx1ZUZyb21EaXJlY3Rpb24uY2FsbCh0aGlzLCBkaXJlY3Rpb24pICE9IGZhbHNlKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaXNQb3NzaWJsZShzdGFydCwgZW5kLCBkaXJlY3Rpb24pIHtcbiAgICAvL2NoZWNrIGlmIGluIGdyaWRcbiAgICBpZiAoZW5kW0NPT1JEX1hdID49IEdSSURfU0laRSB8fCBlbmRbQ09PUkRfWV0gPj0gR1JJRF9TSVpFKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgbGVuID0gaGVscGVycy5jYWxjU2hpcExlbmd0aChzdGFydCwgZW5kKTtcbiAgICBjb25zb2xlLmxvZyhcImxlbmd0aCBpcyBcIiwgbGVuKTtcbiAgICBpZiAobGVuID4gQklHR0VTVF9TSElQX0xFTikgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnNvbGUubG9nKHRoaXMuY2hlY2tBcm91bmRTcXVhcmUoc3RhcnQpKTtcbiAgICByZXR1cm4gdGhpcy5jaGVja0Fyb3VuZFNxdWFyZShzdGFydCkgJiYgdGhpcy5jaGVja0Fyb3VuZFNxdWFyZShlbmQpO1xuICB9XG59O1xuIiwiY29uc3QgeyBDT09SRF9ZLCBDT09SRF9YLCBHUklEX1NJWkUgfSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50cy5qc1wiKTtcblxuY2xhc3MgU3F1YXJlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy53YXNIaXQgPSAwO1xuICAgIHRoaXMuaGFzU2hpcCA9IGZhbHNlO1xuICAgIHRoaXMuc2hpcFNpemUgPSAwO1xuICAgIHRoaXMua2lsbGVkID0gZmFsc2U7XG4gIH1cbn1cblxuY2xhc3MgR3JpZCB7XG4gIGNvbnN0cnVjdG9yKGdyaWRTaXplKSB7XG4gICAgY29uc29sZS5sb2coXCJJbnNpZGUgR1JJRCBjb25zdHJ1Y3RvclwiKTtcbiAgICBpZiAoZ3JpZFNpemUgPT0gdW5kZWZpbmVkKSB7XG4gICAgICBncmlkU2l6ZSA9IEdSSURfU0laRTtcbiAgICB9XG4gICAgdGhpcy5ncmlkID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBncmlkU2l6ZTsgaSsrKSB7XG4gICAgICB0aGlzLmdyaWRbaV0gPSBbXTtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgZ3JpZFNpemU7IGorKykge1xuICAgICAgICB0aGlzLmdyaWRbaV0ucHVzaChuZXcgU3F1YXJlKCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldFNxdWFyZSh5LCB4KSB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoeSlcbiAgICAgID8gdGhpcy5ncmlkW3lbQ09PUkRfWV1dW3lbQ09PUkRfWF1dXG4gICAgICA6IHRoaXMuZ3JpZFt5XVt4XTtcbiAgfVxuXG4gIGNvbnNvbGVSZW5kZXIoKSB7XG4gICAgY29uc29sZS5sb2coXCIgIDAgMSAyIDMgNCA1IDYgNyA4IDlcIik7XG4gICAgbGV0IHJlc3VsdFN0cmluZyA9IFwiXCI7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmdyaWQubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdFN0cmluZyArPSBgJHtpfSBgO1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLmdyaWRbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgbGV0IG91dHB1dFNxdWFyZVN0cmluZyA9ICh0aGlzLmdyaWRbaV1bal0uc2hpcFNpemUgPT0gMClcbiAgICAgICAgICA/IFwiLiBcIlxuICAgICAgICAgIDogYCR7dGhpcy5nZXRTcXVhcmUoaSwgaikuc2hpcFNpemV9IGA7XG4gICAgICAgIGlmICh0aGlzLmdldFNxdWFyZShpLCBqKS53YXNIaXQgIT0gMCkge1xuICAgICAgICAgIG91dHB1dFNxdWFyZVN0cmluZyA9IG91dHB1dFNxdWFyZVN0cmluZy5yZXBsYWNlKFwiLlwiLCBcIm9cIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZ2V0U3F1YXJlKGksIGopLmtpbGxlZCA9PSB0cnVlKSB7XG4gICAgICAgICAgb3V0cHV0U3F1YXJlU3RyaW5nID0gb3V0cHV0U3F1YXJlU3RyaW5nLnJlcGxhY2UoXG4gICAgICAgICAgICBgJHt0aGlzLmdldFNxdWFyZShpLCBqKS5zaGlwU2l6ZX1gLFxuICAgICAgICAgICAgXCJ4XCIsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRTdHJpbmcgKz0gb3V0cHV0U3F1YXJlU3RyaW5nO1xuICAgICAgfVxuICAgICAgcmVzdWx0U3RyaW5nICs9IFwiXFxuXCI7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKHJlc3VsdFN0cmluZyk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7IFNxdWFyZSwgR3JpZCB9O1xuIiwiY29uc3QgeyBDT09SRF9YLCBDT09SRF9ZLCBHUklEX1NJWkUgfSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50cy5qc1wiKTtcblxuZnVuY3Rpb24gZ2VuZXJhdGVQb3NzaWJsZUNvb3JkaW5hdGVzKGZsZWV0LCBsZW4pIHtcbiAgbGV0IHN0YXJ0LCBlbmQsIGRpcmVjdGlvbjtcbiAgd2hpbGUgKHRydWUpIHtcbiAgICBzdGFydCA9IFtnZXRSYW5kb21JbnQoR1JJRF9TSVpFIC0gMSksIGdldFJhbmRvbUludChHUklEX1NJWkUgLSAxKV07XG4gICAgZGlyZWN0aW9uID0gZ2V0UmFuZG9tSW50KDEpOyAvL2RpcmVjdGlvbiBob3Jpem9udGFsIG9yIHZlcnRpY2FsXG4gICAgZW5kID0gKGRpcmVjdGlvbiA9PSBDT09SRF9YKVxuICAgICAgPyBbc3RhcnRbQ09PUkRfWV0sIHN0YXJ0W0NPT1JEX1hdICsgbGVuIC0gMV1cbiAgICAgIDogW3N0YXJ0W0NPT1JEX1ldICsgbGVuIC0gMSwgc3RhcnRbQ09PUkRfWF1dO1xuICAgIGlmIChmbGVldC5pc1Bvc3NpYmxlKHN0YXJ0LCBlbmQsIGRpcmVjdGlvbikpIHtcbiAgICAgIHJldHVybiB7IHN0YXJ0LCBlbmQsIGRpcmVjdGlvbiB9O1xuICAgIH1cbiAgfVxufVxuZnVuY3Rpb24gY2FsY1NoaXBMZW5ndGgoc3RhcnQsIGVuZCkge1xuICByZXR1cm4gKChzdGFydFtDT09SRF9YXSA9PSBlbmRbQ09PUkRfWF0pXG4gICAgPyBNYXRoLmFicyhzdGFydFtDT09SRF9ZXSAtIGVuZFtDT09SRF9ZXSlcbiAgICA6IE1hdGguYWJzKHN0YXJ0W0NPT1JEX1hdIC0gZW5kW0NPT1JEX1hdKSkgKyAxO1xufVxuXG5mdW5jdGlvbiBnZXRSYW5kb21JbnQobWF4KSB7XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4ICsgMSkpO1xufVxuXG5mdW5jdGlvbiBpc0hvcml6b250YWwoc3RhcnQsIGVuZCkge1xuICByZXR1cm4gKHN0YXJ0W0NPT1JEX1ldID09IGVuZFtDT09SRF9ZXSkgPyAxIDogMDtcbn1cbmZ1bmN0aW9uIGN1c3RvbUNvbnRhaW5zKGFycmF5LCBlbGVtZW50KSB7XG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhcnJheS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICBjb25zdCBlbCA9IGFycmF5W2luZGV4XTtcbiAgICBpZiAoZWxbMF0gPT09IGVsZW1lbnRbMF0gJiYgZWxbMV0gPT09IGVsZW1lbnRbMV0pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBjaGVja0RpcmVjdGlvbihjdXJyZW50Q29vcmQsIGRpcmVjdGlvbiwgcHJldkF0dGFja3MpIHtcbiAgY29uc3QgY2hlY2sgPSBbXG4gICAgY3VycmVudENvb3JkW0NPT1JEX1ldICsgZGlyZWN0aW9uW0NPT1JEX1ldLFxuICAgIGN1cnJlbnRDb29yZFtDT09SRF9YXSArIGRpcmVjdGlvbltDT09SRF9YXSxcbiAgXTtcbiAgaWYgKFxuICAgIGNoZWNrW0NPT1JEX1ldIDwgMCB8fFxuICAgIGNoZWNrW0NPT1JEX1ldID49IEdSSURfU0laRSB8fFxuICAgIGNoZWNrW0NPT1JEX1hdIDwgMCB8fFxuICAgIGNoZWNrW0NPT1JEX1hdID49IEdSSURfU0laRSB8fFxuICAgIGN1c3RvbUNvbnRhaW5zKHByZXZBdHRhY2tzLCBjaGVjaylcbiAgKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzSG9yaXpvbnRhbCxcbiAgZ2VuZXJhdGVQb3NzaWJsZUNvb3JkaW5hdGVzLFxuICBjYWxjU2hpcExlbmd0aCxcbiAgZ2V0UmFuZG9tSW50LFxuICBjdXN0b21Db250YWlucyxcbiAgY2hlY2tEaXJlY3Rpb24sXG59O1xuIiwiY29uc3QgQWlBZ2VudCA9IHJlcXVpcmUoXCIuL2FnZW50X2FpLmpzXCIpO1xuY29uc3QgUGxheWVyQWdlbnQgPSByZXF1aXJlKFwiLi9hZ2VudF9wbGF5ZXIuanNcIik7XG5jb25zdCB7XG4gIC8vIE1BWF9IRUFMVEgsXG4gIC8vIEJJR0dFU1RfU0hJUF9MRU4sXG4gIEdBTUVfTU9ERV9CQVRUTEUsXG4gIEdBTUVfTU9ERV9TSElQX1BMQUNFTUVOVCxcbiAgR0FNRV9NT0RFX01FTlUsXG4gIC8vIEdSSURfU0laRSxcbiAgTUFYX0ZMRUVUX1NJWkUsXG4gIC8vIENPT1JEX1gsXG4gIC8vIENPT1JEX1ksXG4gIE1JU1MsXG4gIC8vIEhJVCxcbiAgLy8gS0lMTCxcbiAgLy8gVVAsXG4gIC8vIExFRlQsXG4gIC8vIERPV04sXG4gIC8vIFJJR0hULFxuICAvLyBESVJFQ1RJT05TLFxufSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50cy5qc1wiKTtcblxuY2xhc3MgTW9kZWwge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmdhbWVNb2RlID0gR0FNRV9NT0RFX01FTlU7XG4gICAgdGhpcy5haUFnZW50O1xuICAgIHRoaXMucGxheWVyQWdlbnQ7XG4gICAgdGhpcy51cGRhdGVGcmllbmRseUdyaWQgPSBudWxsO1xuICAgIHRoaXMudXBkYXRlRW5lbXlHcmlkID0gbnVsbDtcbiAgICB0aGlzLnVwZGF0ZUdhbWVNb2RlID0gbnVsbDtcbiAgfVxuXG4gIGluaXRTZXNzaW9uKCkge1xuICAgIGNvbnNvbGUubG9nKFwiU0VTU0lPTiBTVEFSVEVEXCIpO1xuICAgIHRoaXMuYWlBZ2VudCA9IG5ldyBBaUFnZW50KCk7XG4gICAgdGhpcy5wbGF5ZXJBZ2VudCA9IG5ldyBQbGF5ZXJBZ2VudCgpO1xuICAgIC8vIHRoaXMudXBkYXRlRnJpZW5kbHlHcmlkKCk7XG4gICAgLy8gdGhpcy51cGRhdGVFbmVteUdyaWQoKTtcbiAgICB0aGlzLmluaXRTaGlwUGxhY2VtZW50KCk7XG4gIH1cblxuICBpbml0U2hpcFBsYWNlbWVudCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIk1vZGU6IFNoaXAgcGxhY2VtZW50XCIpO1xuICAgIHRoaXMuc2V0R2FtZU1vZGUoR0FNRV9NT0RFX1NISVBfUExBQ0VNRU5UKTtcbiAgICB0aGlzLnBsYXllckFnZW50LmZsZWV0ID0gdGhpcy5wbGF5ZXJBZ2VudC5jcmVhdGVSYW5kb21GbGVldCgpO1xuICAgIHRoaXMuY2hlY2tGbGVldFNpemUoKTtcbiAgfVxuXG4gIGluaXRHYW1lVHVybih5LCB4KSB7XG4gICAgY29uc29sZS5sb2coYFR1cm46IHkgPSAke3l9OyB4ID0gJHt4fWApO1xuICAgIGlmICh0aGlzLmFpQWdlbnQudGFrZUluY29taW5nU3RyaWtlKHksIHgpID09IE1JU1MpIHtcbiAgICAgIHRoaXMudXBkYXRlRW5lbXlHcmlkKCk7XG4gICAgICB3aGlsZSAoXG4gICAgICAgIHRoaXMucGxheWVyQWdlbnQudGFrZUluY29taW5nU3RyaWtlKFxuICAgICAgICAgIC4uLnRoaXMuYWlBZ2VudC5nZW5lcmF0ZVN0cmlrZUNvb3JkcygpLFxuICAgICAgICApICE9IE1JU1NcbiAgICAgICkge1xuICAgICAgICB0aGlzLmNoZWNrU2NvcmUoKTtcbiAgICAgICAgdGhpcy51cGRhdGVGcmllbmRseUdyaWQoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudXBkYXRlRnJpZW5kbHlHcmlkKCk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlRW5lbXlHcmlkKCk7XG4gICAgdGhpcy5jaGVja1Njb3JlKCk7XG4gIH1cblxuICBjaGVja1Njb3JlKCkge1xuICAgIGNvbnN0IHBsYXllckhQID0gdGhpcy5wbGF5ZXJBZ2VudC5jaGVja0hlYWx0aCgpO1xuICAgIGNvbnN0IGFpSFAgPSB0aGlzLmFpQWdlbnQuY2hlY2tIZWFsdGgoKTtcbiAgICBpZiAoXG4gICAgICBwbGF5ZXJIUCA9PSAwIHx8IGFpSFAgPT0gMFxuICAgICkge1xuICAgICAgdGhpcy5zZXRHYW1lTW9kZShHQU1FX01PREVfTUVOVSk7XG4gICAgICBpZiAocGxheWVySFAgPiBhaUhQKSB7XG4gICAgICAgIHJldHVybiBcIllPVSBXT05cIjtcbiAgICAgIH0gZWxzZSBpZiAoYWlIUCA8IHBsYXllckhQKSB7XG4gICAgICAgIHJldHVybiBcIllPVSBMT1NUXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gXCJEUkFXXCI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYW5ub3VuY2VXaW5uZXIoKSB7XG4gIH1cblxuICBhZGRQbGF5ZXJTaGlwKHN0YXJ0LCBlbmQpIHtcbiAgICBjb25zb2xlLmxvZyhcInZpZXcgZGF0YSByZWNpZXZlZCBpbiBjb250cm9sbGVyOiBcIiwgc3RhcnQsIGVuZCk7XG4gICAgdGhpcy5wbGF5ZXJBZ2VudC5hZGRTaGlwVG9GbGVldChzdGFydCwgZW5kKTtcbiAgICB0aGlzLnVwZGF0ZUZyaWVuZGx5R3JpZCgpO1xuICAgIHRoaXMuY2hlY2tGbGVldFNpemUoKTtcbiAgfVxuXG4gIHNldEdhbWVNb2RlKG1vZGUpIHtcbiAgICB0aGlzLmdhbWVNb2RlID0gbW9kZTtcbiAgICB0aGlzLnVwZGF0ZUdhbWVNb2RlKHRoaXMuZ2FtZU1vZGUpO1xuICB9XG5cbiAgY2hlY2tGbGVldFNpemUoKSB7XG4gICAgaWYgKHRoaXMucGxheWVyQWdlbnQuZmxlZXQuc2l6ZSA9PSBNQVhfRkxFRVRfU0laRSkge1xuICAgICAgdGhpcy5zZXRHYW1lTW9kZShHQU1FX01PREVfQkFUVExFKTtcbiAgICAgIHRoaXMudXBkYXRlRnJpZW5kbHlHcmlkKCk7XG4gICAgICB0aGlzLnVwZGF0ZUVuZW15R3JpZCgpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVsO1xuIiwiY29uc3QgeyBDT09SRF9YLCBDT09SRF9ZIH0gPSByZXF1aXJlKFwiLi9jb25zdGFudHMuanNcIik7XG5jb25zdCBoZWxwZXJzID0gcmVxdWlyZShcIi4vaGVscGVycy5qc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBXYXJzaGlwIHtcbiAgY29uc3RydWN0b3Ioc3RhcnQsIGVuZCwgZGlyZWN0aW9uKSB7XG4gICAgdGhpcy5pc0hvcml6b250YWwgPSBkaXJlY3Rpb247XG4gICAgdGhpcy5sZW4gPSBoZWxwZXJzLmNhbGNTaGlwTGVuZ3RoKHN0YXJ0LCBlbmQpO1xuICAgIHRoaXMuaGVhbHRoID0gdGhpcy5sZW47XG4gICAgY29uc3Qgc2lnbiA9XG4gICAgICAoKHN0YXJ0W0NPT1JEX1hdID09IGVuZFtDT09SRF9YXSlcbiAgICAgICAgPyAoc3RhcnRbQ09PUkRfWV0gLSBlbmRbQ09PUkRfWV0pXG4gICAgICAgIDogKHN0YXJ0W0NPT1JEX1hdIC0gZW5kW0NPT1JEX1hdKSkgKyAxO1xuICAgIHRoaXMuYm9keUNvb3JkcyA9IFtzdGFydF07XG4gICAgbGV0IG5leHRTcXVhcmUgPSBPYmplY3QuYXNzaWduKFtdLCBzdGFydCk7XG4gICAgd2hpbGUgKHRoaXMuYm9keUNvb3Jkcy5sZW5ndGggPCB0aGlzLmxlbikge1xuICAgICAgLy8gYWRkIG9yIHN1YiBkZXBlbmRzIG9uIHdoaWNoIGNvb3JkIHdlIGNob3NlIGZpcnN0XG4gICAgICBuZXh0U3F1YXJlW2RpcmVjdGlvbl0gKz0gKHNpZ24gPD0gMCkgPyAxIDogLTE7XG4gICAgICB0aGlzLmJvZHlDb29yZHMucHVzaChuZXh0U3F1YXJlKTtcbiAgICAgIG5leHRTcXVhcmUgPSBPYmplY3QuYXNzaWduKFtdLCBuZXh0U3F1YXJlKTtcbiAgICB9XG4gIH1cbn07XG4iLCJjb25zdCB7XG4gIEJJR0dFU1RfU0hJUF9MRU4sXG4gIEdBTUVfTU9ERV9CQVRUTEUsXG4gIEdBTUVfTU9ERV9TSElQX1BMQUNFTUVOVCxcbiAgR0FNRV9NT0RFX01FTlUsXG4gIEdSSURfU0laRSxcbiAgQ09PUkRfWCxcbiAgQ09PUkRfWSxcbn0gPSByZXF1aXJlKFwiLi9jb25zdGFudHMuanNcIik7XG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFZpZXcge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnBsYXllckdyaWREaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBsYXllci1ncmlkXCIpO1xuICAgIHRoaXMuYWlHcmlkRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhaS1ncmlkXCIpO1xuICAgIHRoaXMuc3RhcnRHYW1lQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydC1nYW1lLWJ1dHRvblwiKTtcbiAgICAvL3NoaXAgc2VsZWN0aW9uXG4gICAgdGhpcy5zaGlwU2VsZWN0b3JzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInNoaXAtc2VsZWN0b3JcIik7XG4gICAgdGhpcy5zaGlwU3RhcnRFbmREYXRhID0gW107IC8vIGFycmF5XG4gICAgLy8gZGl2c1xuICAgIHRoaXMucGxheWVyR3JpZCA9IHRoaXMuY3JlYXRlR3JpZCh0aGlzLnBsYXllckdyaWREaXYpO1xuICAgIHRoaXMuYWlHcmlkID0gdGhpcy5jcmVhdGVHcmlkKHRoaXMuYWlHcmlkRGl2KTtcbiAgICB0aGlzLmdhbWVNb2RlID0gR0FNRV9NT0RFX01FTlU7XG4gIH1cblxuICBnZXRHYW1lTW9kZShnYW1lTW9kZSkge1xuICAgIGlmICh0aGlzLmdhbWVNb2RlID09IEdBTUVfTU9ERV9CQVRUTEUgJiYgZ2FtZU1vZGUgPT0gR0FNRV9NT0RFX01FTlUpIHtcbiAgICAgIHRoaXMudG9nZ2xlU3RhcnRHYW1lQnV0dG9uVmlzaWJpbGl0eSgpO1xuICAgICAgYWxlcnQoXCJHQU1FIElTIE9WRVJcIik7XG4gICAgfVxuICAgIHRoaXMuZ2FtZU1vZGUgPSBnYW1lTW9kZTtcbiAgICByZXR1cm4gZ2FtZU1vZGU7XG4gIH1cblxuICBjaGVja0lmQ2FuQmVDbGlja2VkKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gIShlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcInBhaW50LWtpbGxlZFwiKSB8fFxuICAgICAgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJwYWludC1taXNzXCIpIHx8XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcInBhaW50LWhpdFwiKSk7XG4gIH1cbiAgcmVkcmF3RnJpZW5kbHlHcmlkKGdyaWQpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IEdSSURfU0laRTsgaSsrKSB7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IEdSSURfU0laRTsgaisrKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBncmlkW2ldW2pdO1xuICAgICAgICBpZiAoZWxlbWVudC5oYXNTaGlwKSB7XG4gICAgICAgICAgdGhpcy5wbGF5ZXJHcmlkW2ldW2pdLmNsYXNzTGlzdC5hZGQoXCJwYWludC1mcmllbmRseVwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudC5raWxsZWQpIHtcbiAgICAgICAgICB0aGlzLnBsYXllckdyaWRbaV1bal0uY2xhc3NMaXN0LmFkZChcInBhaW50LWtpbGxlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudC53YXNIaXQgJiYgIWVsZW1lbnQuaGFzU2hpcCkge1xuICAgICAgICAgIHRoaXMucGxheWVyR3JpZFtpXVtqXS5jbGFzc0xpc3QuYWRkKFwicGFpbnQtbWlzc1wiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudC53YXNIaXQgJiYgZWxlbWVudC5oYXNTaGlwKSB7XG4gICAgICAgICAgdGhpcy5wbGF5ZXJHcmlkW2ldW2pdLmNsYXNzTGlzdC5hZGQoXCJwYWludC1oaXRcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZWRyYXdFbmVteUdyaWQoZ3JpZCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgR1JJRF9TSVpFOyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgR1JJRF9TSVpFOyBqKyspIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGdyaWRbaV1bal07XG4gICAgICAgIGlmIChlbGVtZW50Lmhhc1NoaXApIHtcbiAgICAgICAgICB0aGlzLmFpR3JpZFtpXVtqXS5jbGFzc0xpc3QuYWRkKFwiY2hlYXQtc2hpcHNcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW1lbnQua2lsbGVkKSB7XG4gICAgICAgICAgdGhpcy5haUdyaWRbaV1bal0uY2xhc3NMaXN0LmFkZChcInBhaW50LWtpbGxlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudC53YXNIaXQgJiYgIWVsZW1lbnQuaGFzU2hpcCkge1xuICAgICAgICAgIHRoaXMuYWlHcmlkW2ldW2pdLmNsYXNzTGlzdC5hZGQoXCJwYWludC1taXNzXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbGVtZW50Lndhc0hpdCAmJiBlbGVtZW50Lmhhc1NoaXApIHtcbiAgICAgICAgICB0aGlzLmFpR3JpZFtpXVtqXS5jbGFzc0xpc3QuYWRkKFwicGFpbnQtaGl0XCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdG9nZ2xlU3RhcnRHYW1lQnV0dG9uVmlzaWJpbGl0eSgpIHtcbiAgICB0aGlzLnN0YXJ0R2FtZUJ1dHRvbi5jbGFzc0xpc3QudG9nZ2xlKFwiaGlkZGVuXCIpO1xuICB9XG5cbiAgY3JlYXRlR3JpZChncmlkRGl2KSB7XG4gICAgY29uc3Qgc3F1YXJlcyA9IFtdO1xuICAgIC8vIERvY3VtZW50RnJhZ21lbnQgaXMgYmV0dGVyIHRoYW4gYXBwZW5kaW5nIHRvIERPTSBkaXJlY3RseVxuICAgIGNvbnN0IHRtcEdyaWQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBHUklEX1NJWkU7IGkrKykge1xuICAgICAgc3F1YXJlc1tpXSA9IFtdO1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBHUklEX1NJWkU7IGorKykge1xuICAgICAgICBjb25zdCBzcXVhcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBzcXVhcmUuY2xhc3NMaXN0LmFkZChcInNxdWFyZVwiKTtcbiAgICAgICAgc3F1YXJlLnNldEF0dHJpYnV0ZShcInlcIiwgYCR7aX1gKTtcbiAgICAgICAgc3F1YXJlLnNldEF0dHJpYnV0ZShcInhcIiwgYCR7an1gKTtcbiAgICAgICAgc3F1YXJlc1tpXVtqXSA9IHRtcEdyaWQuYXBwZW5kQ2hpbGQoc3F1YXJlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZ3JpZERpdi5hcHBlbmRDaGlsZCh0bXBHcmlkKTtcbiAgICByZXR1cm4gc3F1YXJlcztcbiAgfVxuXG4gIHJlbmRlckdyaWQoZ3JpZCwgY2FsbGJhY2spIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGdyaWQubGVuZ3RoOyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgZ3JpZC5sZW5ndGg7IGorKykge1xuICAgICAgICBjYWxsYmFjayhncmlkW2ldW2pdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXRTY29yZUljb25zKCkge1xuICAgIGNvbnN0IHNlbGVjdG9yT25lID0gQXJyYXkuZnJvbSh0aGlzLnNoaXBTZWxlY3RvcnMpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZWN0b3JPbmUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVsZW0gPSBzZWxlY3Rvck9uZVtpXTtcbiAgICAgIGxldCBzY29yZSA9IEJJR0dFU1RfU0hJUF9MRU4gLSBlbGVtLmNsYXNzTGlzdFsxXVsxXSArIDE7XG4gICAgICBjb25zdCBzY29yZURpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBjb25zdCBhcHBlbmRTeW0gPSAoZWxlbS5jbGFzc0xpc3QuY29udGFpbnMoXCJhaVwiKSkgPyBcIuKXj1wiIDogXCLil4tcIjtcbiAgICAgIHdoaWxlIChzY29yZS0tKSBzY29yZURpdi50ZXh0Q29udGVudCArPSBhcHBlbmRTeW07XG4gICAgICBlbGVtLmFwcGVuZENoaWxkKHNjb3JlRGl2KTtcbiAgICB9XG4gIH1cblxuICAvKj09PT09PT09PT09PT09PT09PT09YmluZGluZ3M9PT09PT09PT09PT09PT09PT09PT09PT09PT09Ki9cbiAgYmluZEZpZ2h0Q2xpY2soaGFuZGxlcikge1xuICAgIHRoaXMuc3RhcnRHYW1lQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICBoYW5kbGVyKCk7XG4gICAgICB0aGlzLnRvZ2dsZVN0YXJ0R2FtZUJ1dHRvblZpc2liaWxpdHkoKTtcbiAgICAgIHRoaXMuY2xlYXJQbGF5ZXJCb2FyZCgpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gZ2V0U3F1YXJlRGF0YShoYW5kbGVyKSB7XG4gIC8vICAgcmV0dXJuIGhhbmRsZXIoKTtcbiAgLy8gfVxuICBiaW5kRnJpZW5kbHlTcXVhcmVDbGljayhoYW5kbGVyKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBHUklEX1NJWkU7IGkrKykge1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBHUklEX1NJWkU7IGorKykge1xuICAgICAgICB0aGlzLnBsYXllckdyaWRbaV1bal0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldikgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLmdhbWVNb2RlID09IEdBTUVfTU9ERV9TSElQX1BMQUNFTUVOVCkge1xuICAgICAgICAgICAgY29uc3QgeSA9IE51bWJlcihldi50YXJnZXQuZ2V0QXR0cmlidXRlKFwieVwiKSk7XG4gICAgICAgICAgICBjb25zdCB4ID0gTnVtYmVyKGV2LnRhcmdldC5nZXRBdHRyaWJ1dGUoXCJ4XCIpKTtcbiAgICAgICAgICAgIHRoaXMuc2hpcFN0YXJ0RW5kRGF0YS5wdXNoKFt5LCB4XSk7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIHRoaXMuc2hpcFN0YXJ0RW5kRGF0YS5sZW5ndGggPT0gMlxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICB0aGlzLnNoaXBTdGFydEVuZERhdGFbMF1bQ09PUkRfWF0gIT1cbiAgICAgICAgICAgICAgICAgIHRoaXMuc2hpcFN0YXJ0RW5kRGF0YVsxXVtDT09SRF9YXSAmJlxuICAgICAgICAgICAgICAgIHRoaXMuc2hpcFN0YXJ0RW5kRGF0YVswXVtDT09SRF9ZXSAhPVxuICAgICAgICAgICAgICAgICAgdGhpcy5zaGlwU3RhcnRFbmREYXRhWzFdW0NPT1JEX1ldXG4gICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGFsZXJ0KFwiRVJST1I6IFNoaXBzIGNhbiBub3QgYmUgcGxhY2VkIGRpYWdvbmFsbHkuXCIpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIoLi4udGhpcy5zaGlwU3RhcnRFbmREYXRhKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0aGlzLnNoaXBTdGFydEVuZERhdGEgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ2FtZU1vZGUgPT0gR0FNRV9NT0RFX0JBVFRMRSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYmluZEVuZW15U3F1YXJlQ2xpY2soaGFuZGxlcikge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgR1JJRF9TSVpFOyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgR1JJRF9TSVpFOyBqKyspIHtcbiAgICAgICAgdGhpcy5haUdyaWRbaV1bal0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldikgPT4ge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIHRoaXMuZ2FtZU1vZGUgPT0gR0FNRV9NT0RFX0JBVFRMRSAmJlxuICAgICAgICAgICAgdGhpcy5jaGVja0lmQ2FuQmVDbGlja2VkKGV2LnRhcmdldClcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGNvbnN0IHkgPSBOdW1iZXIoZXYudGFyZ2V0LmdldEF0dHJpYnV0ZShcInlcIikpO1xuICAgICAgICAgICAgY29uc3QgeCA9IE51bWJlcihldi50YXJnZXQuZ2V0QXR0cmlidXRlKFwieFwiKSk7XG4gICAgICAgICAgICBoYW5kbGVyKHksIHgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImNvbnN0IE1vZGVsID0gcmVxdWlyZShcIi4vbW9kZWwuanNcIik7XG5jb25zdCBWaWV3ID0gcmVxdWlyZShcIi4vdmlldy5qc1wiKTtcbmNvbnN0IENvbnRyb2xsZXIgPSByZXF1aXJlKFwiLi9jb250cm9sbGVyLmpzXCIpO1xuY29uc3QgeyBTcXVhcmUsIEdyaWQgfSA9IHJlcXVpcmUoXCIuL2dyaWQuanNcIik7XG5cbmNvbnN0IGFwcCA9IG5ldyBDb250cm9sbGVyKG5ldyBNb2RlbCgpLCBuZXcgVmlldygpKTtcbi8vXG4vL1xuLy9cbmFwcC5pbml0KCk7XG4vLyBjb25zb2xlLmxvZyhcImhlbGxvXCIpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9