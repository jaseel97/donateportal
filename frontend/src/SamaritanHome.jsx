import React, { useState } from 'react';
import DonationForm from './DonationForm';
import DonationHistory from './DonationHistory';
import { useLocation } from 'react-router-dom';
import UsernameAva from './UsernameAva';

const SamaritanHome = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const location = useLocation();
  const { username } = location.state || {};

  const handleSubmit = (data) => {
    console.log('Donation submitted:', data);
    setDonationSuccess(true);
    setTimeout(() => {
      setDonationSuccess(false);
    }, 3000);
  };

  const handleDonationSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-sky-50 to-indigo-50 animate-fadeIn">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="flex justify-center items-center mb-8 relative">
          <h1 className="text-3xl font-bold text-sky-900 animate-slideDown">
            Samaritan Portal
          </h1>
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <UsernameAva username={username} />
          </div>
        </div>

        {/* Success Message */}
        {donationSuccess && (
          <div className="text-center p-3 mb-4 bg-green-100 border border-green-400 text-green-700 rounded-lg transition-all duration-300 shadow-sm">
            <span className="flex items-center justify-center gap-2">
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
              Donation has been successfully added!
            </span>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl w-full mx-auto">
          {/* Donation Form Section */}
          <div className="flex-grow animate-slideInLeft">
            <DonationForm 
              onSubmit={handleSubmit}
              onDonationSuccess={handleDonationSuccess}
              username={username}
            />
          </div>

          {/* Donation History Section */}
          <div className="w-full lg:w-96 animate-slideInRight hover:scale-[1.02] transition-transform duration-300">
            <DonationHistory 
              refreshTrigger={refreshTrigger}
              username={username}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sky-600 text-sm animate-slideUp">
          <p>Together we can make a difference.</p>
        </footer>
      </div>
    </div>
  );
};

export default SamaritanHome;