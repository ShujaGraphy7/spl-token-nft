const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://mfoggyfaisal:shuja@cluster0.vwkfn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/kycdb");
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit if the connection fails
  }
};

module.exports = connectDB;
