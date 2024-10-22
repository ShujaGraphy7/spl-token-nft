import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UpdateKYCForm = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [metadata, setMetadata] = useState({});
  const [newKey, setNewKey] = useState('');  // To store the key
  const [newValue, setNewValue] = useState('');  // To store the value
  const [status, setStatus] = useState('pending'); // Status field (pending, accepted, rejected)
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
      setStatus(kycData.status);
      setMetadata(kycData.metadata);
      setIsKycVerified(kycData.status === 'accepted'); // Check if KYC is verified (accepted)
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

      const response = await axios.put(
        "http://localhost:4000/api/tokens/update",
        {
          walletAddress,
          metadata: {
            ...metadata,
            walletAddress, // Ensure walletAddress is included
          },
          status, // Include the KYC status field (pending, accepted, or rejected)
        },
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlIjoibXktYmFja2VuZC1zZXJ2aWNlIiwiaWF0IjoxNzI5NTk0ODA4LCJleHAiOjIwNDUxNzA4MDh9.66XRHLU4jLcdQSJLdFTONDSYdZ4wynMXWIw5iORQhIo`, // Send the token in the Authorization header
          },
        }
      );
      console.log('KYC Data updated:', response.data);
      alert('KYC entry updated successfully!');
    } catch (error) {
      console.error('Error updating KYC data:', error);
      // Set the error message from the response
      setError(error.response?.data?.message || 'An unexpected error occurred.');
    }
  };

  // Function to add new key-value pair to metadata
  const addMetadataField = () => {
    if (newKey && newValue) {
      setMetadata({ ...metadata, [newKey]: newValue });
      setNewKey('');  // Clear the key input
      setNewValue('');  // Clear the value input
    } else {
      setError('Please enter both key and value.'); // Set error message for empty fields
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
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={isKycVerified} // Disable if KYC is verified
          className="border p-2 w-full"
        >
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>



      <div className="mb-4">
      <label className="block font-semibold mb-2">Add new Metadata Field</label>

        <input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Metadata Key (e.g., name)"
          className="border p-2 w-full mb-2"
        />
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Metadata Value (e.g., John Doe)"
          className="border p-2 w-full mb-2"
        />
        <button type="button" onClick={addMetadataField} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          Add Metadata Field
        </button>
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
