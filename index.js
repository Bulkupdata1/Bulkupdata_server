require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const mongoose = require("mongoose");
const reloadlyRouter = require("./src/router/reloadlyRouter");
const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: "https://www.bulkupdata.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/reloadly", reloadlyRouter);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("BulkUp Server is running!");
});

const PORT = process.env.PORT || 1212;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
