const mongoose = require('mongoose');

const KYCModel = new mongoose.Schema({
    walletAddress: { type: String, required: true },
    kycStatus: { type: Boolean, default: false },  // Default KYC status
    metadata: {
        type: Map,  // Using a Map to store dynamic key-value pairs
        of: mongoose.Schema.Types.Mixed,  // Flexible schema to store any type of data
        default: { kycStatus: false }  // kycStatus is part of metadata and defaults to false
    },
    img: {
        data: Buffer,
        contentType: String
    }
});

module.exports = mongoose.model('KYC', KYCModel);
