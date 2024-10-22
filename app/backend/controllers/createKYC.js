const KYCModel = require("../models/KYCModel");
const multer = require("multer");
const mintNFT = require("../utils/mintNFT");

// Set up Multer for image uploads
const storage = multer.memoryStorage(); // Store the image in memory
const upload = multer({ storage: storage });

exports.createKYC = async (req, res) => {
  const { walletAddress, name, symbol, description, customMetadata } = req.body;
  const image = req.file; // Get the uploaded image

  // Validate the required fields
  if (!walletAddress || !name || !symbol || !description || !image) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Check if a KYC entry already exists for this wallet address
    let kycEntry = await KYCModel.findOne({ walletAddress });
    if (kycEntry) {
      return res.status(400).json({ message: "KYC entry already exists for this wallet address" });
    }

    // Create a new KYC entry with image data and placeholders for metadata and status
    const newKycEntry = new KYCModel({
      walletAddress,
      status: 'pending', // Set initial status as pending
      metadata: {}, // Placeholder for metadata
      img: {
        data: image.buffer, // Store image binary data
        contentType: image.mimetype, // Store MIME type
      },
    });

    // Generate the URLs for image and metadata
    const baseUrl = process.env.BASE_URL || "https://spl-token-nft.vercel.app/";
    const imageUrl = `${baseUrl}/api/tokens/image/${newKycEntry._id}`;
    const metadataUrl = `${baseUrl}/api/tokens/metadata/${newKycEntry._id}`;

    // Create the metadata object
    const metadata = {
      status: newKycEntry.status, // Include status in metadata
      metadataUrl,
      walletAddress,
      name,
      symbol,
      description,
      image: imageUrl, 
      ...JSON.parse(customMetadata || '{}'), // Merge any additional metadata
    };

    // Update the KYC entry with the metadata
    newKycEntry.metadata = metadata;

    // Save the KYC entry to the database
    await newKycEntry.save();

    // Call mintNFT to mint the NFT and pass the metadata
    console.log("Minting NFT with metadata:", metadata); // Log metadata for debugging
    const nftdata = await mintNFT(newKycEntry._id, walletAddress, metadata); // Pass kycId to mintNFT

    return res.status(201).json({
      message: "KYC entry created successfully",
      walletAddress,
      nftdata,       // NFT data from minting
      metadataUrl,   // Return the metadata URL
      imageUrl,      // Return the image URL
    });
  } catch (error) {
    console.error("Error creating KYC data:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
