require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const userRoutes = require("./routes/userRoutes");
const paystackRoutes = require("./routes/paymentRoutes");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/connectDB");
const { default: mongoose } = require("mongoose");
const PORT = process.env.PORT || 5000;

app.use(cookieParser());
app.use(cors(corsOptions));
app.use("/pay", paystackRoutes);
app.use(express.json());
app.use("/", userRoutes);
connectDB();
mongoose.connection.once("open", () => {
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
  console.log("Connected to MongoDB");
});
