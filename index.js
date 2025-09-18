require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const mongoose = require("mongoose");
const reloadlyRouter = require("./src/router/reloadlyRouter");
const app = express();
const server = http.createServer(app);
const authRouter = require("./src/router/authRoutes");
const adminRoutes = require("./src/router/adminRoutes");


app.use(
  cors({
    origin: ["https://www.bulkupdata.com", "http://localhost:5174/", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// app.use(
//   cors({
//     origin: "*", your frontend URL
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/reloadly", reloadlyRouter);
app.use("/api/auth", authRouter);
app.use("/api/reloadly/admin/auth", adminRoutes);

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
