const KYCModel = require("../models/KYCModel");

exports.updateKYC = async (req, res) => {
  const { walletAddress, metadata, kycStatus } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ message: "Wallet address is required" });
  }

  try {
    let kycEntry = await KYCModel.findOne({ walletAddress });

    if (!kycEntry) {
      return res.status(404).json({
        message: "KYC entry not found for this wallet address",
      });
    }

    // Update metadata if provided
    if (metadata) {
      for (let key in metadata) {
        kycEntry.metadata.set(key, metadata[key]);
      }
    }

    // If status is being updated
    if (kycStatus !== undefined) {
      
      kycEntry.kycStatus = kycStatus;
    }

    // Ensure status exists in both metadata and the main field
    kycEntry.metadata.set("kycStatus", kycEntry.kycStatus);

    // Update walletAddress in metadata for consistency
    kycEntry.metadata.set("walletAddress", walletAddress);

    await kycEntry.save();

    return res.status(200).json({
      message: "KYC data updated successfully",
      walletAddress,
      kycStatus: kycEntry.kycStatus, // Return updated status
      metadata: Object.fromEntries(kycEntry.metadata), // Convert Map to plain object
    });
  } catch (error) {
    console.error("Error updating KYC data:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
