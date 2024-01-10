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
