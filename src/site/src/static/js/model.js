const actions = require("./actions.js");
const AiAgent = require("./agent_ai.js");
const PlayerAgent = require("./agent_player.js");
const {
  GAME_MODE_BATTLE,
  GAME_MODE_SHIP_PLACEMENT,
  GAME_MODE_MENU,
  MAX_FLEET_SIZE,
  MISS,
  KILL,
} = require("./constants.js");

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
    // this.playerAgent.fleet = this.playerAgent.createRandomFleet();
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
