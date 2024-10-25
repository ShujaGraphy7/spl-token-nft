const express = require("express");
const router = express.Router();
const multer = require("multer");

// Import controllers
const { createKYC } = require("../controllers/createKYC");
const { updateKYC } = require("../controllers/updateKYC");
const { displayKYC } = require("../controllers/displayKYC");
const { updateKYCStatus } = require("../controllers/updateKYCStatus");
const KYCModel = require("../models/KYCModel");
const { deleteKYCEntry } = require("../controllers/deleteKYC");

// Set up Multer for image uploads
const storage = multer.memoryStorage(); // Store the image in memory
const upload = multer({ storage: storage }); // Multer middleware for handling file uploads

// Define routes
router.post("/create", upload.single('image'), createKYC); // Use multer for image upload
router.put("/update", updateKYC);
router.post("/updateKYC", updateKYCStatus);
router.get("/display", displayKYC);
router.delete('/deleteKYC/:walletAddress', deleteKYCEntry);


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
    // Fetch the KYC entry from the database using the provided ID
    const kycEntry = await KYCModel.findById(req.params.id);

    // If no entry is found, return a 404 error
    if (!kycEntry) {
      return res.status(404).json({ message: 'Metadata not found' });
    }

    // Return the metadata as a JSON response
    return res.json(kycEntry.metadata); // Serve the actual metadata
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return res.status(500).json({ message: 'Server error' });
  }
});
  
  module.exports = router;
