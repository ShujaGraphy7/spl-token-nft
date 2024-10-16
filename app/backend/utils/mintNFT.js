const { createNft, mplTokenMetadata } = require("@metaplex-foundation/mpl-token-metadata");
const { generateSigner, keypairIdentity } = require("@metaplex-foundation/umi");
const { createUmi } = require("@metaplex-foundation/umi-bundle-defaults");
const { getExplorerLink, getKeypairFromFile } = require("@solana-developers/helpers");
const { clusterApiUrl, Connection } = require("@solana/web3.js");

const mintNFT = async (walletAddress, metadata) => {
  try {
    const connection = new Connection(clusterApiUrl("devnet"), "finalized");
    const user = await getKeypairFromFile();

    console.log("Loaded user:", user.publicKey.toBase58());
    const umi = createUmi(connection);
    const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

    umi.use(keypairIdentity(umiKeypair)).use(mplTokenMetadata());

    const collectionMint = generateSigner(umi);

    await createNft(umi, {
      mint: collectionMint,
      name: "kyc Token",
      symbol: "KT",
      uri: metadata,
      updateAuthority: umi.identity.publicKey,
      sellerFeeBasisPoints: 0,
      isCollection: true,
    }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

    const explorerLink = getExplorerLink(
      "address",
      collectionMint.publicKey,
      "devnet"
    );

    console.log(`NFT Explorer Link: ${explorerLink}`);
    return { success: true, explorerLink };
  } catch (error) {
    console.error("Error minting NFT:", error);
    return { success: false, error: error.message };
  }
};

module.exports = mintNFT;
