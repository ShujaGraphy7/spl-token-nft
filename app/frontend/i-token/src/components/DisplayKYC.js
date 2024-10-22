import React, { useState } from 'react';
import axios from 'axios';

const DisplayKYC = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [kycData, setKycData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  // Function to fetch KYC data
  const fetchKycData = async () => {
    if (!walletAddress) {
      setError('Please enter a valid wallet address.');
      return;
    }

    try {
      setIsLoading(true);
      setError(''); // Clear any previous errors

      const response = await axios.get('http://localhost:4000/api/tokens/display', {
        params: { walletAddress },
      });

      setKycData(response.data);
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

      {/* Wallet Address Input */}
      <input
        type="text"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        placeholder="Enter wallet address"
        className="border p-2 w-full mb-2"
        required
      />

      <button
        onClick={fetchKycData}
        disabled={isLoading}
        className={`w-full bg-blue-500 text-white py-2 px-4 rounded ${
          isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
        }`}
      >
        {isLoading ? 'Loading...' : 'Fetch KYC Data'}
      </button>

      {/* Display KYC Data */}
      {kycData && (
        <div className="mt-4 bg-gray-100 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">KYC Information:</h3>
          <p className="mb-1">
            <strong>Wallet Address:</strong> {kycData.walletAddress}
          </p>
          
          <h4 className="font-semibold mt-2">Metadata:</h4>
          <pre className="bg-white p-2 rounded text-left overflow-auto">
            {JSON.stringify(kycData.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DisplayKYC;
