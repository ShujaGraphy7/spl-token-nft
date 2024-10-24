const KYCModel = require("../models/KYCModel");
const { validateKYCStatusUpdate } = require("../utils/validators");

// Controller to update KYC status and other fields
exports.updateKYCStatus = async (req, res) => {
    // Validate request body
    const error = validateKYCStatusUpdate(req.body);
    if (error) {
        return res.status(400).json({ message: error });
    }

    const { walletAddress, kycStatus, referenceId, explorerLink, img } = req.body;

    try {
        // Find KYC entry by wallet address
        let kycEntry = await KYCModel.findOne({ walletAddress });

        if (!kycEntry) {
            return res.status(404).json({
                message: "KYC entry not found for this wallet address",
            });
        }

        // Update KYC status and other fields if provided
        if (kycStatus) {
            kycEntry.kycStatus = kycStatus;

            // Also update kycStatus in metadata if it exists there
            if (kycEntry.metadata) {
                kycEntry.metadata.set('kycStatus', kycStatus); // Ensure metadata map is updated
            }
        }
        if (referenceId) kycEntry.referenceId = referenceId;
        if (explorerLink) kycEntry.explorerLink = explorerLink;
        if (img) kycEntry.img = img; // Make sure `img` is provided in the correct format

        // Save the updated KYC entry
        await kycEntry.save();

        return res.status(200).json({
            message: "KYC entry updated successfully",
            walletAddress: kycEntry.walletAddress,
            kycStatus: kycEntry.kycStatus,
            referenceId: kycEntry.referenceId,
            explorerLink: kycEntry.explorerLink,
            metadata: kycEntry.metadata,  // Return updated metadata including kycStatus
        });
    } catch (error) {
        console.error("Error updating KYC entry:", error);
        return res.status(500).json({ message: "Server error while updating KYC entry" });
    }
};
