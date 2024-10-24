// Validation function for KYC status update
const validateKYCStatusUpdate = (body) => {
    const { walletAddress, kycStatus } = body;
    
    // Validate wallet address
    if (!walletAddress) {
        return "Wallet address is required";
    }

    // Ensure status is a string
    if (!kycStatus || typeof kycStatus !== 'string') {
        return "Status must be a string value";
    }

    return null;  // No error
};

module.exports = { validateKYCStatusUpdate };
