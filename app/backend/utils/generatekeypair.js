const fs = require('fs');
const { Keypair } = require('@solana/web3.js');

const generateKeypair = () => {
    const keypair = Keypair.generate();
    const secretKey = Array.from(keypair.secretKey);

    // Save the keypair to a file
    fs.writeFileSync('keypair.json', JSON.stringify(secretKey));

    console.log(`Keypair generated and saved to keypair.json`);
    console.log(`Public Key: ${keypair.publicKey.toBase58()}`);
};

generateKeypair();
