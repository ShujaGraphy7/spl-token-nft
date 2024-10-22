// Function to generate metadata file
const fs = require("fs");
const path = require("path");
const generateMetadataFile = async (metadata, walletAddress) => {
    try {
      const filename = `${walletAddress}.json`;
      const metadataDir = path.join(__dirname, "../public/metadata");
  
      // Ensure the metadata directory exists
      if (!fs.existsSync(metadataDir)) {
        fs.mkdirSync(metadataDir, { recursive: true });
      }
  
      const filePath = path.join(metadataDir, filename);
      const metadataJson = JSON.stringify(metadata, null, 2);
  
      // Write metadata to a JSON file
      fs.writeFileSync(filePath, metadataJson);
  
      // Return the URL to the generated metadata file
      return `${
        process.env.BASE_URL || "https://spl-token-nft-chi7.vercel.app/"
      }/metadata/${filename}`;
    } catch (error) {
      console.error("Error generating metadata file:", error);
      throw new Error("Failed to generate metadata file");
    }
  };

module.exports = generateMetadataFile