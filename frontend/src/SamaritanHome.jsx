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
    <div className="flex gap-6 max-w-7xl w-full mx-auto p-4">
      <DonationForm onSubmit={handleDonationSubmit} />
      <DonationHistory donations={donations} categories={categories} />
    </div>
  );
}
