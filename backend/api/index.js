require('dotenv').config(); //initialise env variables

const express = require("express");
const app = express(); //initialise express app

app.get("/", (req, res) => res.send("Hello"));

app.listen(process.env.PORT, () => console.log("Server ready on port " + process.env.PORT));

module.exports = app;
