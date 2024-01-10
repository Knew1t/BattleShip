const Model = require("./model.js");
const View = require("./view.js");
const Controller = require("./controller.js");
const { Square, Grid } = require("./grid.js");

const app = new Controller(new Model(), new View());
//
//
//
app.init();
// console.log("hello");
