require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const userRoutes = require("./routes/userRoutes");
const paystackRoutes = require("./routes/paymentRoutes");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/connectDB");
const { default: mongoose } = require("mongoose");
const PORT = process.env.POST || 3000;
app.use(express.json());
app.use(cors(corsOptions));
app.use("/", userRoutes);
app.use("/pay", paystackRoutes);
connectDB();
mongoose.connection.once("open", () => {
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
  console.log("Connected to MongoDB");
});
