const {
  createNft,
  mplTokenMetadata,
} = require("@metaplex-foundation/mpl-token-metadata");
const { generateSigner, keypairIdentity } = require("@metaplex-foundation/umi");
const { createUmi } = require("@metaplex-foundation/umi-bundle-defaults");
const {
  getExplorerLink,
  getKeypairFromEnvironment,
} = require("@solana-developers/helpers");
const {
  clusterApiUrl,
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  Keypair,
} = require("@solana/web3.js");
const {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
} = require("@solana/spl-token");

const KYCModel = require('../models/KYCModel'); // Import the KYC model

require("dotenv").config();

const mintNFT = async (kycId, recieverAddress, metadata) => {
  try {
    // Initialize Solana connection
    const SOLANA_CONNECTION = new Connection(clusterApiUrl("devnet"), "finalized");

    // Load user keypair from environment variable
    const user = await getKeypairFromEnvironment("SECRET_KEY");
    console.log("Loaded user:", user.publicKey.toBase58());

    // Create Umi instance with the connection
    const umi = createUmi(SOLANA_CONNECTION);
    const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

    umi.use(keypairIdentity(umiKeypair)).use(mplTokenMetadata());

    // Generate new signer for minting NFT
    const collectionMint = generateSigner(umi);

    // Create the NFT
    await createNft(umi, {
      mint: collectionMint,
      name: metadata.name,   // Ensure metadata.name is valid
      symbol: metadata.symbol,
      uri: metadata.metadataUrl,
      updateAuthority: umi.identity.publicKey,
      sellerFeeBasisPoints: 0,
      isCollection: true,
    }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

    // Load secret key from .env and validate
    const secretKey = new Uint8Array(JSON.parse(process.env.SECRET_KEY));
    if (secretKey.length !== 64) {
      throw new Error("Invalid secret key size. Expected 64 bytes.");
    }
    const FROM_KEYPAIR = Keypair.fromSecretKey(secretKey);

    console.log(`My public key is: ${FROM_KEYPAIR.publicKey.toString()}.`);

    // Validate the receiver address
    const isValidPublicKey = (key) => {
      try {
        new PublicKey(key);
        return true;
      } catch {
        return false;
      }
    };

    if (!isValidPublicKey(recieverAddress)) {
      throw new Error("Invalid receiver public key.");
    }

    const DESTINATION_WALLET = recieverAddress;
    const MINT_ADDRESS = collectionMint.publicKey.toString(); // Ensure this is a string

    const TRANSFER_AMOUNT = 1;

    // Get or create associated token accounts for the sender
    let sourceAccount = await getOrCreateAssociatedTokenAccount(
      SOLANA_CONNECTION,
      FROM_KEYPAIR,
      new PublicKey(MINT_ADDRESS),
      FROM_KEYPAIR.publicKey
    );
    console.log(`    Source Account: ${sourceAccount.address.toString()}`);

    // Get or create associated token accounts for the receiver
    let destinationAccount = await getOrCreateAssociatedTokenAccount(
      SOLANA_CONNECTION,
      FROM_KEYPAIR,
      new PublicKey(MINT_ADDRESS),
      new PublicKey(DESTINATION_WALLET)
    );
    console.log(`    Destination Account: ${destinationAccount.address.toString()}`);

    // Create and send transfer transaction to transfer the NFT ownership
    const tx = new Transaction().add(
      createTransferInstruction(
        sourceAccount.address,
        destinationAccount.address,
        FROM_KEYPAIR.publicKey,
        TRANSFER_AMOUNT
      )
    );

    const latestBlockHash = await SOLANA_CONNECTION.getLatestBlockhash("finalized");
    tx.recentBlockhash = latestBlockHash.blockhash;

    const signature = await sendAndConfirmTransaction(SOLANA_CONNECTION, tx, [
      FROM_KEYPAIR,
    ]);

    console.log(`Transfer Signature: ${signature}`);

    // Get and display the NFT Explorer link
    const explorerLink = getExplorerLink(
      "address",
      collectionMint.publicKey,
      "devnet"
    );

    console.log(`NFT Explorer Link: ${explorerLink}`);

    // Update the KYC record with the explorer link in metadata
    await KYCModel.findByIdAndUpdate(kycId, {
      $set: {
        'metadata.explorerLink': explorerLink
      }
    });

    console.log(`KYC metadata updated with explorerLink: ${explorerLink}`);

    return { success: true, explorerLink };
  } catch (error) {
    console.error("Error minting NFT:", error);
    return { success: false, error: error.message };
  }
};

module.exports = mintNFT;
