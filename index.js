const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

require('dotenv').config()

const app = express();
async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECT_URI);
    console.log("Connected to MongoDB Atlasrer");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
  }
}

connectToDB();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("views", "./src/views");
app.set("view engine", "ejs");

app.use(express.static("public"));

require("./startup/routes")(app);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Acesse: http://localhost:${port}/`));

//rntmendes11
//goaO0uOkFhQkBkUo