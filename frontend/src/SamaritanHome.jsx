import React, { useState } from 'react';
import DonationForm from './DonationForm';
import DonationHistory from './DonationHistory';

export default function SamaritanHome() {
  const [donations, setDonations] = useState([]);
  
  const categories = [
    { id: 'clothes', name: 'Clothes' },
    { id: 'food', name: 'Food' },
    { id: 'toys', name: 'Toys' },
    { id: 'others', name: 'Others' }
  ];

  const handleDonationSubmit = (formData) => {
    const newDonation = {
      id: Date.now(),
      ...formData,
      status: 'processing'
    };
    setDonations(prev => [newDonation, ...prev]);
  };

  return (
    <div className="min-h-screen w-full max-w-7xl bg-gradient-to-br from-rose-50 via-sky-50 to-indigo-50 animate-fadeIn">
      <div className="mx-auto p-6">
        <h1 className="text-3xl font-bold text-sky-900 text-center mb-8 animate-slideDown">
          Samaritan Donation Portal
        </h1>
        
        <div className="flex gap-6 w-full mx-auto ">
          <div className="flex-grow animate-slideInLeft hover:scale-[1.01] transition-transform duration-300 ">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <DonationForm onSubmit={handleDonationSubmit} />
            </div>
          </div>
          
          <div className="w-96 animate-slideInRight hover:scale-[1.02] transition-transform duration-300 bg-gradient-to-br from-indigo-50/90 to-white/90">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <DonationHistory donations={donations} categories={categories} />
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm animate-slideUp">
          <p>Thank you for your generosity in helping others.</p>
        </footer>
      </div>
    </div>
  );
}
