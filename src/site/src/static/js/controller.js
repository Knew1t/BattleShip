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
