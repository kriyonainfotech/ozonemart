const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");

dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(cors()); // allows requests from React frontend or Postman
app.use(express.json()); // parse JSON request body


app.use("/api", require("./src/routes/indexRoute"));

// Test GET route
app.get("/", (req, res) => {
    res.send("✅ Server is up and running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
