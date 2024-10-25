const express = require("express");
const cors = require("cors");
const tokenRoutes = require("./routes/index.js");
const connectDB = require("./connectDB"); // Import the connection function
const authenticateJWT = require('./utils/authMiddleware'); // JWT middleware

const app = express();
const port = process.env.PORT || 4000;

// CORS configuration
app.use(cors({ 
  origin: 'https://identitytoken.netlify.app/', 
  credentials: true 
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Set server timeout (in milliseconds)
const server = app.listen(port, async () => {
  await connectDB();
  console.log(`Backend server running on port ${port}`);
});

server.setTimeout(120000); 

// Apply JWT middleware globally (except /display route)
app.use(authenticateJWT); 

// Define API routes
app.use("/tokens", tokenRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});
