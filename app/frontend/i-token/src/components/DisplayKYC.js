import React, { useState } from 'react';
import axios from 'axios';

const DisplayKYC = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [kycData, setKycData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to connect Phantom Wallet
  const connectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const response = await window.solana.connect(); // Request connection
        setWalletAddress(response.publicKey.toString()); // Set wallet address
        fetchKycData(response.publicKey.toString()); // Fetch KYC data after connecting
      } catch (err) {
        setError('Wallet connection failed.');
        console.error(err);
      }
    } else {
      alert('Phantom Wallet not found. Please install it to proceed.');
    }
  };

  // Function to fetch KYC data
  const fetchKycData = async (address) => {
    if (!address) {
      setError('Please connect a valid wallet address.');
      return;
    }

    try {
      setIsLoading(true);
      setError(''); // Clear any previous errors

      const response = await axios.get('http://localhost:4000/api/tokens/display', {
        params: { walletAddress: address },
      });

      console.log(response);

      setKycData(response.data); // Access data from the response
    } catch (error) {
      console.error('Error fetching KYC data:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch KYC data.';
      setError(errorMessage);
      setKycData(null); // Clear previous data on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Fetch KYC Data</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Connect Wallet Button */}
      <button
        onClick={connectWallet}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded mb-4"
      >
        {walletAddress ? "Wallet Connected" : "Connect Wallet"}
      </button>

      {/* Display wallet address if connected */}
      {walletAddress && (
        <div className="mb-4 text-gray-700">
          <strong>Connected Wallet:</strong> {walletAddress}
        </div>
      )}

      {/* Display KYC Data */}
      {kycData && (
        <div className="mt-4 bg-gray-100 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">KYC Information:</h3>
          <p className="mb-1">
            <strong>Wallet Address:</strong> {kycData.walletAddress}
          </p>

          <p className="mb-1">
            <strong>Reference ID (NFT ADDRESS):</strong> {kycData.referenceId}
          </p>

          <h4 className="font-semibold mt-2">Metadata:</h4>
          <pre className="bg-white p-2 rounded text-left overflow-auto">
            {JSON.stringify(kycData.metadata, null, 2)}
          </pre>
        </div>
      )}

      {/* Loading Spinner or Message */}
      {isLoading && (
        <div className="mt-4 text-center text-gray-600">
          Loading KYC Data...
        </div>
      )}
    </div>
  );
};

export default DisplayKYC;
