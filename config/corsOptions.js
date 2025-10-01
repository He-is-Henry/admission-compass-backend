const allowList = require("./allowList");

const corsOptions = {
  origin: allowList,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
