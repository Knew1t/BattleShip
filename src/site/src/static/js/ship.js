const { COORD_X, COORD_Y } = require("./constants.js");
const helpers = require("./helpers.js");

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
