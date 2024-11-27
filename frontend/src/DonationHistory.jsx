import React, { useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/solid';
import ProgressBar from './ProgressBar';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    'Donation Offered': 'bg-green-100 text-green-800',
    'Reserved': 'bg-red-100 text-red-800',
    'Picked Up': 'bg-blue-100 text-blue-800'
  };

  return (
    <span 
      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
        ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto"
      aria-modal="true" 
      role="dialog"
    >
      <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        ></div>

        <div
          className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
          onClick={e => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

const DonationCard = React.memo(({ item, onClick, formatDate }) => {
  return (
    <div
      onClick={onClick}
      className="group relative flex items-center space-x-3 bg-white border rounded-lg p-4 hover:shadow-lg cursor-pointer transition-all duration-300 ease-in-out hover:border-blue-200"
    >
      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
        {item.images?.length > 0 ? (
          <img
            src={URL.createObjectURL(item.images[0])}
            alt=""
            className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 pl-3">
        <h3 className="text-sm font-medium text-gray-900 capitalize group-hover:text-blue-600 transition-colors duration-300">
          {item.item?.category?.name || 'Uncategorized'}
        </h3>
        <p className="text-sm text-gray-500 truncate group-hover:text-gray-700 transition-colors duration-300">
          {item.item?.description || 'No description available'}
        </p>
        <div className="mt-1">
          <StatusBadge status={item.status || 'Processing'} />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {formatDate(new Date())}
        </p>
      </div>
    </div>
  );
});

const DonationHistory = ({ donations = [], categories = [] }) => {
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  useEffect(() => {
    return () => {
      // Cleanup URLs when component unmounts
      donations.forEach(donation => {
        if (donation.images) {
          donation.images.forEach(image => {
            URL.revokeObjectURL(URL.createObjectURL(image));
          });
        }
      });
    };
  }, [donations]);

  const formatDate = useCallback((date) => {
    if (!date) return 'Date not available';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const openItemDetails = useCallback((item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItem(null);
  }, []);

  return (
    <div className="w-full bg-white rounded-lg shadow-sm">
      <div className="p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Donation History
        </h2>
        <p className="text-sm text-center text-gray-500 mb-6">
          Check the status of recent donations
        </p>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {donations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No donations yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Your donation history will appear here
              </p>
            </div>
          ) : (
            donations.map(item => (
              <DonationCard
                key={item.id}
                item={item}
                onClick={() => openItemDetails(item)}
                formatDate={formatDate}
              />
            ))
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedItem && (
          <div className="p-6">
            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {categories.find(cat => cat.id === selectedItem.item?.category)?.name || 'Uncategorized'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Donation Details
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                aria-label="Close modal"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-6">
              <div className="mb-6">
                <ProgressBar currentStep={selectedItem.status || 'Processing'} />
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Description</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedItem.item?.description || 'No description available'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900">Pickup Date</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatDate(new Date())}
                  </p>
                </div>

                {selectedItem?.images?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Images</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedItem.images.map((image, index) => (
                        <div key={index} className="relative aspect-w-1 aspect-h-1">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Donation item ${index + 1}`}
                            className="rounded-lg w-full h-48 object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DonationHistory;