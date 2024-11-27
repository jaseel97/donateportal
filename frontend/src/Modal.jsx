import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { apiDomain } from "./Config";

const Modal = ({ 
    isOpen, 
    onClose, 
    selectedItem, 
    categories,
    onReserve 
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

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

    const handleReserve = async () => {
        if (!selectedItem || !selectedItem.id) return;
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${apiDomain}/item/${selectedItem.id}/reserve`, {}, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            });

            if (response.status === 200) {
                setIsSuccess(true);
                setTimeout(() => {
                    onReserve();
                    onClose();
                    setIsSuccess(false); // Reset success state
                }, 1500);
            }
        } catch (err) {
            setError(err.response ? err.response.data.message : err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !selectedItem) return null;

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-[9999] overflow-y-auto flex items-center justify-center">
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
                <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 sm:mx-auto transform transition-all">
                    <div className="p-6 text-center">
                        <h3 className="text-lg font-medium text-green-600 mb-2">
                            You have successfully reserved this item
                        </h3>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[9999] overflow-y-auto flex items-center justify-center">
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
                onClick={onClose}
            />
            <div 
                className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 sm:mx-auto transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="bg-white/95 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b-2 border-indigo-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-sky-800">
                                    Donation Details
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Review the details and reserve if interested
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-md text-gray-400 hover:text-gray-500 
                                         hover:bg-gray-100 focus:outline-none focus:ring-2 
                                         focus:ring-inset focus:ring-sky-500"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="px-6 py-4">
                        <div className="space-y-4">
                            <div>
                                <h4 className="categorylabel">Description</h4>
                                <p className="mt-1 text-sm text-gray-500">{selectedItem.description}</p>
                            </div>

                            <div>
                                <h4 className="categorylabel">Category</h4>
                                <p className="mt-1 text-sm text-gray-500">
                                    {categories[selectedItem.category] || "Unknown"}
                                </p>
                            </div>

                            {selectedItem.image_url && (
                                <div>
                                    <h4 className="categorylabel">Image</h4>
                                    <div className="mt-2 flex justify-center">
                                        <div className="w-1/2">
                                            <img 
                                                src={`http://localhost:8080${selectedItem.image_url}`}
                                                alt={selectedItem.description}
                                                className="w-full h-auto rounded-lg shadow-md"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="categorylabel">Details</h4>
                                <div className="mt-2 text-sm text-gray-500 space-y-1">
                                    <p>Posted By: {selectedItem.postedBy}</p>
                                    <p>Distance: {selectedItem.distanceKm} Km</p>
                                    <p>Pickup Window: {selectedItem.pickupStart} - {selectedItem.pickupEnd}</p>
                                    <p>Available Till: {selectedItem.availableTill}</p>
                                    <p>Weight: {selectedItem.weight} {selectedItem.weightUnit}</p>
                                    <p>Volume: {selectedItem.volume} {selectedItem.volumeUnit}</p>
                                    <p>Best Before: {selectedItem.bestBefore}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t-2 border-indigo-200">
                                <div className="flex justify-end space-x-3">
                                    {/* <button
                                        onClick={onClose}
                                        className="resetbutton"
                                    >
                                        Cancel
                                    </button> */}
                                    <button
                                        onClick={handleReserve}
                                        className="submitbutton"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Reserving...' : 'Reserve'}
                                    </button>
                                </div>
                                {error && (
                                    <p className="text-red-500 text-sm mt-2">{error}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;