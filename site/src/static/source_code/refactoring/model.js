const AiAgent = require("./agent_ai.js");
const PlayerAgent = require("./agent_player.js");
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
} = require("./constants.js");

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
