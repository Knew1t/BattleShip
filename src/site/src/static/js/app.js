/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./js/actions.js":
/*!***********************!*\
  !*** ./js/actions.js ***!
  \***********************/
/***/ (() => {

// handleButtonClick(1) - убил 1палубник
// handleButtonClick(2) - убил 2палубник
// handleButtonClick(3) - убил 3палубник
// handleButtonClick(4) - убил 4палубник
// handleButtonClick(5) - выиграл
// handleButtonClick(6) - проиграл

function handleButtonClick(buttonNumber) {
  alert("Вы нажали на кнопку " + buttonNumber);
  if (buttonNumber === 1) {
    fetch("/ship_kill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Дополнительные заголовки, если необходимо
      },
      body: JSON.stringify({
        ship_type: "p",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Успешный ответ от сервера:", data);
        // Обработка успешного ответа от сервера
      })
      .catch((error) => {
        console.error("Ошибка при выполнении запроса:", error);
        // Обработка ошибки
      });
  } else if (buttonNumber === 2) {
    fetch("/ship_kill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Дополнительные заголовки, если необходимо
      },
      body: JSON.stringify({
        ship_type: "pp",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Успешный ответ от сервера:", data);
        // Обработка успешного ответа от сервера
      })
      .catch((error) => {
        console.error("Ошибка при выполнении запроса:", error);
        // Обработка ошибки
      });
  } else if (buttonNumber === 3) {
    fetch("/ship_kill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Дополнительные заголовки, если необходимо
      },
      body: JSON.stringify({
        ship_type: "ppp",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Успешный ответ от сервера:", data);
        // Обработка успешного ответа от сервера
      })
      .catch((error) => {
        console.error("Ошибка при выполнении запроса:", error);
        // Обработка ошибки
      });
  } else if (buttonNumber === 4) {
    fetch("/ship_kill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Дополнительные заголовки, если необходимо
      },
      body: JSON.stringify({
        ship_type: "pppp",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Успешный ответ от сервера:", data);
        // Обработка успешного ответа от сервера
      })
      .catch((error) => {
        console.error("Ошибка при выполнении запроса:", error);
        // Обработка ошибки
      });
  } else if (buttonNumber === 5) {
    fetch("/add_match", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Дополнительные заголовки, если необходимо
      },
      body: new URLSearchParams({
        result: "1",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Успешный ответ от сервера:", data);
        // Обработка успешного ответа от сервера
      })
      .catch((error) => {
        console.error("Ошибка при выполнении запроса:", error);
        // Обработка ошибки
      });
  } else if (buttonNumber === 6) {
    fetch("/add_match", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Дополнительные заголовки, если необходимо
      },
      body: new URLSearchParams({
        result: "0",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Успешный ответ от сервера:", data);
      })
      .catch((error) => {
        console.error("Ошибка при выполнении запроса:", error);
        // Обработка ошибки
      });
  }
}


/***/ }),

/***/ "./js/agent_ai.js":
/*!************************!*\
  !*** ./js/agent_ai.js ***!
  \************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Agent = __webpack_require__(/*! ./agents.js */ "./js/agents.js");
const helpers = __webpack_require__(/*! ./helpers.js */ "./js/helpers.js");
const { Square, Grid } = __webpack_require__(/*! ./grid.js */ "./js/grid.js");
const Warship = __webpack_require__(/*! ./ship.js */ "./js/ship.js");
const Fleet = __webpack_require__(/*! ./fleet.js */ "./js/fleet.js");
const { COORD_X, COORD_Y, DIRECTIONS, UP, KILL, MISS, HIT } = __webpack_require__(
  /*! ./constants.js */ "./js/constants.js",
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


/***/ }),

/***/ "./js/agent_player.js":
/*!****************************!*\
  !*** ./js/agent_player.js ***!
  \****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Agent = __webpack_require__(/*! ./agents.js */ "./js/agents.js");
const helpers = __webpack_require__(/*! ./helpers.js */ "./js/helpers.js");
const Warship = __webpack_require__(/*! ./ship.js */ "./js/ship.js");

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


/***/ }),

/***/ "./js/agents.js":
/*!**********************!*\
  !*** ./js/agents.js ***!
  \**********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { Square, Grid } = __webpack_require__(/*! ./grid.js */ "./js/grid.js");
const Warship = __webpack_require__(/*! ./ship.js */ "./js/ship.js");
const Fleet = __webpack_require__(/*! ./fleet.js */ "./js/fleet.js");
const { GRID_SIZE, BIGGEST_SHIP_LEN, COORD_X, COORD_Y, HIT, MISS, KILL } =
  __webpack_require__(
    /*! ./constants.js */ "./js/constants.js",
  );
const helpers = __webpack_require__(/*! ./helpers.js */ "./js/helpers.js");
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


/***/ }),

/***/ "./js/constants.js":
/*!*************************!*\
  !*** ./js/constants.js ***!
  \*************************/
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

/***/ "./js/controller.js":
/*!**************************!*\
  !*** ./js/controller.js ***!
  \**************************/
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
    this.view.bindFriendlyRightClick(this.handleFriendlyRightClick.bind(this));
    this.view.bindEnemySquareClick(
      this.handleEnemySquareClick.bind(this),
    );
    this.view.bindOnCloseLose(this.handleOncloseLose.bind(this));
    this.model.updateEnemyGrid = this.handleUpdateEnemyGrid.bind(this);
    this.model.updateFriendlyGrid = this.handleUpdateFriendlyGrid.bind(this);
    this.model.updateGameMode = this.handleUpdateGameMode.bind(this);
    this.model.notifyGameOver = this.handleGameOver.bind(this);
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

  handleGameOver(result) {
    this.view.gameOverScreen(result);
  }

  handleFightClick() {
    this.model.initSession();
    // this.view.setScoreIcons();
  }

  handleFriendlySquareClick(start, end) {
    this.model.addPlayerShip(start, end);
  }
  handleFriendlyRightClick(y, x) {
    this.model.removePlayerShip(y, x);
    this.view.redrawFriendlyGrid(this.model.playerAgent.fleet.grid.grid);
  }

  handleEnemySquareClick(y, x) {
    this.model.initGameTurn(y, x);
  }

  handleUpdateFriendlyGrid() {
    this.view.redrawFriendlyGrid(this.model.playerAgent.fleet.grid.grid);
  }
  handleUpdateEnemyGrid() {
    this.view.redrawEnemyGrid(this.model.aiAgent.fleet.grid.grid);
  }
  handleUpdateGameMode() {
    this.view.getGameMode(this.model.gameMode);
  }
  handleOncloseLose(){
    this.model.sender(6);
  }
};


/***/ }),

/***/ "./js/fleet.js":
/*!*********************!*\
  !*** ./js/fleet.js ***!
  \*********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const helpers = __webpack_require__(/*! ./helpers.js */ "./js/helpers.js");

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
} = __webpack_require__(/*! ./constants.js */ "./js/constants.js");

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


/***/ }),

/***/ "./js/grid.js":
/*!********************!*\
  !*** ./js/grid.js ***!
  \********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { COORD_Y, COORD_X, GRID_SIZE } = __webpack_require__(/*! ./constants.js */ "./js/constants.js");

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


/***/ }),

/***/ "./js/helpers.js":
/*!***********************!*\
  !*** ./js/helpers.js ***!
  \***********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { COORD_X, COORD_Y, GRID_SIZE } = __webpack_require__(/*! ./constants.js */ "./js/constants.js");

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

