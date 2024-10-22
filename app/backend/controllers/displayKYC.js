const KYCModel = require("../models/KYCModel");

exports.displayKYC = async (req, res) => {
  const { walletAddress } = req.query;

  if (!walletAddress) {
    return res.status(400).json({ message: "Wallet address is required" });
  }

  try {
    const kycData = await KYCModel.findOne({ walletAddress });

    if (!kycData) {
      return res.status(404).json({ message: "KYC data not found" });
    }

    // Extract metadata from the KYC entry
    const { kycStatus, metadata, walletAddress: addr } = kycData;

    return res.json({
      walletAddress: addr,
      kycStatus,
      metadata,  // Return metadata directly
    });
  } catch (error) {
    console.error("Error fetching KYC data:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
