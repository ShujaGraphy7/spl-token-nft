import React, { useState } from "react";
import axios from "axios";
import {
  PublicKey,
  Connection,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createBurnCheckedInstruction,
} from "@solana/spl-token";

const DisplayKYC = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [kycData, setKycData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const connection = new Connection("https://api.devnet.solana.com");

  // Function to connect Phantom Wallet
  const connectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const response = await window.solana.connect();
        setWalletAddress(response.publicKey.toString());
        fetchKycData(response.publicKey.toString()); // Fetch KYC data after connecting
      } catch (err) {
        setError("Wallet connection failed.");
        console.error(err);
      }
    } else {
      alert("Phantom Wallet not found. Please install it to proceed.");
    }
  };

  // Function to fetch KYC data
  const fetchKycData = async (address) => {
    try {
      setIsLoading(true);
      setError(""); // Clear any previous errors

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/tokens/display`,
        {
          params: { walletAddress: address },
        }
      );

      setKycData(response.data); // Access data from the response
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch KYC data.";
      setError(errorMessage);
      setKycData(null); // Clear previous data on error
    } finally {
      setIsLoading(false);
    }
  };

  const burnNFT = async () => {
    if (!kycData) return alert("Please fetch KYC data first.");
    const MINT_ADDRESS = kycData.referenceId;

    try {
      console.log(`Step 1 - Fetch Token Account`);
      const account = await getAssociatedTokenAddress(
        new PublicKey(MINT_ADDRESS),
        new PublicKey(walletAddress)
      );
      console.log(
        `✅ - Associated Token Account Address: ${account.toString()}`
      );

      console.log(`Step 2 - Create Burn Instructions`);
      const burnIx = createBurnCheckedInstruction(
        account,
        new PublicKey(MINT_ADDRESS),
        new PublicKey(walletAddress),
        1,
        0
      );
      console.log(`✅ - Burn Instruction Created`);

      console.log(`Step 3 - Fetch Blockhash`);
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("finalized");
      console.log(`✅ - Latest Blockhash: ${blockhash}`);

      console.log(`Step 4 - Assemble Transaction`);
      const messageV0 = new TransactionMessage({
        payerKey: new PublicKey(walletAddress),
        recentBlockhash: blockhash,
        instructions: [burnIx],
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);

      if (!transaction) {
        throw new Error(
          "Transaction is undefined. Check transaction creation and message format."
        );
      }

      console.log(`Step 5 - Requesting Signature and Sending Transaction`);
      const { signature } = await window.solana.signAndSendTransaction(
        transaction
      );

      if (!signature) {
        throw new Error(
          "Failed to sign and send transaction. Ensure Phantom Wallet is connected and has permission."
        );
      }

      console.log("✅ - Transaction sent to network");
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      if (confirmation.value.err)
        throw new Error("❌ - Transaction not confirmed.");
      console.log(
        "🔥 SUCCESSFUL BURN!🔥",
        `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      );
      alert("NFT burned successfully!");

      // Step 7 - Call backend to delete KYC entry
      console.log("Step 7 - Deleting KYC entry from backend");
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/tokens/deleteKYC/${walletAddress}`
      );
      alert("KYC entry deleted successfully from backend");
    } catch (error) {
      console.error("Error burning NFT:", error);
      alert(`Failed to burn NFT. Error: ${error.message}`);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Fetch & Burn NFT</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>
      )}

      <button
        onClick={connectWallet}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded mb-4"
      >
        {walletAddress ? "Wallet Connected" : "Connect Wallet"}
      </button>

      {walletAddress && (
        <div className="mb-4 text-gray-700">
          <strong>Connected Wallet:</strong> {walletAddress}
        </div>
      )}

      {kycData && (
        <div className="mt-4 bg-gray-100 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">KYC Information:</h3>
          <p>
            <strong>Wallet Address:</strong> {kycData.walletAddress}
          </p>
          <button
            onClick={burnNFT}
            className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded"
          >
            Burn NFT
          </button>
        </div>
      )}

      {isLoading && (
        <div className="mt-4 text-center text-gray-600">
          Loading KYC Data...
        </div>
      )}
    </div>
  );
};

export default DisplayKYC;
