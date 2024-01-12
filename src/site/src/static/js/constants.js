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
