const express = require("express");
const cors = require("cors");
const tokenRoutes = require("./routes/index.js");
const connectDB = require("./connectDB"); // Import the connection function

const app = express();
const port = process.env.PORT || 4000;

// CORS configuration
app.use(cors({ 
  origin: 'http://localhost:3000', 
  credentials: true 
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Define API routes
app.use("/api/tokens", tokenRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start the server only after connecting to the database
app.listen(port, async () => {
  await connectDB();
  console.log(`Backend server running on port ${port}`);
});