//показывает можно ли бить по направлению не выходит ли за рамки,
//не использовалась ли клетка ранее
function checkDirection(currentCoord, direction, fleet) {
  const check = [
    currentCoord[COORD_Y] + direction[COORD_Y],
    currentCoord[COORD_X] + direction[COORD_X],
  ];
  if (
    check[COORD_Y] < 0 ||
    check[COORD_Y] >= GRID_SIZE ||
    check[COORD_X] < 0 ||
    check[COORD_X] >= GRID_SIZE ||
    fleet.grid.getSquare(check).wasUsedAsTarget == true
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

/***/ "./js/model.js":
/*!*********************!*\
  !*** ./js/model.js ***!
  \*********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const actions = __webpack_require__(/*! ./actions.js */ "./js/actions.js");
const AiAgent = __webpack_require__(/*! ./agent_ai.js */ "./js/agent_ai.js");
const PlayerAgent = __webpack_require__(/*! ./agent_player.js */ "./js/agent_player.js");
const {
  GAME_MODE_BATTLE,
  GAME_MODE_SHIP_PLACEMENT,
  GAME_MODE_MENU,
  MAX_FLEET_SIZE,
  MISS,
  KILL,
} = __webpack_require__(/*! ./constants.js */ "./js/constants.js");

class Model {
  constructor() {
    this.gameMode = GAME_MODE_MENU;
    this.aiAgent;
    this.playerAgent;
    this.updateFriendlyGrid = null;
    this.updateEnemyGrid = null;
    this.updateGameMode = null;
    this.notifyGameOver = null;
  }
  sender(buttonNumber) {
    if (buttonNumber === 1) {
      fetch("/ship_kill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Дополнительные заголовки, если необходимо
        },
        body: JSON.stringify({
          ship_type: "p",
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Успешный ответ от сервера:", data);
          // Обработка успешного ответа от сервера
        })
        .catch((error) => {
          console.error("Ошибка при выполнении запроса:", error);
          // Обработка ошибки
        });
    } else if (buttonNumber === 2) {
      fetch("/ship_kill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Дополнительные заголовки, если необходимо
        },
        body: JSON.stringify({
          ship_type: "pp",
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Успешный ответ от сервера:", data);
          // Обработка успешного ответа от сервера
        })
        .catch((error) => {
          console.error("Ошибка при выполнении запроса:", error);
          // Обработка ошибки
        });
    } else if (buttonNumber === 3) {
      fetch("/ship_kill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Дополнительные заголовки, если необходимо
        },
        body: JSON.stringify({
          ship_type: "ppp",
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Успешный ответ от сервера:", data);
          // Обработка успешного ответа от сервера
        })
        .catch((error) => {
          console.error("Ошибка при выполнении запроса:", error);
          // Обработка ошибки
        });
    } else if (buttonNumber === 4) {
      fetch("/ship_kill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Дополнительные заголовки, если необходимо
        },
        body: JSON.stringify({
          ship_type: "pppp",
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Успешный ответ от сервера:", data);
          // Обработка успешного ответа от сервера
        })
        .catch((error) => {
          console.error("Ошибка при выполнении запроса:", error);
          // Обработка ошибки
        });
    } else if (buttonNumber === 5) {
      fetch("/add_match", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          // Дополнительные заголовки, если необходимо
        },
        body: new URLSearchParams({
          result: "1",
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Успешный ответ от сервера:", data);
          // Обработка успешного ответа от сервера
        })
        .catch((error) => {
          console.error("Ошибка при выполнении запроса:", error);
          // Обработка ошибки
        });
    } else if (buttonNumber === 6) {
      fetch("/add_match", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          // Дополнительные заголовки, если необходимо
        },
        body: new URLSearchParams({
          result: "0",
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Успешный ответ от сервера:", data);
        })
        .catch((error) => {
          console.error("Ошибка при выполнении запроса:", error);
          // Обработка ошибки
        });
    }
  }

  initSession() {
    console.log("SESSION STARTED");
    this.aiAgent = new AiAgent();
    this.playerAgent = new PlayerAgent();
    this.initShipPlacement();
  }

  initShipPlacement() {
    console.log("Mode: Ship placement");
    this.setGameMode(GAME_MODE_SHIP_PLACEMENT);
    // uncomment for random player fleet
    this.playerAgent.fleet = this.playerAgent.createRandomFleet();
    this.checkFleetSize();
  }

  sendDataToServer(code) {
    if (code.killedShip != undefined) {
      console.log(`sending code ${code.killedShip.len} to server`);
      this.sender(code.killedShip.len);
    } else {
      console.log(`sending code ${code} to server`);
      this.sender(code);
    }
  }
  initGameTurn(y, x) {
    //player attacks
    const playerAttackResult = this.aiAgent.takeIncomingStrike(y, x);
    if (playerAttackResult.state == MISS) {
      //Ai attacks
      let aiAttackResults = this.playerAgent.takeIncomingStrike(
        ...this.aiAgent.generateStrikeCoords(),
      );
      while (
        this.playerAgent.checkHealth() > 0 && aiAttackResults.state != MISS
      ) {
        this.aiAgent.think(aiAttackResults);
        if (aiAttackResults == KILL) {
          this.updateFriendlyGrid();
        }
        aiAttackResults = this.playerAgent.takeIncomingStrike(
          ...this.aiAgent.generateStrikeCoords(),
        );
      }
      this.aiAgent.think(aiAttackResults);
      this.updateFriendlyGrid();
      this.checkScore();
    }
    this.sendDataToServer(playerAttackResult);
    this.updateEnemyGrid();
    this.checkScore();
  }

  checkScore() {
    if (this.gameMode == GAME_MODE_BATTLE) {
      const playerHP = this.playerAgent.checkHealth();
      const aiHP = this.aiAgent.checkHealth();
      console.table(playerHP, aiHP);
      if (
        playerHP <= 0 || aiHP <= 0
      ) {
        this.setGameMode(GAME_MODE_MENU);
        if (playerHP > aiHP) {
          this.notifyGameOver("YOU WON");
          this.sendDataToServer(5); // 5 means win for server
        } else if (aiHP > playerHP) {
          this.notifyGameOver("YOU LOST");
          this.sendDataToServer(6); // 6 means win for server
        } else if (aiHP == playerHP) {
          this.notifyGameOver("DRAW! ");
        }
      }
    }
  }

  addPlayerShip(start, end) {
    console.log("view data recieved in controller: ", start, end);
    this.playerAgent.addShipToFleet(start, end);
    this.updateFriendlyGrid();
    this.checkFleetSize();
  }
  removePlayerShip(y, x) {
    this.playerAgent.removeShip(y, x);
    this.setGameMode(GAME_MODE_SHIP_PLACEMENT);
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

/***/ "./js/ship.js":
/*!********************!*\
  !*** ./js/ship.js ***!
  \********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { COORD_X, COORD_Y } = __webpack_require__(/*! ./constants.js */ "./js/constants.js");
const helpers = __webpack_require__(/*! ./helpers.js */ "./js/helpers.js");

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

/***/ "./js/view.js":
/*!********************!*\
  !*** ./js/view.js ***!
  \********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const {
  BIGGEST_SHIP_LEN,
  GAME_MODE_BATTLE,
  GAME_MODE_SHIP_PLACEMENT,
  GAME_MODE_MENU,
  GRID_SIZE,
  COORD_X,
  COORD_Y,
} = __webpack_require__(/*! ./constants.js */ "./js/constants.js");
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

    this.resultText = document.createElement("h1");
    this.gameOverDiv = document.getElementById("game-over");
    this.gameOverDiv.children[0].appendChild(this.resultText);

    this.infoWindow = document.querySelector(".info-window");
  }

  gameOverScreen(result) {
    this.resultText.textContent = result;
    this.gameOverDiv.style.display = "block";
    this.gameOverDiv.addEventListener("click", () => {
      this.gameOverDiv.style.display = "none";
    });
  }

  setGameInfoText() {
    if (this.gameMode == GAME_MODE_MENU) {
      this.infoWindow.textContent = "";
      this.infoWindow.style.display = "none";
    } else if (this.gameMode == GAME_MODE_BATTLE) {
      this.infoWindow.textContent = "BATTLE";
      this.infoWindow.style.display = "block";
    } else if (this.gameMode == GAME_MODE_SHIP_PLACEMENT) {
      this.infoWindow.textContent = "Prepare your fleet.";
      this.infoWindow.style.display = "block";
    }
  }

  getGameMode(gameMode) {
    if (this.gameMode == GAME_MODE_BATTLE && gameMode == GAME_MODE_MENU) {
      this.toggleStartGameButtonVisibility();
    }
    this.gameMode = gameMode;
    this.setGameInfoText();
    console.log("GAME MODE: ", this.gameMode);
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
        const divElementClassList = this.playerGrid[i][j].classList;
        if (
          element.hasShip && !divElementClassList.contains("paint-friendly")
        ) {
          divElementClassList.toggle("paint-friendly");
        } else if (
          !element.hasShip && divElementClassList.contains("paint-friendly")
        ) {
          divElementClassList.toggle("paint-friendly");
        }
        if (element.killed) {
          divElementClassList.add("paint-killed");
        }
        if (element.wasHit && !element.hasShip) {
          divElementClassList.add("paint-miss");
        }
        if (element.wasHit && element.hasShip) {
          divElementClassList.add("paint-hit");
        }
      }
    }
  }

  redrawEnemyGrid(grid) {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const element = grid[i][j];
        //uncomment to see enemy ships
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
    // const selectorOne = Array.from(this.shipSelectors);
    // for (let i = 0; i < selectorOne.length; i++) {
    //   const elem = selectorOne[i];
    //   let score = BIGGEST_SHIP_LEN - elem.classList[1][1] + 1;
    //   const scoreDiv = document.createElement("div");
    //   const appendSym = (elem.classList.contains("ai")) ? "●" : "○";
    //   while (score--) scoreDiv.textContent += appendSym;
    //   elem.appendChild(scoreDiv);
    // }
  }

  clearGrid(grid) {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const element = grid[i][j].classList;
        if (
          element.contains("paint-miss") ||
          element.contains("paint-friendly") ||
          element.contains("paint-killed") ||
          element.contains("paint-hit") ||
          element.contains("cheat-ships")
        ) {
          element.remove(
            "paint-killed",
            "paint-friendly",
            "paint-miss",
            "paint-hit",
            "cheat-ships",
          );
        }
      }
    }
  }

  /*====================bindings============================*/
  bindFightClick(handler) {
    this.startGameButton.addEventListener("click", () => {
      this.clearGrid(this.playerGrid);
      this.clearGrid(this.aiGrid);
      handler();
      this.toggleStartGameButtonVisibility();
    });
  }

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
  bindFriendlyRightClick(handler) {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        this.playerGrid[i][j].addEventListener("contextmenu", (ev) => {
          if (this.gameMode == GAME_MODE_SHIP_PLACEMENT) {
            ev.preventDefault();
            if (ev.target.classList.contains("paint-friendly")) {
              const y = Number(ev.target.getAttribute("y"));
              const x = Number(ev.target.getAttribute("x"));
              handler(y, x);
            }
            return false;
          }
        }, false);
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
  bindOnCloseLose(handler) {
    self.addEventListener("beforeunload", () => {
      if (this.gameMode == GAME_MODE_BATTLE) {
        handler();
      }
    });
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
/*!********************!*\
  !*** ./js/main.js ***!
  \********************/
const Model = __webpack_require__(/*! ./model.js */ "./js/model.js");
const View = __webpack_require__(/*! ./view.js */ "./js/view.js");
const Controller = __webpack_require__(/*! ./controller.js */ "./js/controller.js");

const app = new Controller(new Model(), new View());

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVCxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVCxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esa0NBQWtDLHFCQUFxQjtBQUN2RDtBQUNBLE1BQU07QUFDTixrQ0FBa0MsTUFBTTtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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Q0EsWUFBWTtBQUNaO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsZUFBZTtBQUNuQyxzQkFBc0IsZUFBZTtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxvQkFBb0IsZUFBZTtBQUNuQyxzQkFBc0IsZUFBZTtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOzs7Ozs7O1VDcFFBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7Ozs7OztBQ3RCQSxjQUFjLG1CQUFPLENBQUMsaUNBQVk7QUFDbEMsYUFBYSxtQkFBTyxDQUFDLCtCQUFXO0FBQ2hDLG1CQUFtQixtQkFBTyxDQUFDLDJDQUFpQjs7QUFFNUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zdGF0aWMvLi9qcy9hY3Rpb25zLmpzIiwid2VicGFjazovL3N0YXRpYy8uL2pzL2FnZW50X2FpLmpzIiwid2VicGFjazovL3N0YXRpYy8uL2pzL2FnZW50X3BsYXllci5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9qcy9hZ2VudHMuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vanMvY29uc3RhbnRzLmpzIiwid2VicGFjazovL3N0YXRpYy8uL2pzL2NvbnRyb2xsZXIuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vanMvZmxlZXQuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vanMvZ3JpZC5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9qcy9oZWxwZXJzLmpzIiwid2VicGFjazovL3N0YXRpYy8uL2pzL21vZGVsLmpzIiwid2VicGFjazovL3N0YXRpYy8uL2pzL3NoaXAuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vanMvdmlldy5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vanMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBoYW5kbGVCdXR0b25DbGljaygxKSAtINGD0LHQuNC7IDHQv9Cw0LvRg9Cx0L3QuNC6XG4vLyBoYW5kbGVCdXR0b25DbGljaygyKSAtINGD0LHQuNC7IDLQv9Cw0LvRg9Cx0L3QuNC6XG4vLyBoYW5kbGVCdXR0b25DbGljaygzKSAtINGD0LHQuNC7IDPQv9Cw0LvRg9Cx0L3QuNC6XG4vLyBoYW5kbGVCdXR0b25DbGljayg0KSAtINGD0LHQuNC7IDTQv9Cw0LvRg9Cx0L3QuNC6XG4vLyBoYW5kbGVCdXR0b25DbGljayg1KSAtINCy0YvQuNCz0YDQsNC7XG4vLyBoYW5kbGVCdXR0b25DbGljayg2KSAtINC/0YDQvtC40LPRgNCw0LtcblxuZnVuY3Rpb24gaGFuZGxlQnV0dG9uQ2xpY2soYnV0dG9uTnVtYmVyKSB7XG4gIGFsZXJ0KFwi0JLRiyDQvdCw0LbQsNC70Lgg0L3QsCDQutC90L7Qv9C60YMgXCIgKyBidXR0b25OdW1iZXIpO1xuICBpZiAoYnV0dG9uTnVtYmVyID09PSAxKSB7XG4gICAgZmV0Y2goXCIvc2hpcF9raWxsXCIsIHtcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAvLyDQlNC+0L/QvtC70L3QuNGC0LXQu9GM0L3Ri9C1INC30LDQs9C+0LvQvtCy0LrQuCwg0LXRgdC70Lgg0L3QtdC+0LHRhdC+0LTQuNC80L5cbiAgICAgIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHNoaXBfdHlwZTogXCJwXCIsXG4gICAgICB9KSxcbiAgICB9KVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiByZXNwb25zZS5qc29uKCkpXG4gICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcItCj0YHQv9C10YjQvdGL0Lkg0L7RgtCy0LXRgiDQvtGCINGB0LXRgNCy0LXRgNCwOlwiLCBkYXRhKTtcbiAgICAgICAgLy8g0J7QsdGA0LDQsdC+0YLQutCwINGD0YHQv9C10YjQvdC+0LPQviDQvtGC0LLQtdGC0LAg0L7RgiDRgdC10YDQstC10YDQsFxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcItCe0YjQuNCx0LrQsCDQv9GA0Lgg0LLRi9C/0L7Qu9C90LXQvdC40Lgg0LfQsNC/0YDQvtGB0LA6XCIsIGVycm9yKTtcbiAgICAgICAgLy8g0J7QsdGA0LDQsdC+0YLQutCwINC+0YjQuNCx0LrQuFxuICAgICAgfSk7XG4gIH0gZWxzZSBpZiAoYnV0dG9uTnVtYmVyID09PSAyKSB7XG4gICAgZmV0Y2goXCIvc2hpcF9raWxsXCIsIHtcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAvLyDQlNC+0L/QvtC70L3QuNGC0LXQu9GM0L3Ri9C1INC30LDQs9C+0LvQvtCy0LrQuCwg0LXRgdC70Lgg0L3QtdC+0LHRhdC+0LTQuNC80L5cbiAgICAgIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHNoaXBfdHlwZTogXCJwcFwiLFxuICAgICAgfSksXG4gICAgfSlcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpKVxuICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCLQo9GB0L/QtdGI0L3Ri9C5INC+0YLQstC10YIg0L7RgiDRgdC10YDQstC10YDQsDpcIiwgZGF0YSk7XG4gICAgICAgIC8vINCe0LHRgNCw0LHQvtGC0LrQsCDRg9GB0L/QtdGI0L3QvtCz0L4g0L7RgtCy0LXRgtCwINC+0YIg0YHQtdGA0LLQtdGA0LBcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCLQntGI0LjQsdC60LAg0L/RgNC4INCy0YvQv9C+0LvQvdC10L3QuNC4INC30LDQv9GA0L7RgdCwOlwiLCBlcnJvcik7XG4gICAgICAgIC8vINCe0LHRgNCw0LHQvtGC0LrQsCDQvtGI0LjQsdC60LhcbiAgICAgIH0pO1xuICB9IGVsc2UgaWYgKGJ1dHRvbk51bWJlciA9PT0gMykge1xuICAgIGZldGNoKFwiL3NoaXBfa2lsbFwiLCB7XG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgLy8g0JTQvtC/0L7Qu9C90LjRgtC10LvRjNC90YvQtSDQt9Cw0LPQvtC70L7QstC60LgsINC10YHQu9C4INC90LXQvtCx0YXQvtC00LjQvNC+XG4gICAgICB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBzaGlwX3R5cGU6IFwicHBwXCIsXG4gICAgICB9KSxcbiAgICB9KVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiByZXNwb25zZS5qc29uKCkpXG4gICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcItCj0YHQv9C10YjQvdGL0Lkg0L7RgtCy0LXRgiDQvtGCINGB0LXRgNCy0LXRgNCwOlwiLCBkYXRhKTtcbiAgICAgICAgLy8g0J7QsdGA0LDQsdC+0YLQutCwINGD0YHQv9C10YjQvdC+0LPQviDQvtGC0LLQtdGC0LAg0L7RgiDRgdC10YDQstC10YDQsFxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcItCe0YjQuNCx0LrQsCDQv9GA0Lgg0LLRi9C/0L7Qu9C90LXQvdC40Lgg0LfQsNC/0YDQvtGB0LA6XCIsIGVycm9yKTtcbiAgICAgICAgLy8g0J7QsdGA0LDQsdC+0YLQutCwINC+0YjQuNCx0LrQuFxuICAgICAgfSk7XG4gIH0gZWxzZSBpZiAoYnV0dG9uTnVtYmVyID09PSA0KSB7XG4gICAgZmV0Y2goXCIvc2hpcF9raWxsXCIsIHtcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAvLyDQlNC+0L/QvtC70L3QuNGC0LXQu9GM0L3Ri9C1INC30LDQs9C+0LvQvtCy0LrQuCwg0LXRgdC70Lgg0L3QtdC+0LHRhdC+0LTQuNC80L5cbiAgICAgIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHNoaXBfdHlwZTogXCJwcHBwXCIsXG4gICAgICB9KSxcbiAgICB9KVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiByZXNwb25zZS5qc29uKCkpXG4gICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcItCj0YHQv9C10YjQvdGL0Lkg0L7RgtCy0LXRgiDQvtGCINGB0LXRgNCy0LXRgNCwOlwiLCBkYXRhKTtcbiAgICAgICAgLy8g0J7QsdGA0LDQsdC+0YLQutCwINGD0YHQv9C10YjQvdC+0LPQviDQvtGC0LLQtdGC0LAg0L7RgiDRgdC10YDQstC10YDQsFxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcItCe0YjQuNCx0LrQsCDQv9GA0Lgg0LLRi9C/0L7Qu9C90LXQvdC40Lgg0LfQsNC/0YDQvtGB0LA6XCIsIGVycm9yKTtcbiAgICAgICAgLy8g0J7QsdGA0LDQsdC+0YLQutCwINC+0YjQuNCx0LrQuFxuICAgICAgfSk7XG4gIH0gZWxzZSBpZiAoYnV0dG9uTnVtYmVyID09PSA1KSB7XG4gICAgZmV0Y2goXCIvYWRkX21hdGNoXCIsIHtcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCIsXG4gICAgICAgIC8vINCU0L7Qv9C+0LvQvdC40YLQtdC70YzQvdGL0LUg0LfQsNCz0L7Qu9C+0LLQutC4LCDQtdGB0LvQuCDQvdC10L7QsdGF0L7QtNC40LzQvlxuICAgICAgfSxcbiAgICAgIGJvZHk6IG5ldyBVUkxTZWFyY2hQYXJhbXMoe1xuICAgICAgICByZXN1bHQ6IFwiMVwiLFxuICAgICAgfSksXG4gICAgfSlcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpKVxuICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCLQo9GB0L/QtdGI0L3Ri9C5INC+0YLQstC10YIg0L7RgiDRgdC10YDQstC10YDQsDpcIiwgZGF0YSk7XG4gICAgICAgIC8vINCe0LHRgNCw0LHQvtGC0LrQsCDRg9GB0L/QtdGI0L3QvtCz0L4g0L7RgtCy0LXRgtCwINC+0YIg0YHQtdGA0LLQtdGA0LBcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCLQntGI0LjQsdC60LAg0L/RgNC4INCy0YvQv9C+0LvQvdC10L3QuNC4INC30LDQv9GA0L7RgdCwOlwiLCBlcnJvcik7XG4gICAgICAgIC8vINCe0LHRgNCw0LHQvtGC0LrQsCDQvtGI0LjQsdC60LhcbiAgICAgIH0pO1xuICB9IGVsc2UgaWYgKGJ1dHRvbk51bWJlciA9PT0gNikge1xuICAgIGZldGNoKFwiL2FkZF9tYXRjaFwiLCB7XG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiLFxuICAgICAgICAvLyDQlNC+0L/QvtC70L3QuNGC0LXQu9GM0L3Ri9C1INC30LDQs9C+0LvQvtCy0LrQuCwg0LXRgdC70Lgg0L3QtdC+0LHRhdC+0LTQuNC80L5cbiAgICAgIH0sXG4gICAgICBib2R5OiBuZXcgVVJMU2VhcmNoUGFyYW1zKHtcbiAgICAgICAgcmVzdWx0OiBcIjBcIixcbiAgICAgIH0pLFxuICAgIH0pXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHJlc3BvbnNlLmpzb24oKSlcbiAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwi0KPRgdC/0LXRiNC90YvQuSDQvtGC0LLQtdGCINC+0YIg0YHQtdGA0LLQtdGA0LA6XCIsIGRhdGEpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcItCe0YjQuNCx0LrQsCDQv9GA0Lgg0LLRi9C/0L7Qu9C90LXQvdC40Lgg0LfQsNC/0YDQvtGB0LA6XCIsIGVycm9yKTtcbiAgICAgICAgLy8g0J7QsdGA0LDQsdC+0YLQutCwINC+0YjQuNCx0LrQuFxuICAgICAgfSk7XG4gIH1cbn1cbiIsImNvbnN0IEFnZW50ID0gcmVxdWlyZShcIi4vYWdlbnRzLmpzXCIpO1xuY29uc3QgaGVscGVycyA9IHJlcXVpcmUoXCIuL2hlbHBlcnMuanNcIik7XG5jb25zdCB7IFNxdWFyZSwgR3JpZCB9ID0gcmVxdWlyZShcIi4vZ3JpZC5qc1wiKTtcbmNvbnN0IFdhcnNoaXAgPSByZXF1aXJlKFwiLi9zaGlwLmpzXCIpO1xuY29uc3QgRmxlZXQgPSByZXF1aXJlKFwiLi9mbGVldC5qc1wiKTtcbmNvbnN0IHsgQ09PUkRfWCwgQ09PUkRfWSwgRElSRUNUSU9OUywgVVAsIEtJTEwsIE1JU1MsIEhJVCB9ID0gcmVxdWlyZShcbiAgXCIuL2NvbnN0YW50cy5qc1wiLFxuKTtcblxuY2xhc3MgQWlBZ2VudCBleHRlbmRzIEFnZW50IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgY29uc29sZS5sb2coXCJQbGF5ZXJBZ2VudCBDb25zdHJ1Y3Rpb25cIik7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmZsZWV0ID0gdGhpcy5jcmVhdGVSYW5kb21GbGVldCgpO1xuICAgIHRoaXMubWVtb3J5ID0gbnVsbDtcbiAgICB0aGlzLmN1cnJlbnRBdHRhY2tDb29yZHM7XG4gIH1cblxuICB0aGluayhhdHRhY2tSZXN1bHQpIHtcbiAgICBpZiAoYXR0YWNrUmVzdWx0LnN0YXRlID09IEtJTEwpIHtcbiAgICAgIHRoaXMubWFya0FzSGl0Q29vcmRzQXJvdW5kS2lsbGVkU2hpcChcbiAgICAgICAgYXR0YWNrUmVzdWx0LmtpbGxlZFNoaXAsXG4gICAgICAgIChzcXVhcmUpID0+IHNxdWFyZS53YXNVc2VkQXNUYXJnZXQgPSB0cnVlLFxuICAgICAgKTtcbiAgICAgIHRoaXMubWVtb3J5ID0gbnVsbDtcbiAgICB9IGVsc2UgaWYgKGF0dGFja1Jlc3VsdC5zdGF0ZSA9PSBISVQpIHtcbiAgICAgIHRoaXMubWVtb3Jpc2UoYXR0YWNrUmVzdWx0LnN0YXRlKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMubWVtb3J5KSB7XG4gICAgICB0aGlzLm1lbW9yaXNlKGF0dGFja1Jlc3VsdC5zdGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgbWVtb3Jpc2UoYXR0YWNrUmVzdWx0KSB7XG4gICAgaWYgKCF0aGlzLm1lbW9yeSkge1xuICAgICAgdGhpcy5tZW1vcnkgPSB7XG4gICAgICAgIHN1Y2Nlc3NmdWxIaXRzOiAxLFxuICAgICAgICBmaXJzdEhpdDogT2JqZWN0LmFzc2lnbihbXSwgdGhpcy5jdXJyZW50QXR0YWNrQ29vcmRzKSxcbiAgICAgICAgbmV4dEhpdDogW10sXG4gICAgICAgIGRpcmVjdGlvbjogVVAsXG4gICAgICAgIHNldE5leHRIaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aGlzLm5leHRIaXRbQ09PUkRfWV0gPSB0aGlzLm5leHRIaXRbQ09PUkRfWV0gK1xuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb25bQ09PUkRfWV07XG4gICAgICAgICAgdGhpcy5uZXh0SGl0W0NPT1JEX1hdID0gdGhpcy5uZXh0SGl0W0NPT1JEX1hdICtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uW0NPT1JEX1hdO1xuICAgICAgICB9LFxuICAgICAgfTtcbiAgICAgIGxldCBpID0gMDtcbiAgICAgIHdoaWxlIChcbiAgICAgICAgIWhlbHBlcnMuY2hlY2tEaXJlY3Rpb24oXG4gICAgICAgICAgdGhpcy5jdXJyZW50QXR0YWNrQ29vcmRzLFxuICAgICAgICAgIHRoaXMubWVtb3J5LmRpcmVjdGlvbixcbiAgICAgICAgICB0aGlzLmZsZWV0LFxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5tZW1vcnkuZGlyZWN0aW9uID0gRElSRUNUSU9OU1tpICsgMV07XG4gICAgICAgICsraTtcbiAgICAgIH1cbiAgICAgIHRoaXMubWVtb3J5Lm5leHRIaXQgPSBPYmplY3QuYXNzaWduKFtdLCB0aGlzLm1lbW9yeS5maXJzdEhpdCk7XG4gICAgICB0aGlzLm1lbW9yeS5zZXROZXh0SGl0KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChhdHRhY2tSZXN1bHQgPT0gSElUKSB7XG4gICAgICArK3RoaXMubWVtb3J5LnN1Y2Nlc3NmdWxIaXRzO1xuICAgICAgbGV0IGkgPSBESVJFQ1RJT05TLmluZGV4T2YodGhpcy5tZW1vcnkuZGlyZWN0aW9uKTtcbiAgICAgIHdoaWxlIChcbiAgICAgICAgaSA8IDQgJiZcbiAgICAgICAgIWhlbHBlcnMuY2hlY2tEaXJlY3Rpb24oXG4gICAgICAgICAgdGhpcy5jdXJyZW50QXR0YWNrQ29vcmRzLFxuICAgICAgICAgIHRoaXMubWVtb3J5LmRpcmVjdGlvbixcbiAgICAgICAgICB0aGlzLmZsZWV0LFxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgaWYgKHRoaXMubWVtb3J5LnN1Y2Nlc3NmdWxIaXRzID4gMSkge1xuICAgICAgICAgIHRoaXMubWVtb3J5LmRpcmVjdGlvbiA9IFtcbiAgICAgICAgICAgIC10aGlzLm1lbW9yeS5kaXJlY3Rpb25bQ09PUkRfWV0sXG4gICAgICAgICAgICAtdGhpcy5tZW1vcnkuZGlyZWN0aW9uW0NPT1JEX1hdLFxuICAgICAgICAgIF07XG4gICAgICAgICAgdGhpcy5tZW1vcnkubmV4dEhpdCA9IE9iamVjdC5hc3NpZ24oW10sIHRoaXMubWVtb3J5LmZpcnN0SGl0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1lbW9yeS5kaXJlY3Rpb24gPSBESVJFQ1RJT05TW2kgKyAxXTtcbiAgICAgICAgKytpO1xuICAgICAgfVxuICAgICAgaWYgKGkgPCA0KSB7XG4gICAgICAgIHRoaXMubWVtb3J5LnNldE5leHRIaXQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGF0dGFja1Jlc3VsdCA9PSBNSVNTKSB7XG4gICAgICBpZiAodGhpcy5tZW1vcnkuc3VjY2Vzc2Z1bEhpdHMgPT0gMSkge1xuICAgICAgICBsZXQgaSA9IERJUkVDVElPTlMuaW5kZXhPZih0aGlzLm1lbW9yeS5kaXJlY3Rpb24pO1xuICAgICAgICB0aGlzLm1lbW9yeS5kaXJlY3Rpb24gPSBESVJFQ1RJT05TW2kgKyAxXTtcbiAgICAgICAgd2hpbGUgKFxuICAgICAgICAgICFoZWxwZXJzLmNoZWNrRGlyZWN0aW9uKFxuICAgICAgICAgICAgdGhpcy5tZW1vcnkuZmlyc3RIaXQsXG4gICAgICAgICAgICB0aGlzLm1lbW9yeS5kaXJlY3Rpb24sXG4gICAgICAgICAgICB0aGlzLmZsZWV0LFxuICAgICAgICAgIClcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhpcy5tZW1vcnkuZGlyZWN0aW9uID0gRElSRUNUSU9OU1tpICsgMV07XG4gICAgICAgICAgKytpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWVtb3J5Lm5leHRIaXQgPSBPYmplY3QuYXNzaWduKFtdLCB0aGlzLm1lbW9yeS5maXJzdEhpdCk7XG4gICAgICAgIHRoaXMubWVtb3J5LnNldE5leHRIaXQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubWVtb3J5LmRpcmVjdGlvbiA9IFtcbiAgICAgICAgICAtdGhpcy5tZW1vcnkuZGlyZWN0aW9uW0NPT1JEX1ldLFxuICAgICAgICAgIC10aGlzLm1lbW9yeS5kaXJlY3Rpb25bQ09PUkRfWF0sXG4gICAgICAgIF07XG4gICAgICAgIHRoaXMubWVtb3J5Lm5leHRIaXQgPSBPYmplY3QuYXNzaWduKFtdLCB0aGlzLm1lbW9yeS5maXJzdEhpdCk7XG4gICAgICAgIHRoaXMubWVtb3J5LnNldE5leHRIaXQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRBdHRhY2tGcm9tTWVtb3J5KCkge1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKFtdLCB0aGlzLm1lbW9yeS5uZXh0SGl0KTtcbiAgfVxuXG4gIGdlbmVyYXRlU3RyaWtlQ29vcmRzKCkge1xuICAgIGlmICh0aGlzLm1lbW9yeSkge1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50QXR0YWNrQ29vcmRzID0gdGhpcy5nZXRBdHRhY2tGcm9tTWVtb3J5KCk7XG4gICAgICAgIGlmIChcbiAgICAgICAgICB0aGlzLmZsZWV0LmdyaWQuZ2V0U3F1YXJlKHRoaXMuY3VycmVudEF0dGFja0Nvb3Jkcykud2FzVXNlZEFzVGFyZ2V0ID09XG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICApIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB0aGlzLmN1cnJlbnRBdHRhY2tDb29yZHMgPSBbXG4gICAgICAgICAgaGVscGVycy5nZXRSYW5kb21JbnQoOSksXG4gICAgICAgICAgaGVscGVycy5nZXRSYW5kb21JbnQoOSksXG4gICAgICAgIF07XG4gICAgICAgIGlmIChcbiAgICAgICAgICB0aGlzLmZsZWV0LmdyaWQuZ2V0U3F1YXJlKHRoaXMuY3VycmVudEF0dGFja0Nvb3Jkcykud2FzVXNlZEFzVGFyZ2V0ID09XG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICApIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmZsZWV0LmdyaWQuZ2V0U3F1YXJlKHRoaXMuY3VycmVudEF0dGFja0Nvb3Jkcykud2FzVXNlZEFzVGFyZ2V0ID0gdHJ1ZTtcbiAgICBjb25zb2xlLmxvZyguLi50aGlzLmN1cnJlbnRBdHRhY2tDb29yZHMpO1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRBdHRhY2tDb29yZHM7XG4gIH1cbiAgZXZhbHVhdGVTdHJpa2UoeSwgeCkge1xuICAgIGNvbnNvbGUubG9nKFwiUExBWUVSIEFUVEFDS1NcIik7XG4gICAgcmV0dXJuIHN1cGVyLmV2YWx1YXRlU3RyaWtlKHksIHgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQWlBZ2VudDtcbiIsImNvbnN0IEFnZW50ID0gcmVxdWlyZShcIi4vYWdlbnRzLmpzXCIpO1xuY29uc3QgaGVscGVycyA9IHJlcXVpcmUoXCIuL2hlbHBlcnMuanNcIik7XG5jb25zdCBXYXJzaGlwID0gcmVxdWlyZShcIi4vc2hpcC5qc1wiKTtcblxuY2xhc3MgUGxheWVyQWdlbnQgZXh0ZW5kcyBBZ2VudCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgY29uc29sZS5sb2coXCJQbGF5ZXJBZ2VudCBDb25zdHJ1Y3Rpb25cIik7XG4gIH1cbiAgYXR0YWNrKCkge1xuICAgIGlmICh0aGlzLm15VHVybiAmJiB0aGlzLmF0dGFja0Nvb3JkcyAhPSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiUExBWUVSIEFUVEFDS1MtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKTtcbiAgICAgIGlmIChzdXBlci5hdHRhY2soKSA+IDApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJUT0RPOiBzZW5kIGluZm8gYWJvdXQga2lsbGVkIHNoaXBcIik7XG4gICAgICB9XG4gICAgICB0aGlzLmVuZW15RmxlZXQuZ3JpZFxuICAgICAgICAuZ3JpZFt0aGlzLmF0dGFja0Nvb3Jkc1tDT09SRF9ZXV1bdGhpcy5hdHRhY2tDb29yZHNbQ09PUkRfWF1dID0gMDtcbiAgICAgIHRoaXMuYXR0YWNrQ29vcmRzID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZVNoaXAoeSwgeCkge1xuICAgIGNvbnN0IHRhcmdldExlbmd0aCA9IHRoaXMuZmxlZXQuZ3JpZC5nZXRTcXVhcmUoeSwgeCkuc2hpcFNpemU7XG4gICAgY29uc3QgdGFyZ2V0U2hpcCA9IHRoaXMuZmxlZXQuZmluZFNoaXAoXG4gICAgICB0YXJnZXRMZW5ndGgsXG4gICAgICBbeSwgeF0sXG4gICAgKTtcbiAgICB0aGlzLmZsZWV0LnJlbW92ZVNoaXAodGFyZ2V0U2hpcCk7XG4gIH1cbiAgYWRkU2hpcFRvRmxlZXQoc3RhcnQsIGVuZCkge1xuICAgIGlmIChcbiAgICAgIHRoaXMuZmxlZXQuaXNQb3NzaWJsZShcbiAgICAgICAgc3RhcnQsXG4gICAgICAgIGVuZCxcbiAgICAgICAgaGVscGVycy5pc0hvcml6b250YWwoc3RhcnQsIGVuZCksXG4gICAgICApXG4gICAgKSB7XG4gICAgICBjb25zdCBuZXdTaGlwID0gbmV3IFdhcnNoaXAoXG4gICAgICAgIHN0YXJ0LFxuICAgICAgICBlbmQsXG4gICAgICAgIGhlbHBlcnMuaXNIb3Jpem9udGFsKHN0YXJ0LCBlbmQpLFxuICAgICAgKTtcbiAgICAgIGlmICh0aGlzLmZsZWV0LmFkZFNoaXAobmV3U2hpcCkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhbGVydChcIkVSUk9SOiBXcm9uZyB0eXBlIG9mIGEgc2hpcFwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5mbGVldC5ncmlkLmNvbnNvbGVSZW5kZXIoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWxlcnQoXCJXcm9uZyBDb29yZGluYXRlc1wiKTtcbiAgICB9XG4gIH1cbiAgZXZhbHVhdGVTdHJpa2UoeSwgeCkge1xuICAgIGNvbnNvbGUubG9nKFwiQUkgQVRUQUNLU1wiKTtcbiAgICByZXR1cm4gc3VwZXIuZXZhbHVhdGVTdHJpa2UoeSwgeCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXJBZ2VudDtcbiIsImNvbnN0IHsgU3F1YXJlLCBHcmlkIH0gPSByZXF1aXJlKFwiLi9ncmlkLmpzXCIpO1xuY29uc3QgV2Fyc2hpcCA9IHJlcXVpcmUoXCIuL3NoaXAuanNcIik7XG5jb25zdCBGbGVldCA9IHJlcXVpcmUoXCIuL2ZsZWV0LmpzXCIpO1xuY29uc3QgeyBHUklEX1NJWkUsIEJJR0dFU1RfU0hJUF9MRU4sIENPT1JEX1gsIENPT1JEX1ksIEhJVCwgTUlTUywgS0lMTCB9ID1cbiAgcmVxdWlyZShcbiAgICBcIi4vY29uc3RhbnRzLmpzXCIsXG4gICk7XG5jb25zdCBoZWxwZXJzID0gcmVxdWlyZShcIi4vaGVscGVycy5qc1wiKTtcbmNsYXNzIEFnZW50IHtcbiAgY29uc3RydWN0b3IoLyogZmlyZW5kbHlGbGVldCwgZW5lbXlGbGVldCwgZW5lbXlHcmlkICovKSB7XG4gICAgY29uc29sZS5sb2coXCIgICBBZ2VudCBDb25zdHJ1Y3Rpb25cIik7XG4gICAgdGhpcy5mbGVldCA9IG5ldyBGbGVldChuZXcgR3JpZCgpKTtcbiAgICB0aGlzLm15VHVybiA9IGZhbHNlO1xuICAgIHRoaXMuYXR0YWNrQ29vcmRzO1xuICB9XG5cbiAgY3JlYXRlUmFuZG9tRmxlZXQoKSB7XG4gICAgY29uc3QgcmFuZG9tR3JpZCA9IG5ldyBHcmlkKEdSSURfU0laRSk7XG4gICAgY29uc3QgcmFuZG9tRmxlZXQgPSBuZXcgRmxlZXQocmFuZG9tR3JpZCk7XG4gICAgZm9yIChcbiAgICAgIGxldCBzaGlwTGVuZ3RoID0gNDtcbiAgICAgIHJhbmRvbUZsZWV0LnNpemUgPCAxMCAmJiBzaGlwTGVuZ3RoID4gMDtcbiAgICApIHtcbiAgICAgIC8vIGNoZWNrIGlmIGxlbiBpcyBzdGlsbCBuZWVkZWRcbiAgICAgIGlmIChcbiAgICAgICAgcmFuZG9tRmxlZXQuc2hpcHNbc2hpcExlbmd0aCAtIDFdLmxlbmd0aCA+PVxuICAgICAgICAgIEJJR0dFU1RfU0hJUF9MRU4gLSAoc2hpcExlbmd0aCAtIDEpXG4gICAgICApIHtcbiAgICAgICAgc2hpcExlbmd0aC0tO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHsgc3RhcnQsIGVuZCwgZGlyZWN0aW9uIH0gPSBoZWxwZXJzLmdlbmVyYXRlUG9zc2libGVDb29yZGluYXRlcyhcbiAgICAgICAgcmFuZG9tRmxlZXQsXG4gICAgICAgIHNoaXBMZW5ndGgsXG4gICAgICApO1xuICAgICAgY29uc29sZS5sb2coXCJzdGFydDpcIiwgc3RhcnQsIFwiZW5kbDogXCIsIGVuZCwgXCJkaXJlY3Rpb246IFwiLCBkaXJlY3Rpb24pO1xuICAgICAgY29uc3QgbmV3U2hpcCA9IG5ldyBXYXJzaGlwKHN0YXJ0LCBlbmQsIGRpcmVjdGlvbik7XG4gICAgICBpZiAocmFuZG9tRmxlZXQuYWRkU2hpcChuZXdTaGlwKSA9PSB1bmRlZmluZWQpIHNoaXBMZW5ndGgtLTtcbiAgICAgIHJhbmRvbUZsZWV0LmdyaWQuY29uc29sZVJlbmRlcigpO1xuICAgIH1cbiAgICByYW5kb21GbGVldC5ncmlkLmNvbnNvbGVSZW5kZXIoKTtcbiAgICByZXR1cm4gcmFuZG9tRmxlZXQ7XG4gIH1cblxuICBjaGVja0hlYWx0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5mbGVldC5oZWFsdGg7XG4gIH1cblxuICBtYXJrU3Vycm91bmRpbmdDb29yZHMoY29vcmQsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgZGlyZWN0aW9ucyA9IFtcbiAgICAgIFstMSwgLTFdLFxuICAgICAgWy0xLCAwXSxcbiAgICAgIFstMSwgMV0sXG4gICAgICBbMCwgMV0sXG4gICAgICBbMSwgMV0sXG4gICAgICBbMSwgMF0sXG4gICAgICBbMSwgLTFdLFxuICAgICAgWzAsIC0xXSxcbiAgICBdO1xuICAgIGZvciAoY29uc3QgZGlyZWN0aW9uIG9mIGRpcmVjdGlvbnMpIHtcbiAgICAgIGNvbnN0IGNoZWNrID0gW1xuICAgICAgICBjb29yZFtDT09SRF9ZXSArIGRpcmVjdGlvbltDT09SRF9ZXSxcbiAgICAgICAgY29vcmRbQ09PUkRfWF0gKyBkaXJlY3Rpb25bQ09PUkRfWF0sXG4gICAgICBdO1xuICAgICAgaWYgKFxuICAgICAgICBjaGVja1tDT09SRF9ZXSA8IDAgfHxcbiAgICAgICAgY2hlY2tbQ09PUkRfWV0gPj0gR1JJRF9TSVpFIHx8XG4gICAgICAgIGNoZWNrW0NPT1JEX1hdIDwgMCB8fFxuICAgICAgICBjaGVja1tDT09SRF9YXSA+PSBHUklEX1NJWkVcbiAgICAgICkgY29udGludWU7XG4gICAgICAvLyB0aGlzLmZsZWV0LmdyaWQuZ2V0U3F1YXJlKGNoZWNrKS53YXNVc2VkQXNUYXJnZXQgPSB0cnVlO1xuICAgICAgY2FsbGJhY2sodGhpcy5mbGVldC5ncmlkLmdldFNxdWFyZShjaGVjaykpO1xuICAgICAgLy8gdGhpcy5mbGVldC5ncmlkLmdldFNxdWFyZShjaGVjaykud2FzSGl0ID0gMTtcbiAgICB9XG4gIH1cbiAgbWFya0FzSGl0Q29vcmRzQXJvdW5kS2lsbGVkU2hpcCh0YXJnZXRTaGlwLCBjYWxsYmFjaykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGFyZ2V0U2hpcC5sZW47IGkrKykge1xuICAgICAgY29uc3QgYm9keUNvb3JkID0gdGFyZ2V0U2hpcC5ib2R5Q29vcmRzW2ldO1xuICAgICAgdGhpcy5tYXJrU3Vycm91bmRpbmdDb29yZHMoYm9keUNvb3JkLCBjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgZXZhbHVhdGVTdHJpa2UoeSwgeCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGNvbnN0IHRhcmdldExlbmd0aCA9IHRoaXMuZmxlZXQuZ3JpZC5nZXRTcXVhcmUoeSwgeCkuc2hpcFNpemU7XG4gICAgY29uc3QgdGFyZ2V0U2hpcCA9IHRoaXMuZmxlZXQuZmluZFNoaXAoXG4gICAgICB0YXJnZXRMZW5ndGgsXG4gICAgICBbeSwgeF0sXG4gICAgKTtcbiAgICB0aGlzLmZsZWV0LmdyaWQuZ2V0U3F1YXJlKHksIHgpLndhc0hpdCA9IDE7IC8vbmV3XG4gICAgaWYgKHRhcmdldFNoaXAgIT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmZsZWV0LmhlYWx0aC0tO1xuICAgICAgdGFyZ2V0U2hpcC5oZWFsdGgtLTtcbiAgICAgIGlmICh0YXJnZXRTaGlwLmhlYWx0aCkge1xuICAgICAgICByZXN1bHQuc3RhdGUgPSBISVQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVEFSR0VUIEhJVFwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdC5zdGF0ZSA9IEtJTEw7XG4gICAgICAgIHJlc3VsdC5raWxsZWRTaGlwID0gdGFyZ2V0U2hpcDtcbiAgICAgICAgY29uc29sZS5sb2coXCJUQVJHRVQgS0lMTEVEXCIpO1xuICAgICAgICBmb3IgKGNvbnN0IHNxdWFyZSBvZiB0YXJnZXRTaGlwLmJvZHlDb29yZHMpIHtcbiAgICAgICAgICB0aGlzLmZsZWV0LmdyaWQuZ2V0U3F1YXJlKHNxdWFyZSkua2lsbGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1hcmtBc0hpdENvb3Jkc0Fyb3VuZEtpbGxlZFNoaXAodGFyZ2V0U2hpcCwgKHNxKSA9PiBzcS53YXNIaXQgPSAxKTtcbiAgICAgICAgdGhpcy5mbGVldC5ncmlkLmNvbnNvbGVSZW5kZXIoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnN0YXRlID0gTUlTUztcbiAgICAgIGNvbnNvbGUubG9nKFwiVEFSR0VUIE1JU1NcIik7XG4gICAgICB0aGlzLm15VHVybiA9IHRydWU7XG4gICAgfVxuICAgIHRoaXMuZmxlZXQuZ3JpZC5jb25zb2xlUmVuZGVyKCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHRha2VJbmNvbWluZ1N0cmlrZSh5LCB4KSB7XG4gICAgcmV0dXJuIHRoaXMuZXZhbHVhdGVTdHJpa2UoeSwgeCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBZ2VudDtcbiIsImNvbnN0IE1BWF9IRUFMVEggPSAyMDtcbmNvbnN0IEJJR0dFU1RfU0hJUF9MRU4gPSA0O1xuXG5jb25zdCBHQU1FX01PREVfQkFUVExFID0gMjsgLy9cbmNvbnN0IEdBTUVfTU9ERV9TSElQX1BMQUNFTUVOVCA9IDE7XG5jb25zdCBHQU1FX01PREVfTUVOVSA9IDA7XG5cbmNvbnN0IEdSSURfU0laRSA9IDEwO1xuY29uc3QgTUFYX0ZMRUVUX1NJWkUgPSAxMDtcblxuY29uc3QgQ09PUkRfWCA9IDE7XG5jb25zdCBDT09SRF9ZID0gMDtcblxuY29uc3QgTUlTUyA9IDA7XG5jb25zdCBISVQgPSAxO1xuY29uc3QgS0lMTCA9IDI7XG5cbi8vIGRpcmVjdGlvbnNcbmNvbnN0IFVQID0gWy0xLCAwXTtcbmNvbnN0IExFRlQgPSBbMCwgMV07XG5jb25zdCBET1dOID0gWzEsIDBdO1xuY29uc3QgUklHSFQgPSBbMCwgLTFdO1xuY29uc3QgRElSRUNUSU9OUyA9IFtVUCwgTEVGVCwgRE9XTiwgUklHSFRdO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgTUFYX0hFQUxUSCxcbiAgQklHR0VTVF9TSElQX0xFTixcbiAgR0FNRV9NT0RFX0JBVFRMRSxcbiAgR0FNRV9NT0RFX1NISVBfUExBQ0VNRU5ULFxuICBHQU1FX01PREVfTUVOVSxcbiAgR1JJRF9TSVpFLFxuICBNQVhfRkxFRVRfU0laRSxcbiAgQ09PUkRfWCxcbiAgQ09PUkRfWSxcbiAgTUlTUyxcbiAgSElULFxuICBLSUxMLFxuICBVUCxcbiAgTEVGVCxcbiAgRE9XTixcbiAgUklHSFQsXG4gIERJUkVDVElPTlMsXG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBDb250cm9sbGVyIHtcbiAgY29uc3RydWN0b3IobW9kZWwsIHZpZXcpIHtcbiAgICB0aGlzLm1vZGVsID0gbW9kZWw7XG4gICAgdGhpcy52aWV3ID0gdmlldztcblxuICAgIHRoaXMubW9kZWwuY29udHJvbGxlciA9IHRoaXM7XG5cbiAgICB0aGlzLnZpZXcuYmluZEZpZ2h0Q2xpY2sodGhpcy5oYW5kbGVGaWdodENsaWNrLmJpbmQodGhpcykpO1xuICAgIHRoaXMudmlldy5iaW5kRnJpZW5kbHlTcXVhcmVDbGljayhcbiAgICAgIHRoaXMuaGFuZGxlRnJpZW5kbHlTcXVhcmVDbGljay5iaW5kKHRoaXMpLFxuICAgICk7XG4gICAgdGhpcy52aWV3LmJpbmRGcmllbmRseVJpZ2h0Q2xpY2sodGhpcy5oYW5kbGVGcmllbmRseVJpZ2h0Q2xpY2suYmluZCh0aGlzKSk7XG4gICAgdGhpcy52aWV3LmJpbmRFbmVteVNxdWFyZUNsaWNrKFxuICAgICAgdGhpcy5oYW5kbGVFbmVteVNxdWFyZUNsaWNrLmJpbmQodGhpcyksXG4gICAgKTtcbiAgICB0aGlzLnZpZXcuYmluZE9uQ2xvc2VMb3NlKHRoaXMuaGFuZGxlT25jbG9zZUxvc2UuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5tb2RlbC51cGRhdGVFbmVteUdyaWQgPSB0aGlzLmhhbmRsZVVwZGF0ZUVuZW15R3JpZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMubW9kZWwudXBkYXRlRnJpZW5kbHlHcmlkID0gdGhpcy5oYW5kbGVVcGRhdGVGcmllbmRseUdyaWQuYmluZCh0aGlzKTtcbiAgICB0aGlzLm1vZGVsLnVwZGF0ZUdhbWVNb2RlID0gdGhpcy5oYW5kbGVVcGRhdGVHYW1lTW9kZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMubW9kZWwubm90aWZ5R2FtZU92ZXIgPSB0aGlzLmhhbmRsZUdhbWVPdmVyLmJpbmQodGhpcyk7XG4gIH1cblxuICBnZXRTcXVhcmVEYXRhKGlzRnJpZW5kbHksIHksIHgpIHtcbiAgICBpZiAoaXNGcmllbmRseSkge1xuICAgICAgY29uc29sZS5sb2codGhpcy5tb2RlbC5wbGF5ZXJBZ2VudC5mbGVldC5ncmlkLmdldFNxdWFyZSh5LCB4KS5oYXNTaGlwKTtcbiAgICAgIHJldHVybiB0aGlzLm1vZGVsLnBsYXllckFnZW50LmZsZWV0LmdyaWQuZ2V0U3F1YXJlKHksIHgpLmhhc1NoaXA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLm1vZGVsLmFpQWdlbnQuZmxlZXQuZ3JpZC5nZXRTcXVhcmUoeSwgeCkuaGFzU2hpcDtcbiAgICB9XG4gIH1cblxuICBpbml0KCkge1xuICAgIGNvbnNvbGUubG9nKFwiaGVsbG9cIik7XG4gIH1cblxuICBoYW5kbGVHYW1lT3ZlcihyZXN1bHQpIHtcbiAgICB0aGlzLnZpZXcuZ2FtZU92ZXJTY3JlZW4ocmVzdWx0KTtcbiAgfVxuXG4gIGhhbmRsZUZpZ2h0Q2xpY2soKSB7XG4gICAgdGhpcy5tb2RlbC5pbml0U2Vzc2lvbigpO1xuICAgIC8vIHRoaXMudmlldy5zZXRTY29yZUljb25zKCk7XG4gIH1cblxuICBoYW5kbGVGcmllbmRseVNxdWFyZUNsaWNrKHN0YXJ0LCBlbmQpIHtcbiAgICB0aGlzLm1vZGVsLmFkZFBsYXllclNoaXAoc3RhcnQsIGVuZCk7XG4gIH1cbiAgaGFuZGxlRnJpZW5kbHlSaWdodENsaWNrKHksIHgpIHtcbiAgICB0aGlzLm1vZGVsLnJlbW92ZVBsYXllclNoaXAoeSwgeCk7XG4gICAgdGhpcy52aWV3LnJlZHJhd0ZyaWVuZGx5R3JpZCh0aGlzLm1vZGVsLnBsYXllckFnZW50LmZsZWV0LmdyaWQuZ3JpZCk7XG4gIH1cblxuICBoYW5kbGVFbmVteVNxdWFyZUNsaWNrKHksIHgpIHtcbiAgICB0aGlzLm1vZGVsLmluaXRHYW1lVHVybih5LCB4KTtcbiAgfVxuXG4gIGhhbmRsZVVwZGF0ZUZyaWVuZGx5R3JpZCgpIHtcbiAgICB0aGlzLnZpZXcucmVkcmF3RnJpZW5kbHlHcmlkKHRoaXMubW9kZWwucGxheWVyQWdlbnQuZmxlZXQuZ3JpZC5ncmlkKTtcbiAgfVxuICBoYW5kbGVVcGRhdGVFbmVteUdyaWQoKSB7XG4gICAgdGhpcy52aWV3LnJlZHJhd0VuZW15R3JpZCh0aGlzLm1vZGVsLmFpQWdlbnQuZmxlZXQuZ3JpZC5ncmlkKTtcbiAgfVxuICBoYW5kbGVVcGRhdGVHYW1lTW9kZSgpIHtcbiAgICB0aGlzLnZpZXcuZ2V0R2FtZU1vZGUodGhpcy5tb2RlbC5nYW1lTW9kZSk7XG4gIH1cbiAgaGFuZGxlT25jbG9zZUxvc2UoKXtcbiAgICB0aGlzLm1vZGVsLnNlbmRlcig2KTtcbiAgfVxufTtcbiIsImNvbnN0IGhlbHBlcnMgPSByZXF1aXJlKFwiLi9oZWxwZXJzLmpzXCIpO1xuXG5jb25zdCB7XG4gIE1BWF9IRUFMVEgsXG4gIEJJR0dFU1RfU0hJUF9MRU4sXG4gIEdSSURfU0laRSxcbiAgTUFYX0ZMRUVUX1NJWkUsXG4gIENPT1JEX1gsXG4gIENPT1JEX1ksXG4gIE1JU1MsXG4gIEhJVCxcbiAgS0lMTCxcbiAgVVAsXG4gIExFRlQsXG4gIERPV04sXG4gIFJJR0hULFxuICBESVJFQ1RJT05TLFxufSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50cy5qc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBGbGVldCB7XG4gIGNvbnN0cnVjdG9yKGdyaWQpIHtcbiAgICB0aGlzLnNoaXBzID0gW1tdLCBbXSwgW10sIFtdXTtcbiAgICB0aGlzLnNpemUgPSAwO1xuICAgIHRoaXMuZ3JpZCA9IGdyaWQ7XG4gICAgdGhpcy5oZWFsdGggPSBNQVhfSEVBTFRIO1xuICB9XG5cbiAgYWRkU2hpcChuZXdTaGlwKSB7XG4gICAgLy8gbmV4dCBpZiBzdGF0ZW1lbnQgY2hlY2sgaWYgZmxlZXQgYWxsb3dlZCB0byBoYXZlIGFub3RoZXIgc2hpcCBvZiBjdXJ0YWluIGxlblxuICAgIGlmIChuZXdTaGlwID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChcbiAgICAgIHRoaXMuc2hpcHNbbmV3U2hpcC5sZW4gLSAxXS5sZW5ndGggPCBCSUdHRVNUX1NISVBfTEVOIC0gKG5ld1NoaXAubGVuIC0gMSlcbiAgICApIHtcbiAgICAgIHRoaXMuc2hpcHNbbmV3U2hpcC5sZW4gLSAxXS5wdXNoKG5ld1NoaXApO1xuICAgICAgdGhpcy5wbGFjZVNoaXBPbkdyaWQobmV3U2hpcCk7XG4gICAgICArK3RoaXMuc2l6ZTtcbiAgICAgIHJldHVybiBuZXdTaGlwO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIHBsYWNlU2hpcE9uR3JpZChuZXdTaGlwKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXdTaGlwLmxlbjsgaSsrKSB7XG4gICAgICBjb25zdCB5Q29vcmQgPSBuZXdTaGlwLmJvZHlDb29yZHNbaV1bQ09PUkRfWV07XG4gICAgICBjb25zdCB4Q29vcmQgPSBuZXdTaGlwLmJvZHlDb29yZHNbaV1bQ09PUkRfWF07XG4gICAgICAvLyB0aGlzLmdyaWQuZ3JpZFt5Q29vcmRdW3hDb29yZF0gPSBuZXdTaGlwLmxlbjtcbiAgICAgIHRoaXMuZ3JpZC5nZXRTcXVhcmUoeUNvb3JkLCB4Q29vcmQpLnNoaXBTaXplID0gbmV3U2hpcC5sZW47XG4gICAgICB0aGlzLmdyaWQuZ2V0U3F1YXJlKHlDb29yZCwgeENvb3JkKS5oYXNTaGlwID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBmaW5kU2hpcChsZW5ndGgsIGJvZHlDb29yZCkge1xuICAgIGlmIChsZW5ndGggPT0gMCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgY29uc3Qgc2hpcCA9IHRoaXMuc2hpcHNbbGVuZ3RoIC0gMV0uZmluZCgoc2hpcCkgPT4ge1xuICAgICAgY29uc3QgY2hlY2sgPSBzaGlwLmJvZHlDb29yZHMuc29tZSgoY29vcmQpID0+XG4gICAgICAgIGNvb3JkLmV2ZXJ5KCh2YWx1ZSwgaWQpID0+IHZhbHVlID09PSBib2R5Q29vcmRbaWRdKVxuICAgICAgKTtcbiAgICAgIGlmIChjaGVjaykgcmV0dXJuIHNoaXA7XG4gICAgfSk7XG4gICAgcmV0dXJuIHNoaXA7XG4gIH1cblxuICByZW1vdmVTaGlwKHNoaXApe1xuICAgIC8vIHJlbW92ZSBmcm9tIGdyaWRcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoaXAubGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IHlDb29yZCA9IHNoaXAuYm9keUNvb3Jkc1tpXVtDT09SRF9ZXTtcbiAgICAgIGNvbnN0IHhDb29yZCA9IHNoaXAuYm9keUNvb3Jkc1tpXVtDT09SRF9YXTtcbiAgICAgIHRoaXMuZ3JpZC5nZXRTcXVhcmUoeUNvb3JkLCB4Q29vcmQpLnNoaXBTaXplID0gMDtcbiAgICAgIHRoaXMuZ3JpZC5nZXRTcXVhcmUoeUNvb3JkLCB4Q29vcmQpLmhhc1NoaXAgPSBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnNoaXBzW3NoaXAubGVuLTFdLmluZGV4T2Yoc2hpcCk7XG4gICAgaWYgKGluZGV4ID4gLTEpe1xuICAgICAgLy8gY29uc29sZS5sb2codGhpcy5zaGlwc1tzaGlwLmxlbi0xXSk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcInN1Y2Nlc3NcIik7XG4gICAgICB0aGlzLnNoaXBzW3NoaXAubGVuLTFdLnNwbGljZShpbmRleCwxKTtcbiAgICAgIC0tdGhpcy5zaXplO1xuICAgICAgLy8gY29uc29sZS5sb2codGhpcy5zaGlwc1tzaGlwLmxlbi0xXSk7XG4gICAgfVxuICB9XG5cbiAgY2hlY2tBcm91bmRTcXVhcmUoc3F1YXJlKSB7XG4gICAgY29uc3QgZGlyZWN0aW9ucyA9IFtcbiAgICAgIFswLCAwXSxcbiAgICAgIFstMSwgLTFdLFxuICAgICAgWy0xLCAwXSxcbiAgICAgIFstMSwgMV0sXG4gICAgICBbMCwgMV0sXG4gICAgICBbMSwgMV0sXG4gICAgICBbMSwgMF0sXG4gICAgICBbMSwgLTFdLFxuICAgICAgWzAsIC0xXSxcbiAgICBdO1xuICAgIGZ1bmN0aW9uIGdldFNxdWFyZVZhbHVlRnJvbURpcmVjdGlvbihkaXJlY3Rpb24pIHtcbiAgICAgIC8vVE9ETzogQ0hBTkdFIFRSWUNBVENIIFRPIElGIFNUQVRFTUVOVCBcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJldHVyblZhbCA9IHRoaXMuZ3JpZC5nZXRTcXVhcmUoXG4gICAgICAgICAgc3F1YXJlW0NPT1JEX1ldICsgZGlyZWN0aW9uW0NPT1JEX1ldLFxuICAgICAgICAgIHNxdWFyZVtDT09SRF9YXSArIGRpcmVjdGlvbltDT09SRF9YXSxcbiAgICAgICAgKS5oYXNTaGlwO1xuICAgICAgICBjb25zb2xlLmxvZyhcInJldHZhbCBpcyBcIiwgcmV0dXJuVmFsKTtcblxuICAgICAgICBpZiAocmV0dXJuVmFsID09PSB1bmRlZmluZWQpIHRocm93IFwiT3V0IG9mIGFycmF5XCI7XG4gICAgICAgIHJldHVybiByZXR1cm5WYWw7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaXJlY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBkaXJlY3Rpb24gPSBkaXJlY3Rpb25zW2ldO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGdldFNxdWFyZVZhbHVlRnJvbURpcmVjdGlvbi5jYWxsKHRoaXMsIGRpcmVjdGlvbikgIT0gZmFsc2UpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKF9lcnJvcikge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpc1Bvc3NpYmxlKHN0YXJ0LCBlbmQsIGRpcmVjdGlvbikge1xuICAgIC8vY2hlY2sgaWYgaW4gZ3JpZFxuICAgIGlmIChlbmRbQ09PUkRfWF0gPj0gR1JJRF9TSVpFIHx8IGVuZFtDT09SRF9ZXSA+PSBHUklEX1NJWkUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBsZW4gPSBoZWxwZXJzLmNhbGNTaGlwTGVuZ3RoKHN0YXJ0LCBlbmQpO1xuICAgIGNvbnNvbGUubG9nKFwibGVuZ3RoIGlzIFwiLCBsZW4pO1xuICAgIGlmIChsZW4gPiBCSUdHRVNUX1NISVBfTEVOKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc29sZS5sb2codGhpcy5jaGVja0Fyb3VuZFNxdWFyZShzdGFydCkpO1xuICAgIHJldHVybiB0aGlzLmNoZWNrQXJvdW5kU3F1YXJlKHN0YXJ0KSAmJiB0aGlzLmNoZWNrQXJvdW5kU3F1YXJlKGVuZCk7XG4gIH1cbn07XG4iLCJjb25zdCB7IENPT1JEX1ksIENPT1JEX1gsIEdSSURfU0laRSB9ID0gcmVxdWlyZShcIi4vY29uc3RhbnRzLmpzXCIpO1xuXG5jbGFzcyBTcXVhcmUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLndhc0hpdCA9IDA7Ly8gYnkgZW5lbXlcbiAgICB0aGlzLndhc1VzZWRBc1RhcmdldCA9IGZhbHNlO1xuICAgIHRoaXMuaGFzU2hpcCA9IGZhbHNlO1xuICAgIHRoaXMuc2hpcFNpemUgPSAwO1xuICAgIHRoaXMua2lsbGVkID0gZmFsc2U7XG4gIH1cbn1cblxuY2xhc3MgR3JpZCB7XG4gIGNvbnN0cnVjdG9yKGdyaWRTaXplKSB7XG4gICAgY29uc29sZS5sb2coXCJJbnNpZGUgR1JJRCBjb25zdHJ1Y3RvclwiKTtcbiAgICBpZiAoZ3JpZFNpemUgPT0gdW5kZWZpbmVkKSB7XG4gICAgICBncmlkU2l6ZSA9IEdSSURfU0laRTtcbiAgICB9XG4gICAgdGhpcy5ncmlkID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBncmlkU2l6ZTsgaSsrKSB7XG4gICAgICB0aGlzLmdyaWRbaV0gPSBbXTtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgZ3JpZFNpemU7IGorKykge1xuICAgICAgICB0aGlzLmdyaWRbaV0ucHVzaChuZXcgU3F1YXJlKCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldFNxdWFyZSh5LCB4KSB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoeSlcbiAgICAgID8gdGhpcy5ncmlkW3lbQ09PUkRfWV1dW3lbQ09PUkRfWF1dXG4gICAgICA6IHRoaXMuZ3JpZFt5XVt4XTtcbiAgfVxuXG4gIGNvbnNvbGVSZW5kZXIoKSB7XG4gICAgY29uc29sZS5sb2coXCIgIDAgMSAyIDMgNCA1IDYgNyA4IDlcIik7XG4gICAgbGV0IHJlc3VsdFN0cmluZyA9IFwiXCI7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmdyaWQubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdFN0cmluZyArPSBgJHtpfSBgO1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLmdyaWRbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgbGV0IG91dHB1dFNxdWFyZVN0cmluZyA9ICh0aGlzLmdyaWRbaV1bal0uc2hpcFNpemUgPT0gMClcbiAgICAgICAgICA/IFwiLiBcIlxuICAgICAgICAgIDogYCR7dGhpcy5nZXRTcXVhcmUoaSwgaikuc2hpcFNpemV9IGA7XG4gICAgICAgIGlmICh0aGlzLmdldFNxdWFyZShpLCBqKS53YXNIaXQgIT0gMCkge1xuICAgICAgICAgIG91dHB1dFNxdWFyZVN0cmluZyA9IG91dHB1dFNxdWFyZVN0cmluZy5yZXBsYWNlKFwiLlwiLCBcIm9cIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZ2V0U3F1YXJlKGksIGopLmtpbGxlZCA9PSB0cnVlKSB7XG4gICAgICAgICAgb3V0cHV0U3F1YXJlU3RyaW5nID0gb3V0cHV0U3F1YXJlU3RyaW5nLnJlcGxhY2UoXG4gICAgICAgICAgICBgJHt0aGlzLmdldFNxdWFyZShpLCBqKS5zaGlwU2l6ZX1gLFxuICAgICAgICAgICAgXCJ4XCIsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRTdHJpbmcgKz0gb3V0cHV0U3F1YXJlU3RyaW5nO1xuICAgICAgfVxuICAgICAgcmVzdWx0U3RyaW5nICs9IFwiXFxuXCI7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKHJlc3VsdFN0cmluZyk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7IFNxdWFyZSwgR3JpZCB9O1xuIiwiY29uc3QgeyBDT09SRF9YLCBDT09SRF9ZLCBHUklEX1NJWkUgfSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50cy5qc1wiKTtcblxuZnVuY3Rpb24gZ2VuZXJhdGVQb3NzaWJsZUNvb3JkaW5hdGVzKGZsZWV0LCBsZW4pIHtcbiAgbGV0IHN0YXJ0LCBlbmQsIGRpcmVjdGlvbjtcbiAgd2hpbGUgKHRydWUpIHtcbiAgICBzdGFydCA9IFtnZXRSYW5kb21JbnQoR1JJRF9TSVpFIC0gMSksIGdldFJhbmRvbUludChHUklEX1NJWkUgLSAxKV07XG4gICAgZGlyZWN0aW9uID0gZ2V0UmFuZG9tSW50KDEpOyAvL2RpcmVjdGlvbiBob3Jpem9udGFsIG9yIHZlcnRpY2FsXG4gICAgZW5kID0gKGRpcmVjdGlvbiA9PSBDT09SRF9YKVxuICAgICAgPyBbc3RhcnRbQ09PUkRfWV0sIHN0YXJ0W0NPT1JEX1hdICsgbGVuIC0gMV1cbiAgICAgIDogW3N0YXJ0W0NPT1JEX1ldICsgbGVuIC0gMSwgc3RhcnRbQ09PUkRfWF1dO1xuICAgIGlmIChmbGVldC5pc1Bvc3NpYmxlKHN0YXJ0LCBlbmQsIGRpcmVjdGlvbikpIHtcbiAgICAgIHJldHVybiB7IHN0YXJ0LCBlbmQsIGRpcmVjdGlvbiB9O1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBjYWxjU2hpcExlbmd0aChzdGFydCwgZW5kKSB7XG4gIHJldHVybiAoKHN0YXJ0W0NPT1JEX1hdID09IGVuZFtDT09SRF9YXSlcbiAgICA/IE1hdGguYWJzKHN0YXJ0W0NPT1JEX1ldIC0gZW5kW0NPT1JEX1ldKVxuICAgIDogTWF0aC5hYnMoc3RhcnRbQ09PUkRfWF0gLSBlbmRbQ09PUkRfWF0pKSArIDE7XG59XG5cbmZ1bmN0aW9uIGdldFJhbmRvbUludChtYXgpIHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggKyAxKSk7XG59XG5cbmZ1bmN0aW9uIGlzSG9yaXpvbnRhbChzdGFydCwgZW5kKSB7XG4gIHJldHVybiAoc3RhcnRbQ09PUkRfWV0gPT0gZW5kW0NPT1JEX1ldKSA/IDEgOiAwO1xufVxuXG5mdW5jdGlvbiBjdXN0b21Db250YWlucyhhcnJheSwgZWxlbWVudCkge1xuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYXJyYXkubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgY29uc3QgZWwgPSBhcnJheVtpbmRleF07XG4gICAgaWYgKGVsWzBdID09PSBlbGVtZW50WzBdICYmIGVsWzFdID09PSBlbGVtZW50WzFdKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vL9C/0L7QutCw0LfRi9Cy0LDQtdGCINC80L7QttC90L4g0LvQuCDQsdC40YLRjCDQv9C+INC90LDQv9GA0LDQstC70LXQvdC40Y4g0L3QtSDQstGL0YXQvtC00LjRgiDQu9C4INC30LAg0YDQsNC80LrQuCxcbi8v0L3QtSDQuNGB0L/QvtC70YzQt9C+0LLQsNC70LDRgdGMINC70Lgg0LrQu9C10YLQutCwINGA0LDQvdC10LVcbmZ1bmN0aW9uIGNoZWNrRGlyZWN0aW9uKGN1cnJlbnRDb29yZCwgZGlyZWN0aW9uLCBmbGVldCkge1xuICBjb25zdCBjaGVjayA9IFtcbiAgICBjdXJyZW50Q29vcmRbQ09PUkRfWV0gKyBkaXJlY3Rpb25bQ09PUkRfWV0sXG4gICAgY3VycmVudENvb3JkW0NPT1JEX1hdICsgZGlyZWN0aW9uW0NPT1JEX1hdLFxuICBdO1xuICBpZiAoXG4gICAgY2hlY2tbQ09PUkRfWV0gPCAwIHx8XG4gICAgY2hlY2tbQ09PUkRfWV0gPj0gR1JJRF9TSVpFIHx8XG4gICAgY2hlY2tbQ09PUkRfWF0gPCAwIHx8XG4gICAgY2hlY2tbQ09PUkRfWF0gPj0gR1JJRF9TSVpFIHx8XG4gICAgZmxlZXQuZ3JpZC5nZXRTcXVhcmUoY2hlY2spLndhc1VzZWRBc1RhcmdldCA9PSB0cnVlXG4gICkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0hvcml6b250YWwsXG4gIGdlbmVyYXRlUG9zc2libGVDb29yZGluYXRlcyxcbiAgY2FsY1NoaXBMZW5ndGgsXG4gIGdldFJhbmRvbUludCxcbiAgY3VzdG9tQ29udGFpbnMsXG4gIGNoZWNrRGlyZWN0aW9uLFxufTtcbiIsImNvbnN0IGFjdGlvbnMgPSByZXF1aXJlKFwiLi9hY3Rpb25zLmpzXCIpO1xuY29uc3QgQWlBZ2VudCA9IHJlcXVpcmUoXCIuL2FnZW50X2FpLmpzXCIpO1xuY29uc3QgUGxheWVyQWdlbnQgPSByZXF1aXJlKFwiLi9hZ2VudF9wbGF5ZXIuanNcIik7XG5jb25zdCB7XG4gIEdBTUVfTU9ERV9CQVRUTEUsXG4gIEdBTUVfTU9ERV9TSElQX1BMQUNFTUVOVCxcbiAgR0FNRV9NT0RFX01FTlUsXG4gIE1BWF9GTEVFVF9TSVpFLFxuICBNSVNTLFxuICBLSUxMLFxufSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50cy5qc1wiKTtcblxuY2xhc3MgTW9kZWwge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmdhbWVNb2RlID0gR0FNRV9NT0RFX01FTlU7XG4gICAgdGhpcy5haUFnZW50O1xuICAgIHRoaXMucGxheWVyQWdlbnQ7XG4gICAgdGhpcy51cGRhdGVGcmllbmRseUdyaWQgPSBudWxsO1xuICAgIHRoaXMudXBkYXRlRW5lbXlHcmlkID0gbnVsbDtcbiAgICB0aGlzLnVwZGF0ZUdhbWVNb2RlID0gbnVsbDtcbiAgICB0aGlzLm5vdGlmeUdhbWVPdmVyID0gbnVsbDtcbiAgfVxuICBzZW5kZXIoYnV0dG9uTnVtYmVyKSB7XG4gICAgaWYgKGJ1dHRvbk51bWJlciA9PT0gMSkge1xuICAgICAgZmV0Y2goXCIvc2hpcF9raWxsXCIsIHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgIC8vINCU0L7Qv9C+0LvQvdC40YLQtdC70YzQvdGL0LUg0LfQsNCz0L7Qu9C+0LLQutC4LCDQtdGB0LvQuCDQvdC10L7QsdGF0L7QtNC40LzQvlxuICAgICAgICB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgc2hpcF90eXBlOiBcInBcIixcbiAgICAgICAgfSksXG4gICAgICB9KVxuICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHJlc3BvbnNlLmpzb24oKSlcbiAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcItCj0YHQv9C10YjQvdGL0Lkg0L7RgtCy0LXRgiDQvtGCINGB0LXRgNCy0LXRgNCwOlwiLCBkYXRhKTtcbiAgICAgICAgICAvLyDQntCx0YDQsNCx0L7RgtC60LAg0YPRgdC/0LXRiNC90L7Qs9C+INC+0YLQstC10YLQsCDQvtGCINGB0LXRgNCy0LXRgNCwXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwi0J7RiNC40LHQutCwINC/0YDQuCDQstGL0L/QvtC70L3QtdC90LjQuCDQt9Cw0L/RgNC+0YHQsDpcIiwgZXJyb3IpO1xuICAgICAgICAgIC8vINCe0LHRgNCw0LHQvtGC0LrQsCDQvtGI0LjQsdC60LhcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChidXR0b25OdW1iZXIgPT09IDIpIHtcbiAgICAgIGZldGNoKFwiL3NoaXBfa2lsbFwiLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAvLyDQlNC+0L/QvtC70L3QuNGC0LXQu9GM0L3Ri9C1INC30LDQs9C+0LvQvtCy0LrQuCwg0LXRgdC70Lgg0L3QtdC+0LHRhdC+0LTQuNC80L5cbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIHNoaXBfdHlwZTogXCJwcFwiLFxuICAgICAgICB9KSxcbiAgICAgIH0pXG4gICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpKVxuICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwi0KPRgdC/0LXRiNC90YvQuSDQvtGC0LLQtdGCINC+0YIg0YHQtdGA0LLQtdGA0LA6XCIsIGRhdGEpO1xuICAgICAgICAgIC8vINCe0LHRgNCw0LHQvtGC0LrQsCDRg9GB0L/QtdGI0L3QvtCz0L4g0L7RgtCy0LXRgtCwINC+0YIg0YHQtdGA0LLQtdGA0LBcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLQntGI0LjQsdC60LAg0L/RgNC4INCy0YvQv9C+0LvQvdC10L3QuNC4INC30LDQv9GA0L7RgdCwOlwiLCBlcnJvcik7XG4gICAgICAgICAgLy8g0J7QsdGA0LDQsdC+0YLQutCwINC+0YjQuNCx0LrQuFxuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGJ1dHRvbk51bWJlciA9PT0gMykge1xuICAgICAgZmV0Y2goXCIvc2hpcF9raWxsXCIsIHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgIC8vINCU0L7Qv9C+0LvQvdC40YLQtdC70YzQvdGL0LUg0LfQsNCz0L7Qu9C+0LLQutC4LCDQtdGB0LvQuCDQvdC10L7QsdGF0L7QtNC40LzQvlxuICAgICAgICB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgc2hpcF90eXBlOiBcInBwcFwiLFxuICAgICAgICB9KSxcbiAgICAgIH0pXG4gICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpKVxuICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwi0KPRgdC/0LXRiNC90YvQuSDQvtGC0LLQtdGCINC+0YIg0YHQtdGA0LLQtdGA0LA6XCIsIGRhdGEpO1xuICAgICAgICAgIC8vINCe0LHRgNCw0LHQvtGC0LrQsCDRg9GB0L/QtdGI0L3QvtCz0L4g0L7RgtCy0LXRgtCwINC+0YIg0YHQtdGA0LLQtdGA0LBcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLQntGI0LjQsdC60LAg0L/RgNC4INCy0YvQv9C+0LvQvdC10L3QuNC4INC30LDQv9GA0L7RgdCwOlwiLCBlcnJvcik7XG4gICAgICAgICAgLy8g0J7QsdGA0LDQsdC+0YLQutCwINC+0YjQuNCx0LrQuFxuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGJ1dHRvbk51bWJlciA9PT0gNCkge1xuICAgICAgZmV0Y2goXCIvc2hpcF9raWxsXCIsIHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgIC8vINCU0L7Qv9C+0LvQvdC40YLQtdC70YzQvdGL0LUg0LfQsNCz0L7Qu9C+0LLQutC4LCDQtdGB0LvQuCDQvdC10L7QsdGF0L7QtNC40LzQvlxuICAgICAgICB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgc2hpcF90eXBlOiBcInBwcHBcIixcbiAgICAgICAgfSksXG4gICAgICB9KVxuICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHJlc3BvbnNlLmpzb24oKSlcbiAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcItCj0YHQv9C10YjQvdGL0Lkg0L7RgtCy0LXRgiDQvtGCINGB0LXRgNCy0LXRgNCwOlwiLCBkYXRhKTtcbiAgICAgICAgICAvLyDQntCx0YDQsNCx0L7RgtC60LAg0YPRgdC/0LXRiNC90L7Qs9C+INC+0YLQstC10YLQsCDQvtGCINGB0LXRgNCy0LXRgNCwXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwi0J7RiNC40LHQutCwINC/0YDQuCDQstGL0L/QvtC70L3QtdC90LjQuCDQt9Cw0L/RgNC+0YHQsDpcIiwgZXJyb3IpO1xuICAgICAgICAgIC8vINCe0LHRgNCw0LHQvtGC0LrQsCDQvtGI0LjQsdC60LhcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChidXR0b25OdW1iZXIgPT09IDUpIHtcbiAgICAgIGZldGNoKFwiL2FkZF9tYXRjaFwiLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiLFxuICAgICAgICAgIC8vINCU0L7Qv9C+0LvQvdC40YLQtdC70YzQvdGL0LUg0LfQsNCz0L7Qu9C+0LLQutC4LCDQtdGB0LvQuCDQvdC10L7QsdGF0L7QtNC40LzQvlxuICAgICAgICB9LFxuICAgICAgICBib2R5OiBuZXcgVVJMU2VhcmNoUGFyYW1zKHtcbiAgICAgICAgICByZXN1bHQ6IFwiMVwiLFxuICAgICAgICB9KSxcbiAgICAgIH0pXG4gICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpKVxuICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwi0KPRgdC/0LXRiNC90YvQuSDQvtGC0LLQtdGCINC+0YIg0YHQtdGA0LLQtdGA0LA6XCIsIGRhdGEpO1xuICAgICAgICAgIC8vINCe0LHRgNCw0LHQvtGC0LrQsCDRg9GB0L/QtdGI0L3QvtCz0L4g0L7RgtCy0LXRgtCwINC+0YIg0YHQtdGA0LLQtdGA0LBcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLQntGI0LjQsdC60LAg0L/RgNC4INCy0YvQv9C+0LvQvdC10L3QuNC4INC30LDQv9GA0L7RgdCwOlwiLCBlcnJvcik7XG4gICAgICAgICAgLy8g0J7QsdGA0LDQsdC+0YLQutCwINC+0YjQuNCx0LrQuFxuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGJ1dHRvbk51bWJlciA9PT0gNikge1xuICAgICAgZmV0Y2goXCIvYWRkX21hdGNoXCIsIHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCIsXG4gICAgICAgICAgLy8g0JTQvtC/0L7Qu9C90LjRgtC10LvRjNC90YvQtSDQt9Cw0LPQvtC70L7QstC60LgsINC10YHQu9C4INC90LXQvtCx0YXQvtC00LjQvNC+XG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IG5ldyBVUkxTZWFyY2hQYXJhbXMoe1xuICAgICAgICAgIHJlc3VsdDogXCIwXCIsXG4gICAgICAgIH0pLFxuICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiByZXNwb25zZS5qc29uKCkpXG4gICAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCLQo9GB0L/QtdGI0L3Ri9C5INC+0YLQstC10YIg0L7RgiDRgdC10YDQstC10YDQsDpcIiwgZGF0YSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwi0J7RiNC40LHQutCwINC/0YDQuCDQstGL0L/QvtC70L3QtdC90LjQuCDQt9Cw0L/RgNC+0YHQsDpcIiwgZXJyb3IpO1xuICAgICAgICAgIC8vINCe0LHRgNCw0LHQvtGC0LrQsCDQvtGI0LjQsdC60LhcbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgaW5pdFNlc3Npb24oKSB7XG4gICAgY29uc29sZS5sb2coXCJTRVNTSU9OIFNUQVJURURcIik7XG4gICAgdGhpcy5haUFnZW50ID0gbmV3IEFpQWdlbnQoKTtcbiAgICB0aGlzLnBsYXllckFnZW50ID0gbmV3IFBsYXllckFnZW50KCk7XG4gICAgdGhpcy5pbml0U2hpcFBsYWNlbWVudCgpO1xuICB9XG5cbiAgaW5pdFNoaXBQbGFjZW1lbnQoKSB7XG4gICAgY29uc29sZS5sb2coXCJNb2RlOiBTaGlwIHBsYWNlbWVudFwiKTtcbiAgICB0aGlzLnNldEdhbWVNb2RlKEdBTUVfTU9ERV9TSElQX1BMQUNFTUVOVCk7XG4gICAgLy8gdW5jb21tZW50IGZvciByYW5kb20gcGxheWVyIGZsZWV0XG4gICAgdGhpcy5wbGF5ZXJBZ2VudC5mbGVldCA9IHRoaXMucGxheWVyQWdlbnQuY3JlYXRlUmFuZG9tRmxlZXQoKTtcbiAgICB0aGlzLmNoZWNrRmxlZXRTaXplKCk7XG4gIH1cblxuICBzZW5kRGF0YVRvU2VydmVyKGNvZGUpIHtcbiAgICBpZiAoY29kZS5raWxsZWRTaGlwICE9IHVuZGVmaW5lZCkge1xuICAgICAgY29uc29sZS5sb2coYHNlbmRpbmcgY29kZSAke2NvZGUua2lsbGVkU2hpcC5sZW59IHRvIHNlcnZlcmApO1xuICAgICAgdGhpcy5zZW5kZXIoY29kZS5raWxsZWRTaGlwLmxlbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKGBzZW5kaW5nIGNvZGUgJHtjb2RlfSB0byBzZXJ2ZXJgKTtcbiAgICAgIHRoaXMuc2VuZGVyKGNvZGUpO1xuICAgIH1cbiAgfVxuICBpbml0R2FtZVR1cm4oeSwgeCkge1xuICAgIC8vcGxheWVyIGF0dGFja3NcbiAgICBjb25zdCBwbGF5ZXJBdHRhY2tSZXN1bHQgPSB0aGlzLmFpQWdlbnQudGFrZUluY29taW5nU3RyaWtlKHksIHgpO1xuICAgIGlmIChwbGF5ZXJBdHRhY2tSZXN1bHQuc3RhdGUgPT0gTUlTUykge1xuICAgICAgLy9BaSBhdHRhY2tzXG4gICAgICBsZXQgYWlBdHRhY2tSZXN1bHRzID0gdGhpcy5wbGF5ZXJBZ2VudC50YWtlSW5jb21pbmdTdHJpa2UoXG4gICAgICAgIC4uLnRoaXMuYWlBZ2VudC5nZW5lcmF0ZVN0cmlrZUNvb3JkcygpLFxuICAgICAgKTtcbiAgICAgIHdoaWxlIChcbiAgICAgICAgdGhpcy5wbGF5ZXJBZ2VudC5jaGVja0hlYWx0aCgpID4gMCAmJiBhaUF0dGFja1Jlc3VsdHMuc3RhdGUgIT0gTUlTU1xuICAgICAgKSB7XG4gICAgICAgIHRoaXMuYWlBZ2VudC50aGluayhhaUF0dGFja1Jlc3VsdHMpO1xuICAgICAgICBpZiAoYWlBdHRhY2tSZXN1bHRzID09IEtJTEwpIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZUZyaWVuZGx5R3JpZCgpO1xuICAgICAgICB9XG4gICAgICAgIGFpQXR0YWNrUmVzdWx0cyA9IHRoaXMucGxheWVyQWdlbnQudGFrZUluY29taW5nU3RyaWtlKFxuICAgICAgICAgIC4uLnRoaXMuYWlBZ2VudC5nZW5lcmF0ZVN0cmlrZUNvb3JkcygpLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdGhpcy5haUFnZW50LnRoaW5rKGFpQXR0YWNrUmVzdWx0cyk7XG4gICAgICB0aGlzLnVwZGF0ZUZyaWVuZGx5R3JpZCgpO1xuICAgICAgdGhpcy5jaGVja1Njb3JlKCk7XG4gICAgfVxuICAgIHRoaXMuc2VuZERhdGFUb1NlcnZlcihwbGF5ZXJBdHRhY2tSZXN1bHQpO1xuICAgIHRoaXMudXBkYXRlRW5lbXlHcmlkKCk7XG4gICAgdGhpcy5jaGVja1Njb3JlKCk7XG4gIH1cblxuICBjaGVja1Njb3JlKCkge1xuICAgIGlmICh0aGlzLmdhbWVNb2RlID09IEdBTUVfTU9ERV9CQVRUTEUpIHtcbiAgICAgIGNvbnN0IHBsYXllckhQID0gdGhpcy5wbGF5ZXJBZ2VudC5jaGVja0hlYWx0aCgpO1xuICAgICAgY29uc3QgYWlIUCA9IHRoaXMuYWlBZ2VudC5jaGVja0hlYWx0aCgpO1xuICAgICAgY29uc29sZS50YWJsZShwbGF5ZXJIUCwgYWlIUCk7XG4gICAgICBpZiAoXG4gICAgICAgIHBsYXllckhQIDw9IDAgfHwgYWlIUCA8PSAwXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5zZXRHYW1lTW9kZShHQU1FX01PREVfTUVOVSk7XG4gICAgICAgIGlmIChwbGF5ZXJIUCA+IGFpSFApIHtcbiAgICAgICAgICB0aGlzLm5vdGlmeUdhbWVPdmVyKFwiWU9VIFdPTlwiKTtcbiAgICAgICAgICB0aGlzLnNlbmREYXRhVG9TZXJ2ZXIoNSk7IC8vIDUgbWVhbnMgd2luIGZvciBzZXJ2ZXJcbiAgICAgICAgfSBlbHNlIGlmIChhaUhQID4gcGxheWVySFApIHtcbiAgICAgICAgICB0aGlzLm5vdGlmeUdhbWVPdmVyKFwiWU9VIExPU1RcIik7XG4gICAgICAgICAgdGhpcy5zZW5kRGF0YVRvU2VydmVyKDYpOyAvLyA2IG1lYW5zIHdpbiBmb3Igc2VydmVyXG4gICAgICAgIH0gZWxzZSBpZiAoYWlIUCA9PSBwbGF5ZXJIUCkge1xuICAgICAgICAgIHRoaXMubm90aWZ5R2FtZU92ZXIoXCJEUkFXISBcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhZGRQbGF5ZXJTaGlwKHN0YXJ0LCBlbmQpIHtcbiAgICBjb25zb2xlLmxvZyhcInZpZXcgZGF0YSByZWNpZXZlZCBpbiBjb250cm9sbGVyOiBcIiwgc3RhcnQsIGVuZCk7XG4gICAgdGhpcy5wbGF5ZXJBZ2VudC5hZGRTaGlwVG9GbGVldChzdGFydCwgZW5kKTtcbiAgICB0aGlzLnVwZGF0ZUZyaWVuZGx5R3JpZCgpO1xuICAgIHRoaXMuY2hlY2tGbGVldFNpemUoKTtcbiAgfVxuICByZW1vdmVQbGF5ZXJTaGlwKHksIHgpIHtcbiAgICB0aGlzLnBsYXllckFnZW50LnJlbW92ZVNoaXAoeSwgeCk7XG4gICAgdGhpcy5zZXRHYW1lTW9kZShHQU1FX01PREVfU0hJUF9QTEFDRU1FTlQpO1xuICB9XG5cbiAgc2V0R2FtZU1vZGUobW9kZSkge1xuICAgIHRoaXMuZ2FtZU1vZGUgPSBtb2RlO1xuICAgIHRoaXMudXBkYXRlR2FtZU1vZGUodGhpcy5nYW1lTW9kZSk7XG4gIH1cblxuICBjaGVja0ZsZWV0U2l6ZSgpIHtcbiAgICBpZiAodGhpcy5wbGF5ZXJBZ2VudC5mbGVldC5zaXplID09IE1BWF9GTEVFVF9TSVpFKSB7XG4gICAgICB0aGlzLnNldEdhbWVNb2RlKEdBTUVfTU9ERV9CQVRUTEUpO1xuICAgICAgdGhpcy51cGRhdGVGcmllbmRseUdyaWQoKTtcbiAgICAgIHRoaXMudXBkYXRlRW5lbXlHcmlkKCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kZWw7XG4iLCJjb25zdCB7IENPT1JEX1gsIENPT1JEX1kgfSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50cy5qc1wiKTtcbmNvbnN0IGhlbHBlcnMgPSByZXF1aXJlKFwiLi9oZWxwZXJzLmpzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFdhcnNoaXAge1xuICBjb25zdHJ1Y3RvcihzdGFydCwgZW5kLCBkaXJlY3Rpb24pIHtcbiAgICB0aGlzLmlzSG9yaXpvbnRhbCA9IGRpcmVjdGlvbjtcbiAgICB0aGlzLmxlbiA9IGhlbHBlcnMuY2FsY1NoaXBMZW5ndGgoc3RhcnQsIGVuZCk7XG4gICAgdGhpcy5oZWFsdGggPSB0aGlzLmxlbjtcbiAgICBjb25zdCBzaWduID1cbiAgICAgICgoc3RhcnRbQ09PUkRfWF0gPT0gZW5kW0NPT1JEX1hdKVxuICAgICAgICA/IChzdGFydFtDT09SRF9ZXSAtIGVuZFtDT09SRF9ZXSlcbiAgICAgICAgOiAoc3RhcnRbQ09PUkRfWF0gLSBlbmRbQ09PUkRfWF0pKSArIDE7XG4gICAgdGhpcy5ib2R5Q29vcmRzID0gW3N0YXJ0XTtcbiAgICBsZXQgbmV4dFNxdWFyZSA9IE9iamVjdC5hc3NpZ24oW10sIHN0YXJ0KTtcbiAgICB3aGlsZSAodGhpcy5ib2R5Q29vcmRzLmxlbmd0aCA8IHRoaXMubGVuKSB7XG4gICAgICAvLyBhZGQgb3Igc3ViIGRlcGVuZHMgb24gd2hpY2ggY29vcmQgd2UgY2hvc2UgZmlyc3RcbiAgICAgIG5leHRTcXVhcmVbZGlyZWN0aW9uXSArPSAoc2lnbiA8PSAwKSA/IDEgOiAtMTtcbiAgICAgIHRoaXMuYm9keUNvb3Jkcy5wdXNoKG5leHRTcXVhcmUpO1xuICAgICAgbmV4dFNxdWFyZSA9IE9iamVjdC5hc3NpZ24oW10sIG5leHRTcXVhcmUpO1xuICAgIH1cbiAgfVxufTtcbiIsImNvbnN0IHtcbiAgQklHR0VTVF9TSElQX0xFTixcbiAgR0FNRV9NT0RFX0JBVFRMRSxcbiAgR0FNRV9NT0RFX1NISVBfUExBQ0VNRU5ULFxuICBHQU1FX01PREVfTUVOVSxcbiAgR1JJRF9TSVpFLFxuICBDT09SRF9YLFxuICBDT09SRF9ZLFxufSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50cy5qc1wiKTtcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgVmlldyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucGxheWVyR3JpZERpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGxheWVyLWdyaWRcIik7XG4gICAgdGhpcy5haUdyaWREaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFpLWdyaWRcIik7XG4gICAgdGhpcy5zdGFydEdhbWVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0LWdhbWUtYnV0dG9uXCIpO1xuICAgIC8vc2hpcCBzZWxlY3Rpb25cbiAgICB0aGlzLnNoaXBTZWxlY3RvcnMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic2hpcC1zZWxlY3RvclwiKTtcbiAgICB0aGlzLnNoaXBTdGFydEVuZERhdGEgPSBbXTsgLy8gYXJyYXlcbiAgICAvLyBkaXZzXG4gICAgdGhpcy5wbGF5ZXJHcmlkID0gdGhpcy5jcmVhdGVHcmlkKHRoaXMucGxheWVyR3JpZERpdik7XG4gICAgdGhpcy5haUdyaWQgPSB0aGlzLmNyZWF0ZUdyaWQodGhpcy5haUdyaWREaXYpO1xuICAgIHRoaXMuZ2FtZU1vZGUgPSBHQU1FX01PREVfTUVOVTtcblxuICAgIHRoaXMucmVzdWx0VGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoMVwiKTtcbiAgICB0aGlzLmdhbWVPdmVyRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYW1lLW92ZXJcIik7XG4gICAgdGhpcy5nYW1lT3ZlckRpdi5jaGlsZHJlblswXS5hcHBlbmRDaGlsZCh0aGlzLnJlc3VsdFRleHQpO1xuXG4gICAgdGhpcy5pbmZvV2luZG93ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5pbmZvLXdpbmRvd1wiKTtcbiAgfVxuXG4gIGdhbWVPdmVyU2NyZWVuKHJlc3VsdCkge1xuICAgIHRoaXMucmVzdWx0VGV4dC50ZXh0Q29udGVudCA9IHJlc3VsdDtcbiAgICB0aGlzLmdhbWVPdmVyRGl2LnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgdGhpcy5nYW1lT3ZlckRpdi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5nYW1lT3ZlckRpdi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgfSk7XG4gIH1cblxuICBzZXRHYW1lSW5mb1RleHQoKSB7XG4gICAgaWYgKHRoaXMuZ2FtZU1vZGUgPT0gR0FNRV9NT0RFX01FTlUpIHtcbiAgICAgIHRoaXMuaW5mb1dpbmRvdy50ZXh0Q29udGVudCA9IFwiXCI7XG4gICAgICB0aGlzLmluZm9XaW5kb3cuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIH0gZWxzZSBpZiAodGhpcy5nYW1lTW9kZSA9PSBHQU1FX01PREVfQkFUVExFKSB7XG4gICAgICB0aGlzLmluZm9XaW5kb3cudGV4dENvbnRlbnQgPSBcIkJBVFRMRVwiO1xuICAgICAgdGhpcy5pbmZvV2luZG93LnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgfSBlbHNlIGlmICh0aGlzLmdhbWVNb2RlID09IEdBTUVfTU9ERV9TSElQX1BMQUNFTUVOVCkge1xuICAgICAgdGhpcy5pbmZvV2luZG93LnRleHRDb250ZW50ID0gXCJQcmVwYXJlIHlvdXIgZmxlZXQuXCI7XG4gICAgICB0aGlzLmluZm9XaW5kb3cuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICB9XG4gIH1cblxuICBnZXRHYW1lTW9kZShnYW1lTW9kZSkge1xuICAgIGlmICh0aGlzLmdhbWVNb2RlID09IEdBTUVfTU9ERV9CQVRUTEUgJiYgZ2FtZU1vZGUgPT0gR0FNRV9NT0RFX01FTlUpIHtcbiAgICAgIHRoaXMudG9nZ2xlU3RhcnRHYW1lQnV0dG9uVmlzaWJpbGl0eSgpO1xuICAgIH1cbiAgICB0aGlzLmdhbWVNb2RlID0gZ2FtZU1vZGU7XG4gICAgdGhpcy5zZXRHYW1lSW5mb1RleHQoKTtcbiAgICBjb25zb2xlLmxvZyhcIkdBTUUgTU9ERTogXCIsIHRoaXMuZ2FtZU1vZGUpO1xuICAgIHJldHVybiBnYW1lTW9kZTtcbiAgfVxuXG4gIGNoZWNrSWZDYW5CZUNsaWNrZWQoZWxlbWVudCkge1xuICAgIHJldHVybiAhKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwicGFpbnQta2lsbGVkXCIpIHx8XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcInBhaW50LW1pc3NcIikgfHxcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwicGFpbnQtaGl0XCIpKTtcbiAgfVxuXG4gIHJlZHJhd0ZyaWVuZGx5R3JpZChncmlkKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBHUklEX1NJWkU7IGkrKykge1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBHUklEX1NJWkU7IGorKykge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZ3JpZFtpXVtqXTtcbiAgICAgICAgY29uc3QgZGl2RWxlbWVudENsYXNzTGlzdCA9IHRoaXMucGxheWVyR3JpZFtpXVtqXS5jbGFzc0xpc3Q7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBlbGVtZW50Lmhhc1NoaXAgJiYgIWRpdkVsZW1lbnRDbGFzc0xpc3QuY29udGFpbnMoXCJwYWludC1mcmllbmRseVwiKVxuICAgICAgICApIHtcbiAgICAgICAgICBkaXZFbGVtZW50Q2xhc3NMaXN0LnRvZ2dsZShcInBhaW50LWZyaWVuZGx5XCIpO1xuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICFlbGVtZW50Lmhhc1NoaXAgJiYgZGl2RWxlbWVudENsYXNzTGlzdC5jb250YWlucyhcInBhaW50LWZyaWVuZGx5XCIpXG4gICAgICAgICkge1xuICAgICAgICAgIGRpdkVsZW1lbnRDbGFzc0xpc3QudG9nZ2xlKFwicGFpbnQtZnJpZW5kbHlcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW1lbnQua2lsbGVkKSB7XG4gICAgICAgICAgZGl2RWxlbWVudENsYXNzTGlzdC5hZGQoXCJwYWludC1raWxsZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW1lbnQud2FzSGl0ICYmICFlbGVtZW50Lmhhc1NoaXApIHtcbiAgICAgICAgICBkaXZFbGVtZW50Q2xhc3NMaXN0LmFkZChcInBhaW50LW1pc3NcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW1lbnQud2FzSGl0ICYmIGVsZW1lbnQuaGFzU2hpcCkge1xuICAgICAgICAgIGRpdkVsZW1lbnRDbGFzc0xpc3QuYWRkKFwicGFpbnQtaGl0XCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVkcmF3RW5lbXlHcmlkKGdyaWQpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IEdSSURfU0laRTsgaSsrKSB7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IEdSSURfU0laRTsgaisrKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBncmlkW2ldW2pdO1xuICAgICAgICAvL3VuY29tbWVudCB0byBzZWUgZW5lbXkgc2hpcHNcbiAgICAgICAgaWYgKGVsZW1lbnQuaGFzU2hpcCkge1xuICAgICAgICAgIHRoaXMuYWlHcmlkW2ldW2pdLmNsYXNzTGlzdC5hZGQoXCJjaGVhdC1zaGlwc1wiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudC5raWxsZWQpIHtcbiAgICAgICAgICB0aGlzLmFpR3JpZFtpXVtqXS5jbGFzc0xpc3QuYWRkKFwicGFpbnQta2lsbGVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbGVtZW50Lndhc0hpdCAmJiAhZWxlbWVudC5oYXNTaGlwKSB7XG4gICAgICAgICAgdGhpcy5haUdyaWRbaV1bal0uY2xhc3NMaXN0LmFkZChcInBhaW50LW1pc3NcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW1lbnQud2FzSGl0ICYmIGVsZW1lbnQuaGFzU2hpcCkge1xuICAgICAgICAgIHRoaXMuYWlHcmlkW2ldW2pdLmNsYXNzTGlzdC5hZGQoXCJwYWludC1oaXRcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0b2dnbGVTdGFydEdhbWVCdXR0b25WaXNpYmlsaXR5KCkge1xuICAgIHRoaXMuc3RhcnRHYW1lQnV0dG9uLmNsYXNzTGlzdC50b2dnbGUoXCJoaWRkZW5cIik7XG4gIH1cblxuICBjcmVhdGVHcmlkKGdyaWREaXYpIHtcbiAgICBjb25zdCBzcXVhcmVzID0gW107XG4gICAgLy8gRG9jdW1lbnRGcmFnbWVudCBpcyBiZXR0ZXIgdGhhbiBhcHBlbmRpbmcgdG8gRE9NIGRpcmVjdGx5XG4gICAgY29uc3QgdG1wR3JpZCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IEdSSURfU0laRTsgaSsrKSB7XG4gICAgICBzcXVhcmVzW2ldID0gW107XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IEdSSURfU0laRTsgaisrKSB7XG4gICAgICAgIGNvbnN0IHNxdWFyZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHNxdWFyZS5jbGFzc0xpc3QuYWRkKFwic3F1YXJlXCIpO1xuICAgICAgICBzcXVhcmUuc2V0QXR0cmlidXRlKFwieVwiLCBgJHtpfWApO1xuICAgICAgICBzcXVhcmUuc2V0QXR0cmlidXRlKFwieFwiLCBgJHtqfWApO1xuICAgICAgICBzcXVhcmVzW2ldW2pdID0gdG1wR3JpZC5hcHBlbmRDaGlsZChzcXVhcmUpO1xuICAgICAgfVxuICAgIH1cbiAgICBncmlkRGl2LmFwcGVuZENoaWxkKHRtcEdyaWQpO1xuICAgIHJldHVybiBzcXVhcmVzO1xuICB9XG5cbiAgcmVuZGVyR3JpZChncmlkLCBjYWxsYmFjaykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZ3JpZC5sZW5ndGg7IGkrKykge1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBncmlkLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGNhbGxiYWNrKGdyaWRbaV1bal0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldFNjb3JlSWNvbnMoKSB7XG4gICAgLy8gY29uc3Qgc2VsZWN0b3JPbmUgPSBBcnJheS5mcm9tKHRoaXMuc2hpcFNlbGVjdG9ycyk7XG4gICAgLy8gZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Rvck9uZS5sZW5ndGg7IGkrKykge1xuICAgIC8vICAgY29uc3QgZWxlbSA9IHNlbGVjdG9yT25lW2ldO1xuICAgIC8vICAgbGV0IHNjb3JlID0gQklHR0VTVF9TSElQX0xFTiAtIGVsZW0uY2xhc3NMaXN0WzFdWzFdICsgMTtcbiAgICAvLyAgIGNvbnN0IHNjb3JlRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAvLyAgIGNvbnN0IGFwcGVuZFN5bSA9IChlbGVtLmNsYXNzTGlzdC5jb250YWlucyhcImFpXCIpKSA/IFwi4pePXCIgOiBcIuKXi1wiO1xuICAgIC8vICAgd2hpbGUgKHNjb3JlLS0pIHNjb3JlRGl2LnRleHRDb250ZW50ICs9IGFwcGVuZFN5bTtcbiAgICAvLyAgIGVsZW0uYXBwZW5kQ2hpbGQoc2NvcmVEaXYpO1xuICAgIC8vIH1cbiAgfVxuXG4gIGNsZWFyR3JpZChncmlkKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBHUklEX1NJWkU7IGkrKykge1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBHUklEX1NJWkU7IGorKykge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZ3JpZFtpXVtqXS5jbGFzc0xpc3Q7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBlbGVtZW50LmNvbnRhaW5zKFwicGFpbnQtbWlzc1wiKSB8fFxuICAgICAgICAgIGVsZW1lbnQuY29udGFpbnMoXCJwYWludC1mcmllbmRseVwiKSB8fFxuICAgICAgICAgIGVsZW1lbnQuY29udGFpbnMoXCJwYWludC1raWxsZWRcIikgfHxcbiAgICAgICAgICBlbGVtZW50LmNvbnRhaW5zKFwicGFpbnQtaGl0XCIpIHx8XG4gICAgICAgICAgZWxlbWVudC5jb250YWlucyhcImNoZWF0LXNoaXBzXCIpXG4gICAgICAgICkge1xuICAgICAgICAgIGVsZW1lbnQucmVtb3ZlKFxuICAgICAgICAgICAgXCJwYWludC1raWxsZWRcIixcbiAgICAgICAgICAgIFwicGFpbnQtZnJpZW5kbHlcIixcbiAgICAgICAgICAgIFwicGFpbnQtbWlzc1wiLFxuICAgICAgICAgICAgXCJwYWludC1oaXRcIixcbiAgICAgICAgICAgIFwiY2hlYXQtc2hpcHNcIixcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyo9PT09PT09PT09PT09PT09PT09PWJpbmRpbmdzPT09PT09PT09PT09PT09PT09PT09PT09PT09PSovXG4gIGJpbmRGaWdodENsaWNrKGhhbmRsZXIpIHtcbiAgICB0aGlzLnN0YXJ0R2FtZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5jbGVhckdyaWQodGhpcy5wbGF5ZXJHcmlkKTtcbiAgICAgIHRoaXMuY2xlYXJHcmlkKHRoaXMuYWlHcmlkKTtcbiAgICAgIGhhbmRsZXIoKTtcbiAgICAgIHRoaXMudG9nZ2xlU3RhcnRHYW1lQnV0dG9uVmlzaWJpbGl0eSgpO1xuICAgIH0pO1xuICB9XG5cbiAgYmluZEZyaWVuZGx5U3F1YXJlQ2xpY2soaGFuZGxlcikge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgR1JJRF9TSVpFOyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgR1JJRF9TSVpFOyBqKyspIHtcbiAgICAgICAgdGhpcy5wbGF5ZXJHcmlkW2ldW2pdLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXYpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5nYW1lTW9kZSA9PSBHQU1FX01PREVfU0hJUF9QTEFDRU1FTlQpIHtcbiAgICAgICAgICAgIGNvbnN0IHkgPSBOdW1iZXIoZXYudGFyZ2V0LmdldEF0dHJpYnV0ZShcInlcIikpO1xuICAgICAgICAgICAgY29uc3QgeCA9IE51bWJlcihldi50YXJnZXQuZ2V0QXR0cmlidXRlKFwieFwiKSk7XG4gICAgICAgICAgICB0aGlzLnNoaXBTdGFydEVuZERhdGEucHVzaChbeSwgeF0pO1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICB0aGlzLnNoaXBTdGFydEVuZERhdGEubGVuZ3RoID09IDJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgdGhpcy5zaGlwU3RhcnRFbmREYXRhWzBdW0NPT1JEX1hdICE9XG4gICAgICAgICAgICAgICAgICB0aGlzLnNoaXBTdGFydEVuZERhdGFbMV1bQ09PUkRfWF0gJiZcbiAgICAgICAgICAgICAgICB0aGlzLnNoaXBTdGFydEVuZERhdGFbMF1bQ09PUkRfWV0gIT1cbiAgICAgICAgICAgICAgICAgIHRoaXMuc2hpcFN0YXJ0RW5kRGF0YVsxXVtDT09SRF9ZXVxuICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBhbGVydChcIkVSUk9SOiBTaGlwcyBjYW4gbm90IGJlIHBsYWNlZCBkaWFnb25hbGx5LlwiKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyKC4uLnRoaXMuc2hpcFN0YXJ0RW5kRGF0YSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdGhpcy5zaGlwU3RhcnRFbmREYXRhID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdhbWVNb2RlID09IEdBTUVfTU9ERV9CQVRUTEUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBiaW5kRnJpZW5kbHlSaWdodENsaWNrKGhhbmRsZXIpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IEdSSURfU0laRTsgaSsrKSB7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IEdSSURfU0laRTsgaisrKSB7XG4gICAgICAgIHRoaXMucGxheWVyR3JpZFtpXVtqXS5hZGRFdmVudExpc3RlbmVyKFwiY29udGV4dG1lbnVcIiwgKGV2KSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuZ2FtZU1vZGUgPT0gR0FNRV9NT0RFX1NISVBfUExBQ0VNRU5UKSB7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKGV2LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoXCJwYWludC1mcmllbmRseVwiKSkge1xuICAgICAgICAgICAgICBjb25zdCB5ID0gTnVtYmVyKGV2LnRhcmdldC5nZXRBdHRyaWJ1dGUoXCJ5XCIpKTtcbiAgICAgICAgICAgICAgY29uc3QgeCA9IE51bWJlcihldi50YXJnZXQuZ2V0QXR0cmlidXRlKFwieFwiKSk7XG4gICAgICAgICAgICAgIGhhbmRsZXIoeSwgeCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYmluZEVuZW15U3F1YXJlQ2xpY2soaGFuZGxlcikge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgR1JJRF9TSVpFOyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgR1JJRF9TSVpFOyBqKyspIHtcbiAgICAgICAgdGhpcy5haUdyaWRbaV1bal0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldikgPT4ge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIHRoaXMuZ2FtZU1vZGUgPT0gR0FNRV9NT0RFX0JBVFRMRSAmJlxuICAgICAgICAgICAgdGhpcy5jaGVja0lmQ2FuQmVDbGlja2VkKGV2LnRhcmdldClcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGNvbnN0IHkgPSBOdW1iZXIoZXYudGFyZ2V0LmdldEF0dHJpYnV0ZShcInlcIikpO1xuICAgICAgICAgICAgY29uc3QgeCA9IE51bWJlcihldi50YXJnZXQuZ2V0QXR0cmlidXRlKFwieFwiKSk7XG4gICAgICAgICAgICBoYW5kbGVyKHksIHgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGJpbmRPbkNsb3NlTG9zZShoYW5kbGVyKSB7XG4gICAgc2VsZi5hZGRFdmVudExpc3RlbmVyKFwiYmVmb3JldW5sb2FkXCIsICgpID0+IHtcbiAgICAgIGlmICh0aGlzLmdhbWVNb2RlID09IEdBTUVfTU9ERV9CQVRUTEUpIHtcbiAgICAgICAgaGFuZGxlcigpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImNvbnN0IE1vZGVsID0gcmVxdWlyZShcIi4vbW9kZWwuanNcIik7XG5jb25zdCBWaWV3ID0gcmVxdWlyZShcIi4vdmlldy5qc1wiKTtcbmNvbnN0IENvbnRyb2xsZXIgPSByZXF1aXJlKFwiLi9jb250cm9sbGVyLmpzXCIpO1xuXG5jb25zdCBhcHAgPSBuZXcgQ29udHJvbGxlcihuZXcgTW9kZWwoKSwgbmV3IFZpZXcoKSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=