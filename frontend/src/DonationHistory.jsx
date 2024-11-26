import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import ProgressBar from './ProgressBar';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
    'out-for-delivery': 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div onClick={e => e.stopPropagation()}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const DonationHistory = ({ donations, categories }) => {
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [clickedId, setClickedId] = React.useState(null);

  const openItemDetails = (item) => {
    setClickedId(item.id);
    setSelectedItem(item);
    // Delay modal opening for animation
    setTimeout(() => {
      setIsModalOpen(true);
    }, 300);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Add these styles for animations
  const styleTag = (
    <style>
      {`
        @keyframes cardClick {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }

        @keyframes cardGlow {
          0% { box-shadow: 0 0 0 rgba(59, 130, 246, 0); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          100% { box-shadow: 0 0 0 rgba(59, 130, 246, 0); }
        }

        @keyframes cardSlide {
          0% { transform: translateX(0); }
          50% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }

        .card-click-animation {
          animation: cardClick 0.3s ease-in-out;
        }

        .card-glow-animation {
          animation: cardGlow 0.5s ease-in-out;
        }

        .card-slide-animation {
          animation: cardSlide 0.3s ease-in-out;
        }

        .donation-card {
          transition: all 0.3s ease;
        }

        .donation-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .donation-card:active {
          transform: scale(0.98);
        }
      `}
    </style>
  );

  const getRandomAnimation = (id) => {
    if (id !== clickedId) return '';
    const animations = ['card-click-animation', 'card-glow-animation', 'card-slide-animation'];
    return animations[Math.floor(Math.random() * animations.length)];
  };

  return (
    <div className="w-1/3 bg-white p-6 rounded-lg shadow-sm">
      {styleTag}
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Order history</h2>
      <p className="text-sm text-center text-gray-500 mb-6">
        Check the status of recent donations
      </p>

      <div className="space-y-4">
        {donations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No donations yet</p>
        ) : (
          donations.map(item => (
            <div
              key={item.id}
              onClick={() => openItemDetails(item)}
              className={`
                donation-card
                group relative flex items-center space-x-3 
                bg-white border rounded-lg p-4 
                hover:shadow-lg cursor-pointer
                transition-all duration-300 ease-in-out
                hover:border-blue-200
                ${getRandomAnimation(item.id)}
              `}
            >
              {/* Item Image with hover zoom effect */}
              <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                {item.images[0] && (
                  <img
                    src={URL.createObjectURL(item.images[0])}
                    alt=""
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                  />
                )}
              </div>

              {/* Item Details with hover effects */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 capitalize group-hover:text-blue-600 transition-colors duration-300">
                  {categories.find(cat => cat.id === item.category)?.name}
                </h3>
                <p className="text-sm text-gray-500 truncate group-hover:text-gray-700 transition-colors duration-300">
                  {item.about}
                </p>
                <div className="mt-1">
                  <StatusBadge status={item.status || 'processing'} />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {formatDate(item.pickupDate)}
                </p>

                {/* Hover indicator */}
                <div className="absolute inset-0 border-2 border-blue-500 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Item Detail Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedItem && (
          <div>
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {categories.find(cat => cat.id === selectedItem.category)?.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">Order details and tracking</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              {/* Progress Tracking */}
              <div className="mb-6">
                <ProgressBar currentStep={selectedItem.status || 'processing'} />
              </div>

              {/* Order Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Description</h4>
                  <p className="mt-1 text-sm text-gray-500">{selectedItem.about}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900">Pickup Date</h4>
                  <p className="mt-1 text-sm text-gray-500">{formatDate(selectedItem.pickupDate)}</p>
                </div>

                {/* Images Grid */}
                {selectedItem.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Images</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedItem.images.map((image, index) => (
                        <img
                          key={index}
                          src={URL.createObjectURL(image)}
                          alt={`Item ${index + 1}`}
                          className="rounded-lg w-full h-48 object-cover"
                        />
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