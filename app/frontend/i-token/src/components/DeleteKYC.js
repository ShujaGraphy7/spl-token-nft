import React, { useState } from "react";
import axios from "axios";

const DeleteKYC = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // For button disable state

  // Function to delete KYC data
  const deleteKycData = async () => {
    if (!walletAddress) {
      alert("Please enter a wallet address to delete the KYC data.");
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete the KYC entry?");
    if (!confirmDelete) return;

    try {
      setIsSubmitting(true);

      const response = await axios.delete(
        `http://localhost:4000/api/kyc/deleteKYC/${walletAddress}`,
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlIjoibXktYmFja2VuZC1zZXJ2aWNlIiwiaWF0IjoxNzI5NTk0ODA4LCJleHAiOjIwNDUxNzA4MDh9.66XRHLU4jLcdQSJLdFTONDSYdZ4wynMXWIw5iORQhIo`,
          },
        }
      );

      console.log("KYC Data deleted:", response.data);
      alert("KYC entry deleted successfully!");
      setWalletAddress("");
    } catch (error) {
      console.error("Error deleting KYC data:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete KYC data.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Delete KYC</h2>

      <input
        type="text"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        placeholder="Enter wallet address"
        className="border p-2 w-full mb-2"
        required
      />

      <button
        onClick={deleteKycData}
        disabled={isSubmitting}
        className={`w-full bg-red-500 text-white py-2 px-4 rounded ${
          isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"
        }`}
      >
        {isSubmitting ? "Deleting..." : "Delete KYC"}
      </button>
    </div>
  );
};

export default DeleteKYC;
