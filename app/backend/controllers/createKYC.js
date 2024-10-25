const KYCModel = require("../models/KYCModel");
const multer = require("multer");
const mintNFT = require("../utils/mintNFT");

require("dotenv").config();

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
      kycStatus: 'null', // Set initial status as pending
      metadata: {}, // Placeholder for metadata
      img: {
        data: image.buffer, // Store image binary data
        contentType: image.mimetype, // Store MIME type
      },
    });

    // Generate the URLs for image and metadata
    const baseUrl = process.env.BASE_URL;
    const imageUrl = `${baseUrl}/tokens/image/${newKycEntry._id}`;
    const metadataUrl = `${baseUrl}/tokens/metadata/${newKycEntry._id}`;

    // Create the metadata object
    const metadata = {
      kycStatus: newKycEntry.kycStatus, // Include status in metadata
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
    const nftData = await mintNFT(newKycEntry._id, walletAddress, metadata); // Pass kycId to mintNFT

    // If the NFT was minted successfully, update the KYC entry with the referenceId (nftAddress)
    if (nftData.success && nftData.nftAddress) {
      newKycEntry.referenceId = nftData.nftAddress; // Set the NFT address as the reference number
      await newKycEntry.save(); // Save the updated KYC entry with the NFT address
    }

    // Return the KYC entry and NFT minting information in the response
    return res.status(201).json({
      message: "KYC entry created successfully",
      walletAddress,
      nftData,         // Include the NFT data (explorer link and nftAddress)
      metadataUrl,
      imageUrl,
      referenceId: nftData.nftAddress || '', // Return the referenceId (NFT address) in the response
    });
  } catch (error) {
    console.error("Error creating KYC data:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
