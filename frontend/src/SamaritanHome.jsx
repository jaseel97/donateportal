import React, { useState } from 'react';
import DonationForm from './DonationForm';
import DonationHistory from './DonationHistory';

const SamaritanHome = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [donationSuccess, setDonationSuccess] = useState(false);

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
        <h1 className="text-3xl font-bold text-sky-900 text-center mb-8 animate-slideDown">
          Samaritan Portal
        </h1>

        {donationSuccess && (
          <div className="text-center p-3 mb-4 bg-green-100 border border-green-400 text-green-700 rounded-lg transition-all duration-300 shadow-sm">
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Donation has been successfully added!
            </span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl w-full mx-auto">
          <div className="flex-grow animate-slideInLeft">
            <DonationForm 
              onSubmit={handleSubmit}
              onDonationSuccess={handleDonationSuccess}
            />
          </div>

          <div className="w-full lg:w-96 animate-slideInRight hover:scale-[1.02] transition-transform duration-300">
            <DonationHistory refreshTrigger={refreshTrigger} />
          </div>
        </div>

        <footer className="mt-12 text-center text-sky-600 text-sm animate-slideUp">
          <p>Together we can make a difference.</p>
        </footer>
      </div>
    </div>
  );
};

export default SamaritanHome;