const KYCModel = require("../models/KYCModel");
const multer = require("multer");
const mintNFT = require("../utils/mintNFT");

// Set up Multer for image uploads
const storage = multer.memoryStorage(); // Store the image in memory
const upload = multer({ storage: storage });

exports.createKYC = async (req, res) => {
  const { walletAddress, name, symbol, description, customMetadata } = req.body;
  const image = req.file; // Get the uploaded image

  if (!walletAddress) {
    return res.status(400).json({ message: "Wallet address is required" });
  }

  try {
    // Check if a KYC entry already exists for this wallet address
    let kycEntry = await KYCModel.findOne({ walletAddress });
    if (kycEntry) {
      return res.status(400).json({ message: "KYC entry already exists for this wallet address" });
    }

    // Create a new KYC entry with image data and placeholders for metadata
    const newKycEntry = new KYCModel({
      walletAddress,
      kycStatus: false,
      metadata: {}, // Placeholder for metadata
      img: {
        data: image.buffer, // Store image binary data
        contentType: image.mimetype, // Store MIME type
      },
    });

    // Generate the URLs for image and metadata
    const baseUrl = process.env.BASE_URL || "http://localhost:4000";
    const imageUrl = `${baseUrl}/api/tokens/image/${newKycEntry._id}`;
    const metadataUrl = `${baseUrl}/api/tokens/metadata/${newKycEntry._id}`;

    // Create the metadata object
    const metadata = {
      kycStatus: newKycEntry.kycStatus,
      metadataUrl,
      walletAddress,
      name,
      symbol,
      description,
      image: imageUrl, 
      ...customMetadata, // Merge any additional metadata
    };

    // Update the KYC entry with the metadata
    newKycEntry.metadata = metadata;

    await newKycEntry.save();

    // Ensure mintNFT function returns a proper object, not a stringified JSON
    const nftdata = await mintNFT(walletAddress, metadata);
    console.log(nftdata);

    return res.status(201).json({
      message: "KYC entry created successfully",
      walletAddress,
      nftdata,       // Ensure this is a proper object
      metadataUrl,   // Return the metadata URL
      imageUrl,      // Return the image URL
    });
  } catch (error) {
    console.error("Error creating KYC data:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
