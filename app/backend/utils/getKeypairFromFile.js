const fs = require('fs');
const { Keypair } = require('@solana/web3.js');

function getKeypairFromFile(filePath) {
  const secretKey = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

module.exports = getKeypairFromFile;
