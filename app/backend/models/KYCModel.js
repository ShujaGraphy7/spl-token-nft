const mongoose = require('mongoose');

const KYCModel = new mongoose.Schema({
    walletAddress: { type: String, required: true },
    metadata: {
        type: Map,  // Using a Map to store dynamic key-value pairs
        of: mongoose.Schema.Types.Mixed,  // Flexible schema to store any type of data
        default: { kycStatus: false, explorerLink: '' }  // kycStatus is part of metadata and defaults to false, explorerLink empty by default
    },
    img: {
        data: Buffer,
        contentType: String
    }
});

module.exports = mongoose.model('KYC', KYCModel);
