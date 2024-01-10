const playerGridDiv = document.getElementById("player-grid");
const aiGridDiv = document.getElementById("ai-grid");
const startGameButton = document.getElementById("start-game-button");
const shipSelectors = document.getElementsByClassName("ship-selector");
const FPS = 5;

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

const aiGrid = createGrid(aiGridDiv);
const playerGrid = createGrid(playerGridDiv);
let playerFleet = {};
let playerAgent = {};
let aiAgent = {};

let gameMode = GAME_MODE_MENU;
let shipSizeSelected = 0;

let selectedShip = [[-1, -1], [-1, -1]];

function customContains(array, element) {
  for (let index = 0; index < array.length; index++) {
    const el = array[index];
    if (el[0] === element[0] && el[1] === element[1]) {
      return true;
    }
  }
  return false;
}

function createGrid(gridDiv) {
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

function setScoreIcons() {
  if (gameMode == GAME_MODE_SHIP_PLACEMENT) {
    const selectorOne = Array.from(shipSelectors);
    for (let i = 0; i < selectorOne.length; i++) {
      const elem = selectorOne[i];
      let score = BIGGEST_SHIP_LEN - elem.classList[1][1] + 1;
      const scoreDiv = document.createElement("div");
      const appendSym = (elem.classList.contains("ai")) ? "●" : "○";
      while (score--) scoreDiv.textContent += appendSym;
      elem.appendChild(scoreDiv);
    }
  }
}

function paintSquare(square) {
  playerGrid[square[COORD_Y]][square[COORD_X]].classList.toggle(
    "paint-debug-border",
  );
}

function showFleet(fleet, grid) {
  fleet.ships.forEach((ship) => {
    ship.forEach((el) => {
      el.bodyCoords.forEach((element) => {
        const x = element[1];
        const y = element[0];
        // console.log("painting: ", element[0], element[1]);
        grid[y][x].classList.toggle("cheat-ships");
      });
    });
  });
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
function paintSurroundKilledShip(grid, ship, classString) {
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
  const arrayToPaint = [];
  for (const coord of ship.bodyCoords) {
    for (const direction of directions) {
      const check = [
        coord[COORD_Y] + direction[COORD_Y],
        coord[COORD_X] + direction[COORD_X],
      ];
      if (
        check[COORD_Y] < 0 ||
        check[COORD_Y] >= GRID_SIZE ||
        check[COORD_X] < 0 ||
        check[COORD_X] >= GRID_SIZE ||
        customContains(arrayToPaint, check)
      ) continue;
      arrayToPaint.push(Object.assign([], check));
    }
  }
  for (const squareToPaint of arrayToPaint) {
    if (
      !grid[squareToPaint[COORD_Y]][squareToPaint[COORD_X]].classList.contains(
        classString,
      )
    ) {
      grid[squareToPaint[COORD_Y]][squareToPaint[COORD_X]].classList.toggle(
        classString,
      );
    }
  }
}

class Agent {
  constructor(firendlyFleet, enemyFleet, enemyGrid) {
    this.enemyGrid = enemyGrid;
    this.fleet = firendlyFleet;
    this.enemyFleet = enemyFleet;
    this.myTurn = true;
    this.attackCoords = undefined;
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
}

class PlayerAgent extends Agent {
  constructor(firendlyFleet, enemyFleet, enemyGrid) {
    super(firendlyFleet, enemyFleet, enemyGrid);
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
}

class AiAgent extends Agent {
  constructor(firendlyFleet, enemyFleet, enemyGrid) {
    super(firendlyFleet, enemyFleet, enemyGrid);
    this.prevAttacks = [];
    this.memory = null;
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
        !checkDirection(
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
        !checkDirection(
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
          !checkDirection(
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
      if (!customContains(array, check)) {
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
        if (!customContains(this.prevAttacks, this.attackCoords)) break;
      }
    } catch (_error) {
      while (true) {
        this.attackCoords = [getRandomInt(9), getRandomInt(9)];
        if (!customContains(this.prevAttacks, this.attackCoords)) break;
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
}

class Warship {
  constructor(start, end, direction) {
    this.isHorizontal = direction;
    this.len = calcShipLength(start, end);
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
}
class Fleet {
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
      this.grid.grid[yCoord][xCoord] = newShip.len;
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
      try {
        const returnVal = this.grid
          .grid[square[COORD_Y] + direction[COORD_Y]][
            square[COORD_X] + direction[COORD_X]
          ];
        if (returnVal === undefined) throw "Out of array";
        return returnVal;
      } catch (error) {
        throw error;
      }
    }
    for (let i = 0; i < directions.length; i++) {
      const direction = directions[i];
      try {
        if (getSquareValueFromDirection.call(this, direction) != 0) {
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

    const len = calcShipLength(start, end);
    if (len > BIGGEST_SHIP_LEN) return false;
    return this.checkAroundSquare(start) && this.checkAroundSquare(end);
  }
}

class Grid {
  constructor(gridSize) {
    this.grid = [];
    for (let i = 0; i < gridSize; i++) {
      this.grid[i] = [];
      for (let j = 0; j < gridSize; j++) {
        this.grid[i].push(0);
      }
    }
  }

  consoleRender() {
    console.log("  0 1 2 3 4 5 6 7 8 9");
    let resultString = "";
    for (let i = 0; i < this.grid.length; i++) {
      resultString += `${i} `;
      for (let j = 0; j < this.grid[i].length; j++) {
        const outputSquareString = (this.grid[i][j] == 0)
          ? ". "
          : `${this.grid[i][j]} `;
        resultString += outputSquareString;
      }
      resultString += "\n";
    }
    console.log(resultString);
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

function placePlayerShip() {
  if (
    playerFleet.isPossible(
      selectedShip[0],
      selectedShip[1],
      isHorizontal(selectedShip[0], selectedShip[1]),
    )
  ) {
    console.log(
      "horizontal?: ",
      isHorizontal(selectedShip[0], selectedShip[1]),
    );
    const newShip = new Warship(
      selectedShip[0],
      selectedShip[1],
      isHorizontal(selectedShip[0], selectedShip[1]),
    );
    if (newShip != undefined) {
      if (playerFleet.addShip(newShip) === undefined) {
        alert("ERROR: Wrong type of a ship");
        selectedShip = [[-1, -1], [-1, -1]];
        return;
      }
      paintShip(playerGrid, newShip, "paint-friendly");
      console.log(
        "ship size: ",
        shipSizeSelected,
        " square: ",
        selectedShip[0],
        selectedShip[1],
      );
      selectedShip = [[-1, -1], [-1, -1]];
      console.log("FLEET SIZE: ", playerFleet.size);
      console.log("fleet itself: ", playerFleet);
      playerFleet.grid.consoleRender();
    } else {
      alert("ERROR");
      selectedShip = [[-1, -1], [-1, -1]];
    }
  } else {
    alert("ERROR");
    selectedShip = [[-1, -1], [-1, -1]];
  }
}

function createRandomFleet() {
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
    const { start, end, direction } = generatePossibleCoordinates(
      randomFleet,
      shipLength,
    );
    const newShip = new Warship(start, end, direction);
    if (randomFleet.addShip(newShip) == undefined) shipLength--;
    randomFleet.grid.consoleRender();
  }
  randomFleet.grid.consoleRender();
  return randomFleet;
}

for (let i = 0; i < playerGrid.length; i++) {
  for (let j = 0; j < playerGrid[i].length; j++) {
    playerGrid[i][j].addEventListener("click", () => {
      if (gameMode == GAME_MODE_SHIP_PLACEMENT) {
        if (selectedShip[0][0] < 0) {
          selectedShip[0] = [i, j];
        } else {
          selectedShip[1] = [i, j];
          if (
            selectedShip[0][COORD_X] != selectedShip[1][COORD_X] &&
            selectedShip[0][COORD_Y] != selectedShip[1][COORD_Y]
          ) {
            alert("ERROR: Ships can not be placed diagonally.");
            selectedShip = [[-1, -1], [-1, -1]];
          }
        }
      }
    });
  }
}

for (let i = 0; i < aiGrid.length; i++) {
  for (let j = 0; j < aiGrid[i].length; j++) {
    aiGrid[i][j].addEventListener("click", (ev) => {
      if (gameMode == GAME_MODE_BATTLE) {
        console.log("battle click");
        if (!ev.target.classList.contains("paint-miss")) {
          playerAgent.attackCoords = [i, j];
        }
      }
    });
  }
}

for (let i = 0; i < shipSelectors.length; i++) {
  shipSelectors[i].addEventListener("click", () => {
    if (gameMode == GAME_MODE_SHIP_PLACEMENT) shipSizeSelected = i + 1;
    else shipSizeSelected = 0;
  });
}

function isHorizontal(start, end) {
  return (start[COORD_Y] == end[COORD_Y]) ? 1 : 0;
}

function gameLoop() {
  const setIntervalId = setInterval(function () {
    if (gameMode == GAME_MODE_SHIP_PLACEMENT) {
      if (playerFleet.size == MAX_FLEET_SIZE) {
        gameMode = GAME_MODE_BATTLE;
      } else {
        if (selectedShip[0][0] >= 0 && selectedShip[1][0] >= 0) {
          placePlayerShip();
        }
      }
    } else if (gameMode == GAME_MODE_BATTLE) {
      playTurn();
    } else if (gameMode == GAME_MODE_MENU) {
      startGameButton.classList.toggle("hidden");
      clearInterval(setIntervalId);
      return;
    }
  }, 1000 / FPS);
}

function paintShip(grid, ship, cssClassString) {
  for (let i = 0; i < ship.bodyCoords.length; i++) {
    const coord = ship.bodyCoords[i];
    grid[coord[COORD_Y]][coord[COORD_X]].classList.toggle(
      cssClassString,
    );
  }
}

startGameButton.addEventListener("click", () => {
  gameMode = GAME_MODE_SHIP_PLACEMENT;
  startGameButton.classList.toggle("hidden");
  setScoreIcons();
  const aiFleet = createRandomFleet();
  aiFleet.grid.consoleRender();
  // showFleet(aiFleet, aiGrid);
  // const pGrid = new Grid(GRID_SIZE);
  // playerFleet = new Fleet(pGrid);
  playerFleet = createRandomFleet();
  showFleet(playerFleet, playerGrid);
  playerAgent = new PlayerAgent(playerFleet, aiFleet, aiGrid);
  aiAgent = new AiAgent(aiFleet, playerFleet, playerGrid);
  gameLoop();
});

function playTurn() {
  playerAgent.attack();
  aiAgent.myTurn = !playerAgent.myTurn;
  aiAgent.attack();
  playerAgent.myTurn = !aiAgent.myTurn;

  console.log("PLAYER HP: ", playerAgent.checkHealth());
  console.log("____AI HP: ", aiAgent.checkHealth());
  if (aiAgent.checkHealth() == 0 && playerAgent.checkHealth() == 0) {
    gameMode = GAME_MODE_MENU;
    console.log("GAME OVER");
    console.log("DUE!");
  } else if (playerAgent.checkHealth() == 0) {
    console.log("GAME OVER");
    console.log("YOU LOST!");
    gameMode = GAME_MODE_MENU;
  } else if (aiAgent.checkHealth() == 0) {
    console.log("GAME OVER");
    console.log("YOU WON!");
    gameMode = GAME_MODE_MENU;
  }
}
