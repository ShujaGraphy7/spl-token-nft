import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env

import axios from "axios";
import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
  percentAmount,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

import FormData from "form-data";
import fs from "fs";
import path from "path";

// Pinata API credentials
// Load Pinata credentials from .env file
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;
const PINATA_JWT = process.env.PINATA_JWT;

// Function to upload a file to Pinata
// Upload File to Pinata
async function uploadToPinata(filePath: string): Promise<string> {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  const data = new FormData();
  const stream = fs.createReadStream(filePath);  // Create a readable stream
  data.append("file", stream);  // Use the stream as the file content

  const response = await axios.post(url, data, {
    maxContentLength: Infinity,
    headers: {
      ...data.getHeaders(),  // Pass the headers required for form-data
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
  });

  return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
}


// Function to upload JSON metadata to Pinata
async function uploadJsonToPinata(jsonData: { name: string; symbol: string; description: string; image: string; }) {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

  const response = await axios.post(url, jsonData, {
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
  });

  return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
}

// Create a new connection to Solana's devnet cluster
const connection = new Connection(clusterApiUrl("devnet"), "finalized");

// Load keypair from local file system
const user = await getKeypairFromFile();
await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.1 * LAMPORTS_PER_SOL
);
console.log("Loaded user:", user.publicKey.toBase58());

const umi = createUmi(connection);

// Convert to Umi compatible keypair
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

// Assign signer and plugins
umi.use(keypairIdentity(umiKeypair)).use(mplTokenMetadata());

// Upload the image to Pinata
const collectionImagePath = path.resolve(__dirname, "../assets/images.jpeg");
const imageUri = await uploadToPinata(collectionImagePath);
console.log("Image uploaded to Pinata:", imageUri);

// Create metadata JSON and upload to Pinata
const metadata = {
  name: "My Collection",
  symbol: "MC",
  description: "My Collection description",
  image: imageUri,
};
const metadataUri = await uploadJsonToPinata(metadata);
console.log("Metadata uploaded to Pinata:", metadataUri);

// Generate mint keypair and create the NFT
const collectionMint = generateSigner(umi);

await createNft(umi, {
  mint: collectionMint,
  name: metadata.name,
  symbol: metadata.symbol,
  uri: metadataUri,
  updateAuthority: umi.identity.publicKey,
  sellerFeeBasisPoints: percentAmount(0),
  isCollection: true,
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });

let explorerLink = getExplorerLink(
  "address",
  collectionMint.publicKey,
  "devnet"
);
console.log(`Collection NFT: ${explorerLink}`);
console.log(`Collection NFT address is:`, collectionMint.publicKey);
console.log("✅ Finished successfully!");
