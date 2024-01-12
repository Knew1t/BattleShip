const {
  BIGGEST_SHIP_LEN,
  GAME_MODE_BATTLE,
  GAME_MODE_SHIP_PLACEMENT,
  GAME_MODE_MENU,
  GRID_SIZE,
  COORD_X,
  COORD_Y,
} = require("./constants.js");
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
        // if (element.hasShip) {
        //   this.aiGrid[i][j].classList.add("cheat-ships");
        // }
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
