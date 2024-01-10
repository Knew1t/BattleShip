const express = require("express");
const path = require("path");
const port = 3000;

const app = express();

app.use(express.static(__dirname + "/pages/"));
app.use(express.static(__dirname + "/css/"));
// app.use(express.static(__dirname + "/source_code/"));
app.use(express.static(__dirname + "/images/"));
app.use(express.static(__dirname + "/dist/"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./dist/index.html"));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

