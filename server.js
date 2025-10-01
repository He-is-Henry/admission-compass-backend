require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const userRoutes = require("./routes/userRoutes");
const corsOptions = require("./config/corsOptions");
const { default: mongoose } = require("mongoose");
const PORT = process.env.POST || 3000;
app.use(express.json());
app.use(cors(corsOptions));
app.use("/", userRoutes);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
