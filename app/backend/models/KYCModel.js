const mongoose = require('mongoose');

const KYCModel = new mongoose.Schema({
    walletAddress: { type: String, required: true, index: true }, // Adding index for faster lookup
    referenceId: { type: String, default: '' }, // Store the NFT address here
    explorerLink: { type: String, default: '' }, // Store the explorer link here
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {},
    },
    kycStatus: { type: String, default: 'null' },
    img: {
        data: Buffer,
        contentType: String
    }
});

module.exports = mongoose.model('KYC', KYCModel);
