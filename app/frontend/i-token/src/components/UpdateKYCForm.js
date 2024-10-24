import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UpdateKYCForm = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [metadata, setMetadata] = useState({});
  const [newKey, setNewKey] = useState('');  // To store the key
  const [newValue, setNewValue] = useState('');  // To store the value
  const [kycStatus, setKycStatus] = useState('pending'); // KYC Status field (pending, accepted, rejected)
  const [error, setError] = useState(''); // Error message state
  const [isKycVerified, setIsKycVerified] = useState(false); // State to check if KYC is verified

  // Function to fetch existing KYC data based on wallet address
  const fetchKycData = async () => {
    if (!walletAddress) return; // Do nothing if wallet address is empty

    try {
      const response = await axios.get(
        `http://localhost:4000/api/tokens/display?walletAddress=${walletAddress}`
      );
      const kycData = response.data;

      // Set the fetched KYC status and metadata
      setKycStatus(kycData?.kycStatus?.toString()); // Ensure kycStatus is always a string
      setMetadata(kycData.metadata);
      setIsKycVerified(kycData.kycStatus === 'accepted'); // Check if KYC is verified (accepted)
    } catch (error) {
      console.error('Error fetching KYC data:', error);
      setError(error.response?.data?.message || 'An unexpected error occurred.');
    }
  };

  // Effect to fetch KYC data when wallet address changes
  useEffect(() => {
    fetchKycData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  // Function to update KYC data
  const updateKycData = async () => {
    try {
      // Clear any previous errors
      setError('');
  
      // Ensure kycStatus is always a string
      const statusToUpdate = kycStatus ? kycStatus.toString() : 'pending'; // Fallback to 'pending' if undefined
  
      const response = await axios.post(
        "http://localhost:4000/api/tokens/updateKYC",  // Updated endpoint
        {
          walletAddress,
          kycStatus: statusToUpdate, // Ensure kycStatus is always a string when sent
        },
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlIjoibXktYmFja2VuZC1zZXJ2aWNlIiwiaWF0IjoxNzI5NTk0ODA4LCJleHAiOjIwNDUxNzA4MDh9.66XRHLU4jLcdQSJLdFTONDSYdZ4wynMXWIw5iORQhIo`,
          },
        }
      );
      console.log('KYC Data updated:', response.data);
      alert('KYC status updated successfully!');
    } catch (error) {
      console.error('Error updating KYC status:', error);
      // Set the error message from the response
      setError(error.response?.data?.message || 'An unexpected error occurred.');
    }
  };
  

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Update KYC Data</h2>
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

      {/* KYC Status Dropdown */}
      <div className="mb-4">
        <label className="block font-semibold mb-2">KYC Status</label>
        <select
          value={kycStatus}
          onChange={(e) => setKycStatus(e.target.value)}
          disabled={isKycVerified} // Disable if KYC is verified
          className="border p-2 w-full"
        >
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Display the current metadata */}
      {Object.keys(metadata).length > 0 && (
        <div>
          <h4 className="font-semibold">Current Metadata:</h4>
          <ul>
            {Object.entries(metadata).map(([key, value], index) => (
              <li key={index}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit Button to Update KYC Data */}
      <button onClick={updateKycData} className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
        Update KYC Data
      </button>
    </div>
  );
};

export default UpdateKYCForm;
