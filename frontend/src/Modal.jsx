import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

const Modal = ({ 
    isOpen, 
    onClose, 
    selectedItem, 
    categories, 
    onReserve, 
    children 
}) => {
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

    if (!isOpen || !selectedItem) return null;

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

                            <div>
                                <h4 className="categorylabel">Details</h4>
                                <div className="mt-2 text-sm text-gray-500 space-y-1">
                                    <p>Weight: {selectedItem.weight} {selectedItem.weightUnit}</p>
                                    <p>Volume: {selectedItem.volume} {selectedItem.volumeUnit}</p>
                                    <p>Distance: {selectedItem.distanceKm} Km</p>
                                    <p>Best Before: {new Date(selectedItem.bestBefore).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t-2 border-indigo-200">
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={onClose}
                                        className="resetbutton"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={onReserve}
                                        className="submitbutton"
                                    >
                                        Reserve
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;