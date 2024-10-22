const mongoose = require('mongoose');

const KYCModel = new mongoose.Schema({
    walletAddress: { type: String, required: true },
    metadata: {
        type: Map,  // Using a Map to store dynamic key-value pairs
        of: mongoose.Schema.Types.Mixed,  // Flexible schema to store any type of data
        default: { explorerLink: '' },  // Removed kycStatus from metadata
    },
    status: { type: String, enum: ['pending', 'rejected', 'accepted'], default: 'pending' },  // New status field
    img: {
        data: Buffer,
        contentType: String
    }
});

module.exports = mongoose.model('KYC', KYCModel);
