const Model = require("./model.js");
const View = require("./view.js");
const Controller = require("./controller.js");

const app = new Controller(new Model(), new View());
