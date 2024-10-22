const KYCModel = require("../models/KYCModel");

exports.updateKYC = async (req, res) => {
  const { walletAddress, metadata, status } = req.body;

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

    // Check if the KYC is verified (previously verified as accepted)
    const isVerified = kycEntry.status === 'accepted';

    // Update metadata if provided
    if (metadata) {
      for (let key in metadata) {
        kycEntry.metadata.set(key, metadata[key]);
      }
    }

    // If status is being updated
    if (status !== undefined) {
      if (isVerified && status !== 'accepted') {
        // Prevent changing status from accepted to pending or rejected
        return res.status(400).json({
          message: "Cannot change KYC status from accepted to pending or rejected.",
        });
      }

      // Update the main status field
      kycEntry.status = status;
    }

    // Ensure status exists in both metadata and the main field
    kycEntry.metadata.set("status", kycEntry.status);

    // Update walletAddress in metadata for consistency
    kycEntry.metadata.set("walletAddress", walletAddress);

    await kycEntry.save();

    return res.status(200).json({
      message: "KYC data updated successfully",
      walletAddress,
      status: kycEntry.status, // Return updated status
      metadata: Object.fromEntries(kycEntry.metadata), // Convert Map to plain object
    });
  } catch (error) {
    console.error("Error updating KYC data:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
