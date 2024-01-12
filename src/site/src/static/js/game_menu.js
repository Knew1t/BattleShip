const playerGridDiv = document.getElementById('player-grid');
const pcGridDiv = document.getElementById('ai-grid');
const startGameButton = document.getElementById('start-game-button');

const MAX_HEALTH = 16;
const BIGGEST_SHIP_LEN = 5;
const BATTLE = 2;
const SHIP_PLACEMENT = 1;
const IN_MENU = 0;
const GRID_SIZE = 10;
const MAX_FLEET_SIZE = 10;
const X = 1;
const Y = 0;

const playerGird = createGrid(playerGridDiv);
const aiGrid = createGrid(pcGridDiv);
const sqrs = [].concat(playerGird, aiGrid);

let gameState = IN_MENU;
let playerHealth = MAX_HEALTH;
let aiHealth = MAX_HEALTH;


function calcShipLength(start, end) {
  return ((start[X] == end[X]) ? Math.abs(start[Y] - end[Y]) : Math.abs(start[X] - end[X])) + 1;
}

class WarShip {
  constructor(coordA, coordB, direction) {
    if (coordA[X] != coordB[X] && coordA[Y] != coordB[Y])
      return undefined;

    this.len = calcShipLength(coordA, coordB);
    this.bodyCoords = [coordA];

    console.log(`${this.len}sq SHIP`, coordA);
    let nextSquare = Object.assign([], coordA);
    while (this.bodyCoords.length < this.len) {
      nextSquare[direction]++;
      console.log(`${this.len}sq SHIP`, nextSquare);
      this.bodyCoords.push(nextSquare);
    }
    console.log(`${this.len}sq SHIP CREATED`);
  }
}

class Fleet {
  constructor() {
    this.health = MAX_HEALTH;
    this.ships = [[], [], [], []];
  }

  addShip(start, end, direction) {
    let len = calcShipLength(start, end);
    if (this.ships[len - 1].length >= BIGGEST_SHIP_LEN - len)
      return false;// no more sheeps of current len needed
    this.ships[len - 1].push(new WarShip(start, end, direction));
    return true;
  }

  size() {
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * (max + 1));
}
function createGrid(grid) {
  const squares = [];
  // DocumentFragment is better than appending to DOM directly
  const tmpGrid = document.createDocumentFragment();
  for (let i = 0; i < GRID_SIZE; i++) {
    squares[i] = [];
    for (let j = 0; j < GRID_SIZE; j++) {
      const square = document.createElement('div');
      square.classList.add("square");
      square.setAttribute("x", `${j}`);
      square.setAttribute("y", `${i}`);
      squares[i][j] = tmpGrid.appendChild(square);
    }
  }
  grid.appendChild(tmpGrid);
  return squares;
}

function setScoreIcons() {
  const selectorOne = Array.from(document.getElementsByClassName('ship-selector'));
  for (let i = 0; i < selectorOne.length; i++) {
    const elem = selectorOne[i];
    let score = BIGGEST_SHIP_LEN - elem.classList[1][1];
    const scoreDiv = document.createElement('div');
    const appendSym = (elem.classList.contains('ai')) ? '●' : '○';
    while (score--) scoreDiv.textContent += appendSym;
    elem.appendChild(scoreDiv);
  }
}

function placeAiShips() {
  // if (gameState != SHIP_PLACEMENT)
  //   return undefined;

  const aiFleet = new Fleet();
  for (let i = 0; i < 4;) {
    const start = [getRandomInt(GRID_SIZE - 1), getRandomInt(GRID_SIZE - 1)];
    const direction = (getRandomInt(1));//direction horizontal or vertical
    let end = (direction == X) ? [start[Y], start[X] + i] : [start[Y] + i, start[X]];
    if (!aiFleet.addShip(start, end, direction) && i != 4) {
      i++;
      console.log(`=========${i + 1}SQ SHIP CONSTRUCTION-=========================`);
    }
  }
  console.log(aiFleet);
  return aiFleet;
}

function placePlayerShips() {
  if (gameState != SHIP_PLACEMENT)
    return undefined;
}

function playerTurn() {
}

function aiTurn() {
}

function gameplayLoop() {
  const aiFleet = placeAiShips();
  showFleet(aiFleet);
  // const playerFleet = placePlayerShips();
  // gameState = BATTLE;
  // while (gameState == BATTLE) {
  //   playerTurn();
  //   aiTurn();
  // }
}


startGameButton.addEventListener('click', () => {
  if (!gameState) {
    gameState = SHIP_PLACEMENT;
    // startGameButton.classList.toggle('hidden');
    setScoreIcons();
    gameplayLoop();
  }
});

function showFleet(fleet) {
  fleet.ships.forEach(ship => {
    ship.forEach(el => {
      el.bodyCoords.forEach(element => {
        let x = element[1];
        let y = element[0];
        aiGrid[y][x].classList.toggle("cheat-ships");
      });
    });
  });
}
