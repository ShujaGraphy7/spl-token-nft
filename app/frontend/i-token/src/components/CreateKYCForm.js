import React, { useState } from "react";
import axios from "axios";

const CreateKYCForm = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null); // Store the actual image file
  const [isSubmitting, setIsSubmitting] = useState(false); // For button disable state
  const [imageLink, setImageLink] = useState(""); // To store the uploaded image URL

  const createKycData = async () => {
    if (!walletAddress || !description || !image) {
      alert("All fields are required!");
      return;
    }
  
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("walletAddress", walletAddress);
      formData.append("name", "Identity Token");
      formData.append("symbol", "IT");
      formData.append("description", description);
      formData.append("customMetadata", '{}'); // Stringify as an empty JSON object
      formData.append("image", image);
  
      const response = await axios.post(
        "http://localhost:4000/api/tokens/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          // timeout: 10000, // Optional: To avoid connection issues
        }
      );
  
      console.log("KYC Data created:", response.data);
      alert("KYC entry created successfully!");
      setWalletAddress("");
      setDescription("");
      setImage(null);
      setImageLink("");
    } catch (error) {
      console.error("Error creating KYC data:", error);
      const errorMessage = error.response?.data?.message || "Failed to create KYC data.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check for file type and size if necessary
      setImage(file); // Store the actual file in state
      setImageLink(URL.createObjectURL(file)); // Create a URL for preview
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create KYC Data</h2>

      <input
        type="text"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        placeholder="Enter wallet address"
        className="border p-2 w-full mb-2"
        required
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="border p-2 w-full mb-2"
        required
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="border p-2 w-full mb-2"
        required
      />
      {imageLink && (
        <div className="mb-2">
          <p>Image preview:</p>
          {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
          <img src={imageLink} alt="Image preview" className="w-full h-auto mb-2" />
        </div>
      )}

      <button
        onClick={createKycData}
        disabled={isSubmitting}
        className={`w-full bg-blue-500 text-white py-2 px-4 rounded ${
          isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
        }`}
      >
        {isSubmitting ? "Submitting..." : "Create KYC Data"}
      </button>
    </div>
  );
};

export default CreateKYCForm;
