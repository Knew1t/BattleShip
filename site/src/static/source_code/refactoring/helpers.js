const { COORD_X, COORD_Y, GRID_SIZE } = require("./constants.js");

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
