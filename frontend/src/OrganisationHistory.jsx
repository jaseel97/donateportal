import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiDomain } from './Config';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    Reserved: 'bg-red-100 text-red-800',
    'Picked Up': 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const OrganisationHistory = ({ categories = {}, refreshTrigger }) => {
  const [filters, setFilters] = useState({
    picked: false,
    reserved: true
  });

  const [donations, setDonations] = useState({
    reserved_items: { items: [], total_pages: 1, total_items: 0 },
    picked_up_items: { items: [], total_pages: 1, total_items: 0 }
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pickupStatus, setPickupStatus] = useState(null);

  useEffect(() => {
    if (pickupStatus) {
      const timer = setTimeout(() => {
        setPickupStatus(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [pickupStatus]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchDonations = async () => {
    try {
      const interactedItems = await axios.get(`${apiDomain}/organization/TangoDjango/items`, {
        headers: {
          "Content-Type": "application/json"
        },
        withCredentials: true,
        params: { page: currentPage, items_per_page: 4 },
      });

      setDonations({
        reserved_items: interactedItems.data.reserved_items,
        picked_up_items: interactedItems.data.picked_up_items
      });
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [currentPage, refreshTrigger]);

  const filteredDonations = [
    ...donations.reserved_items.items.filter(item => filters.reserved),
    ...donations.picked_up_items.items.filter(item => filters.picked)
  ];

  const handleFilterChange = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= donations.reserved_items.total_pages) {
      setCurrentPage(newPage);
    }
  };

  const handlePickup = async (itemId) => {
    try {
      await axios.post(`${apiDomain}/item/${itemId}/pickup`, {}, {
        headers: {
          "Content-Type": "application/json"
        },
        withCredentials: true,
      });
      setPickupStatus('Item successfully picked up!');
      fetchDonations();
    } catch (error) {
      setPickupStatus('Failed to mark item as picked up');
      console.error('Error marking item as picked up:', error);
    }
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

      {pickupStatus && (
        <div className="text-center p-3 mb-4 bg-green-100 border border-green-400 text-green-700 rounded-lg transition-all duration-300 shadow-sm">
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {pickupStatus}
          </span>
        </div>
      )}

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
                    {(categories?.options && item.category?.id) ? categories.options[item.category.id] : 'Unknown'}
                  </span>
                </div>

                {/* Status Line */}
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 w-24">Status:</span>
                  <StatusBadge status={item.is_picked_up ? 'Picked Up' : 'Reserved'} />
                </div>

                {/* Date Line */}
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 w-24">Date:</span>
                  <span className="text-sm text-gray-600">{formatDate(item.available_till)}</span>
                </div>

                {/* Best Before Line (if available) */}
                {item.best_before && (
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-24">Best Before:</span>
                    <span className="text-sm text-gray-600">{formatDate(item.best_before)}</span>
                  </div>
                )}

                {/* Pick Up Button */}
                {item.is_reserved && !item.is_picked_up && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => handlePickup(item.id)}
                      className="button-base bg-sky-500 hover:bg-sky-600"
                    >
                      Mark As Collected
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-l"
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="px-4 py-2 text-sm text-gray-700">
          Page {currentPage} of {donations.reserved_items.total_pages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-r"
          disabled={currentPage === donations.reserved_items.total_pages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OrganisationHistory;