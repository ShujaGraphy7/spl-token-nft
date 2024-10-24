const KYCModel = require("../models/KYCModel");

// Controller to delete KYC entry for a selected user
exports.deleteKYCEntry = async (req, res) => {
    const { walletAddress } = req.params;

    try {
        // Find and delete the KYC entry by walletAddress
        const kycEntry = await KYCModel.findOneAndDelete({ walletAddress });

        if (!kycEntry) {
            return res.status(404).json({
                message: "KYC entry not found for this wallet address",
            });
        }

        return res.status(200).json({
            message: "KYC entry deleted successfully",
            walletAddress: kycEntry.walletAddress,
        });
    } catch (error) {
        console.error("Error deleting KYC entry:", error);
        return res.status(500).json({ message: "Server error while deleting KYC entry" });
    }
};
