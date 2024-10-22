const KYCModel = require("../models/KYCModel");

exports.displayKYC = async (req, res) => {
  const { walletAddress } = req.query;

  if (!walletAddress) {
    return res.status(400).json({ message: "Wallet address is required" });
  }

  try {
    // Find the KYC data based on the wallet address
    const kycData = await KYCModel.findOne({ walletAddress });

    if (!kycData) {
      return res.status(404).json({ message: "KYC data not found" });
    }

    const { metadata, walletAddress: addr } = kycData;
    const kycStatus = metadata.get('kycStatus');  // Access kycStatus from metadata

    return res.json({
      walletAddress: addr,
      kycStatus,   // Return kycStatus from metadata
      metadata,    // Return metadata directly (including explorerLink if present)
    });
  } catch (error) {
    console.error("Error fetching KYC data:", error);
    return res.status(500).json({ message: "Server error" });
  }
};