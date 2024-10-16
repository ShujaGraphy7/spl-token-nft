const express = require("express");
const router = express.Router();
const multer = require("multer");

// Import controllers
const { createKYC } = require("../controllers/createKYC");
const { updateKYC } = require("../controllers/updateKYC");
const { displayKYC } = require("../controllers/displayKYC");
const KYCModel = require("../models/KYCModel");

// Set up Multer for image uploads
const storage = multer.memoryStorage(); // Store the image in memory
const upload = multer({ storage: storage }); // Multer middleware for handling file uploads

// Define routes
router.post("/create", upload.single('image'), createKYC); // Use multer for image upload
router.put("/update", updateKYC);
router.get("/display", displayKYC);

router.get('/image/:id', async (req, res) => {
    try {
      const kycEntry = await KYCModel.findById(req.params.id);
  
      if (!kycEntry || !kycEntry.img || !kycEntry.img.data) {
        return res.status(404).json({ message: "Image not found" });
      }
  
      res.set('Content-Type', kycEntry.img.contentType); // Set content type (e.g., image/jpeg)
      res.send(kycEntry.img.data); // Send the binary data
    } catch (error) {
      console.error("Error fetching image:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Route to serve metadata based on the KYC entry ID
router.get('/metadata/:id', async (req, res) => {
    try {
      const kycEntry = await KYCModel.findById(req.params.id);
  
      if (!kycEntry) {
        return res.status(404).json({ message: 'Metadata not found' });
      }
  
      res.json(kycEntry.metadata); // Serve the metadata as JSON
    } catch (error) {
      console.error("Error fetching metadata:", error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  module.exports = router;