import React, { useState } from 'react';
import CreateKYCForm from './CreateKYCForm';
import UpdateKYCForm from './UpdateKYCForm';
import DisplayKYC from './DisplayKYC';

const Navbar = () => {
  const [activeSection, setActiveSection] = useState('kyc'); // Default to 'KYC'

  // Function to render the section based on the active state
  const renderSection = () => {
    switch (activeSection) {
      case 'kyc':
        return (
          <div className="p-4 text-center">
            <CreateKYCForm/>
          </div>
        );
      case 'profile':
        return (
          <div className="p-4 text-center">
           <UpdateKYCForm/>
          </div>
        );
      case 'settings':
        return (
          <div className="p-4 text-center">
            <DisplayKYC/>
          </div>
        );
      default:
        return <div className="p-4 text-center">Select a section from the menu.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="bg-white shadow-md py-4 px-8 flex justify-center space-x-6">
        <button
          className={`py-2 px-4 rounded ${
            activeSection === 'kyc'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-black hover:bg-blue-300'
          }`}
          onClick={() => setActiveSection('kyc')}
        >
          Create Account
        </button>
        <button
          className={`py-2 px-4 rounded ${
            activeSection === 'profile'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-black hover:bg-blue-300'
          }`}
          onClick={() => setActiveSection('profile')}
        >
          Update KYC
        </button>
        <button
          className={`py-2 px-4 rounded ${
            activeSection === 'settings'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-black hover:bg-blue-300'
          }`}
          onClick={() => setActiveSection('settings')}
        >
          Dsplay KYC
        </button>
      </div>

      {/* Section Content */}
      <div className="p-8">{renderSection()}</div>
    </div>
  );
};

export default Navbar;
