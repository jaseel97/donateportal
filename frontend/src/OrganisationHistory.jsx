import React, { useState } from 'react';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    'Reserved': 'bg-red-100 text-red-800',
    'Picked Up': 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const OrganisationHistory = ({ donations, categories, onPickup }) => {
  const [filters, setFilters] = useState({
    picked: false,
    reserved: true
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredDonations = donations.filter(donation => {
    if (filters.picked && filters.reserved) {
      return donation.status === 'Reserved' || donation.status === 'Picked Up';
    } else if (filters.picked) {
      return donation.status === 'Picked Up';
    } else if (filters.reserved) {
      return donation.status === 'Reserved';
    }
    return true;
  });

  const handleFilterChange = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">History</h2>
      <p className="text-sm text-center text-gray-500 mb-4">
        Track your received donations
      </p>

      {/* Filter Checkboxes */}
      <div className="flex justify-center space-x-6 mb-6">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.reserved}
            onChange={() => handleFilterChange('reserved')}
            className="form-checkbox h-4 w-4 text-sky-500 rounded border-2 border-indigo-200 
                       focus:ring-sky-500 focus:ring-2 focus:ring-offset-2 
                       transition-colors duration-200"
          />
          <span className="text-sm text-gray-600">Reserved</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.picked}
            onChange={() => handleFilterChange('picked')}
            className="form-checkbox h-4 w-4 text-sky-500 rounded border-2 border-indigo-200 
                       focus:ring-sky-500 focus:ring-2 focus:ring-offset-2 
                       transition-colors duration-200"
          />
          <span className="text-sm text-gray-600">Picked Up</span>
        </label>
      </div>

      <div className="space-y-6">
        {filteredDonations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No donations received yet</p>
        ) : (
          filteredDonations.map(item => (
            <div
              key={item.id}
              className="bg-white border-2 border-indigo-200 rounded-lg p-6 
                         hover:border-indigo-300 hover:bg-gradient-to-r hover:from-white/90 
                         hover:to-indigo-50/90 hover:scale-[1.01] hover:shadow-md 
                         transition-all duration-300 relative"
            >
              <div className="space-y-3">
                {/* Description Line */}
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 w-24">Item:</span>
                  <span className="text-sm text-gray-600">{item.description || 'No description available'}</span>
                </div>

                {/* Category Line */}
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 w-24">Category:</span>
                  <span className="text-sm text-gray-600">
                    {categories.find(cat => cat.id === item.category)?.name || 'Unknown'}
                  </span>
                </div>

                {/* Status Line */}
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 w-24">Status:</span>
                  <StatusBadge status={item.status || 'processing'} />
                </div>

                {/* Date Line */}
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 w-24">Date:</span>
                  <span className="text-sm text-gray-600">{formatDate(item.pickupDate)}</span>
                </div>

                {/* Best Before Line (if available) */}
                {item.bestBefore && (
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-24">Best Before:</span>
                    <span className="text-sm text-gray-600">{formatDate(item.bestBefore)}</span>
                  </div>
                )}

                {/* Images Section (if available) */}
                {item.images && item.images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Images</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {item.images.map((image, index) => (
                        <img
                          key={index}
                          src={URL.createObjectURL(image)}
                          alt={`Item ${index + 1}`}
                          className="rounded-lg w-full h-24 object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Pick Up Button */}
                {item.status === 'Reserved' && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => onPickup?.(item.id)}
                      className="button-base bg-sky-500 hover:bg-sky-600"
                    >
                      Collected
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrganisationHistory;