import { useState, useEffect } from "react";
import axios from "axios";
import { apiDomain } from "./Config";
import OrganisationHistory from './OrganisationHistory';
import Modal from './Modal';
import { XMarkIcon } from '@heroicons/react/24/solid';

function OrganizationHome() {
    const [filter, setFilter] = useState("");
    const [search, setSearch] = useState("");
    const [pickupDate, setPickupDate] = useState("");
    const [proximityFilter, setProximityFilter] = useState("");
    const [categories, setCategories] = useState({});
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(12);
    const [receivedDonations] = useState([
        // Sample data - replace with actual API data
        {
            id: 1,
            category: 'clothes',
            description: 'Winter clothes donation',
            about: 'Collection of winter wear including jackets and sweaters',
            status: 'Picked Up',
            pickupDate: new Date(),
            images: []
        },
        {
            id: 2,
            category: 'food',
            description: 'Non-perishable food items',
            about: 'Canned goods and dry foods',
            status: 'Reserved',
            pickupDate: new Date(),
            images: []
        },
    ]);

    // Categories for OrganisationHistory
    const categoryList = [
        { id: 'clothes', name: 'Clothes' },
        { id: 'food', name: 'Food' },
        { id: 'toys', name: 'Toys' },
        { id: 'others', name: 'Others' }
    ];

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${apiDomain}/categories`, {
                    withCredentials: true
                });
                setCategories(response.data.options);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    const fetchItems = async (page = 1, perPage = 12, radius = "", category = "") => {
        try {
            const params = {
                page,
                items_per_page: perPage,
                ...(radius && { radius }),
                ...(category && { category }),
            };

            const response = await axios.get(`${apiDomain}/listings`, {
                params,
                withCredentials: true
            });
            const mappedItems = response.data.items.map(item => ({
                id: item.id,
                category: item.category?.id,
                description: item?.description,
                weight: item.weight?.value,
                weightUnit: item.weight?.unit,
                volume: item.volume?.value,
                volumeUnit: item.volume?.unit,
                pickupLocation: `SRID=4326;POINT (${item.pickup_location?.longitude} ${item.pickup_location?.latitude})`,
                postedBy: item.posted_by?.id,
                distanceKm: item?.distance_km,
                bestBefore: item?.best_before
            }));
            setItems(mappedItems);
            setTotalPages(response.data.total_pages);
        } catch (error) {
            console.error("Error fetching items:", error);
        }
    };

    useEffect(() => {
        const selectedCategory = filter === "" ? "" : filter;
        fetchItems(currentPage, itemsPerPage, proximityFilter, selectedCategory);
    }, [currentPage, itemsPerPage, proximityFilter, filter]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const proximityOptions = [
        { label: "All", value: "" },
        { label: "5 km", value: 5 },
        { label: "10 km", value: 10 },
        { label: "20 km", value: 20 },
        { label: "50 km", value: 50 },
    ];

    const filteredItems = items.filter((item) => {
        const matchesSearch = item.description.toLowerCase().includes(search.toLowerCase());
        const matchesDate = pickupDate
            ? new Date(item.bestBefore).toISOString().split("T")[0] === pickupDate
            : true;

        return matchesSearch && matchesDate;
    });

    const openModal = (item) => {
        setSelectedItem(item);
        setModalOpen(true);
    };

    const closeModal = () => {
        setSelectedItem(null);
        setModalOpen(false);
    };

    const handleReserve = async () => {
        try {
            // Replace with your actual API endpoint and request
            await axios.post(`${apiDomain}/reserve`, {
                itemId: selectedItem.id
            }, {
                withCredentials: true
            });

            // Update the received donations list
            const newDonation = {
                id: selectedItem.id,
                category: selectedItem.category,
                description: selectedItem.description,
                about: `Weight: ${selectedItem.weight} ${selectedItem.weightUnit}, Volume: ${selectedItem.volume} ${selectedItem.volumeUnit}`,
                status: 'Reserved',
                pickupDate: new Date(),
                images: []
            };

            setReceivedDonations(prev => [newDonation, ...prev]);
            closeModal();
            
            // Optional: Show success message
            alert('Item reserved successfully!');
        } catch (error) {
            console.error("Error reserving item:", error);
            alert("Failed to reserve item. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-sky-50 to-indigo-50 animate-fadeIn">
            <div className="max-w-7xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-sky-900 text-center mb-8 animate-slideDown">
                    Organization Portal
                </h1>

                <div className="flex flex-col lg:flex-row gap-6 max-w-7xl w-full mx-auto">
                    <div className="flex-grow animate-slideInLeft">
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                            {/* Filter Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                {/* Filter by Category */}
                                <div className="flex flex-col">
                                    <label htmlFor="filter" className="font-medium mb-2">
                                        Filter by Category:
                                    </label>
                                    <select
                                        id="filter"
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        className="p-2 border border-gray-300 rounded-md shadow-sm w-full"
                                    >
                                        <option value="">All</option>
                                        {Object.keys(categories).map((categoryId) => (
                                            <option key={categoryId} value={categoryId}>
                                                {categories[categoryId]}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Search by Description */}
                                <div className="flex flex-col">
                                    <label htmlFor="search" className="font-medium mb-2">
                                        Search by Description:
                                    </label>
                                    <input
                                        type="text"
                                        id="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search donations"
                                        className="p-2 border border-gray-300 rounded-md shadow-sm w-full"
                                    />
                                </div>

                                {/* Filter by Best Before */}
                                <div className="flex flex-col">
                                    <label htmlFor="pickupDate" className="font-medium mb-2">
                                        Filter by Best Before:
                                    </label>
                                    <input
                                        type="date"
                                        id="pickupDate"
                                        value={pickupDate}
                                        onChange={(e) => setPickupDate(e.target.value)}
                                        className="p-2 border border-gray-300 rounded-md shadow-sm w-full"
                                    />
                                </div>

                                {/* Filter by Proximity */}
                                <div className="flex flex-col">
                                    <label htmlFor="proximityFilter" className="font-medium mb-2">
                                        Filter by Proximity:
                                    </label>
                                    <select
                                        id="proximityFilter"
                                        value={proximityFilter}
                                        onChange={(e) => setProximityFilter(e.target.value)}
                                        className="p-2 border border-gray-300 rounded-md shadow-sm w-full"
                                    >
                                        {proximityOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Grid Section */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {filteredItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="border border-gray-300 rounded-lg p-4 bg-white shadow-lg transition transform hover:-translate-y-2 hover:shadow-xl cursor-pointer"
                                        onClick={() => openModal(item)}
                                    >
                                        <h3 className="font-bold text-lg text-gray-800 mb-2">{item.description}</h3>
                                        <p className="text-sm text-gray-600">
                                            <strong>Category:</strong> {categories[item.category] || "Unknown"}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Weight:</strong> {item.weight} {item.weightUnit}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Volume:</strong> {item.volume} {item.volumeUnit}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Distance:</strong> {item.distanceKm} Km
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="flex justify-between items-center mt-6">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                                        currentPage === 1 
                                        ? 'bg-gray-200 cursor-not-allowed' 
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                    }`}
                                >
                                    Previous
                                </button>
                                <span className="text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                                        currentPage === totalPages 
                                        ? 'bg-gray-200 cursor-not-allowed' 
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Received History Section */}
                    <div className="w-full lg:w-96 animate-slideInRight hover:scale-[1.02] transition-transform duration-300">
                        <OrganisationHistory 
                            donations={receivedDonations} 
                            categories={categoryList}
                        />
                    </div>
                </div>

            {/* Modal */}
            {isModalOpen && selectedItem && (
                    <Modal isOpen={isModalOpen} onClose={closeModal}>
                        <div className="bg-white rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Donation Details
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Review the details and reserve if interested
                                        </p>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="px-6 py-4">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Description</h4>
                                        <p className="mt-1 text-sm text-gray-500">{selectedItem.description}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Category</h4>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {categories[selectedItem.category] || "Unknown"}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Details</h4>
                                        <div className="mt-2 text-sm text-gray-500 space-y-1">
                                            <p>Weight: {selectedItem.weight} {selectedItem.weightUnit}</p>
                                            <p>Volume: {selectedItem.volume} {selectedItem.volumeUnit}</p>
                                            <p>Distance: {selectedItem.distanceKm} Km</p>
                                            <p>Best Before: {new Date(selectedItem.bestBefore).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={closeModal}
                                                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleReserve}
                                                className="px-4 py-2 rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Reserve
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}

                <footer className="mt-12 text-center text-gray-500 text-sm animate-slideUp">
                    <p>Together we can make a difference.</p>
                </footer>
            </div>
        </div>
            );
        }
        
        export default OrganizationHome;