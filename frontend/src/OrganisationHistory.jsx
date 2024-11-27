import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiDomain } from './Config';
import { XMarkIcon } from '@heroicons/react/24/solid';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    'Reserved': 'bg-red-100 text-red-800',
    'Picked Up': 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
      ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const DonationCard = React.memo(({ item, categories, formatDate, onPickup, onUnreserve }) => {
  return (
    <div className="group relative flex items-center space-x-3 bg-white border rounded-lg p-4 hover:shadow-lg transition-all duration-300 ease-in-out hover:border-blue-200">
      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
        {item.image_url ? (
          <img
            src={`${apiDomain}${item.image_url}`}
            alt={item.description || 'Donation item'}
            className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/api/placeholder/80/80';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 pl-3">
        <h3 className="text-sm font-medium text-gray-900 capitalize group-hover:text-blue-600 transition-colors duration-300">
          {(categories?.options && item.category?.id) ? categories.options[item.category.id] : 'Others'}
        </h3>
        <p className="text-sm text-gray-500 truncate group-hover:text-gray-700 transition-colors duration-300">
          {item.description || 'No description available'}
        </p>
        <div className="mt-1">
          <StatusBadge status={item.is_picked_up ? 'Picked Up' : 'Reserved'} />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {formatDate(item.available_till)}
        </p>
        
        {item.is_reserved && !item.is_picked_up && (
          <div className="mt-2 flex space-x-2">
            <button
              onClick={() => onPickup(item.id)}
              className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              Mark As Collected
            </button>
            <button
              onClick={() => onUnreserve(item.id)}
              className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-300"
            >
              Unreserve
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

const OrganisationHistory = ({ categories = {}, refreshTrigger, username, onHistoryChange }) => {
  const [activeTab, setActiveTab] = useState('reserved');
  const [donations, setDonations] = useState({
    reserved_items: { items: [], total_pages: 1, total_items: 0 },
    picked_up_items: { items: [], total_pages: 1, total_items: 0 }
  });
  const [statusMessage, setStatusMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

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
    setIsLoading(true);
    try {
      if (!username) {
        console.error('Username is required to fetch donations');
        return;
      }
      
      const interactedItems = await axios.get(`${apiDomain}/organization/${username}/items`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
        params: { items_per_page: 1000 },
      });

      setDonations({
        reserved_items: interactedItems.data.reserved_items,
        picked_up_items: interactedItems.data.picked_up_items
      });
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [refreshTrigger, username]);

  const handlePickup = async (itemId) => {
    try {
      await axios.post(`${apiDomain}/item/${itemId}/pickup`, {}, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      setStatusMessage('Item successfully picked up!');
      fetchDonations();
    } catch (error) {
      setStatusMessage('Failed to mark item as picked up');
      console.error('Error marking item as picked up:', error);
    }
  };

  const handleUnreserve = async (itemId) => {
    try {
        await axios.post(`${apiDomain}/item/${itemId}/unreserve`, {}, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        });
        setStatusMessage('Reservation successfully cancelled!');
        fetchDonations();
        onHistoryChange(); // Add this line
    } catch (error) {
        setStatusMessage('Failed to cancel reservation');
        console.error('Error cancelling reservation:', error);
    }
};

  const filteredDonations = activeTab === 'reserved' 
    ? donations.reserved_items.items 
    : donations.picked_up_items.items;

  return (
    <div className="bg-white/90 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">History</h2>
        <p className="text-sm text-center text-gray-500 mb-4">Track your received donations</p>
        
        <div className="flex justify-center space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 
              ${activeTab === 'reserved' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('reserved')}
          >
            Reserved
          </button>
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 
              ${activeTab === 'picked' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('picked')}
          >
            Picked Up
          </button>
        </div>

        {statusMessage && (
          <div className="text-center p-3 bg-green-100 text-green-700 rounded-lg mb-4 transition-all duration-300">
            {statusMessage}
          </div>
        )}
      </div>

      <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading donations...</p>
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No donations found</p>
            <p className="text-sm text-gray-400 mt-2">
              {activeTab === 'reserved' 
                ? 'Reserved donations will appear here' 
                : 'Picked up donations will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDonations.map(item => (
              <DonationCard
                key={item.id}
                item={item}
                categories={categories}
                formatDate={formatDate}
                onPickup={handlePickup}
                onUnreserve={handleUnreserve}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganisationHistory;