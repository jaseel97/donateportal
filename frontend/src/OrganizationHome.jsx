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
    const [itemsPerPage] = useState(9);
    const [receivedDonations, setReceivedDonations] = useState([
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

    const categoryList = [
        { id: 'clothes', name: 'Clothes' },
        { id: 'food', name: 'Food' },
        { id: 'toys', name: 'Toys' },
        { id: 'others', name: 'Others' }
    ];

    const proximityOptions = [
        { label: "All", value: "" },
        { label: "5 km", value: 5 },
        { label: "10 km", value: 10 },
        { label: "20 km", value: 20 },
        { label: "50 km", value: 50 },
    ];

    const formatReadableDate = (isoDateString) => {
        if (!isoDateString) return ""; // Handle null or undefined
        return new Date(isoDateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

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

    const fetchItems = async (page = 1, perPage = 9, radius = "", category = "") => {
        try {
            const params = {
                page,
                items_per_page: perPage,
                ...(radius && { radius }),
                ...(category && { category }),
            };

            const response = await axios.get(`${apiDomain}/organization/browse`, {
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
                postedBy: item.posted_by?.username,
                pickupStart: item?.pickup_window_start,
                pickupEnd: item?.pickup_window_end,
                availableTill: formatReadableDate(item?.available_till),
                distanceKm: item?.distance_km,
                bestBefore:formatReadableDate(item?.best_before)
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-sky-50 to-indigo-50 animate-fadeIn">
            <div className="max-w-7xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-sky-900 text-center mb-8 animate-slideDown">
                    Organization Portal
                </h1>

                <div className="flex flex-col lg:flex-row gap-6 max-w-7xl w-full mx-auto">
                    <div className="flex-grow animate-slideInLeft">
                        <div className="bg-white/90 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                            {/* Filter Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                {/* Category Filter */}
                                <div className="flex flex-col">
                                    <label className="categorylabel">
                                        Filter by Category:
                                    </label>
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        className="categorystyle"
                                    >
                                        <option value="">All</option>
                                        {Object.keys(categories).map((categoryId) => (
                                            <option key={categoryId} value={categoryId}>
                                                {categories[categoryId]}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Search Input */}
                                <div className="flex flex-col">
                                    <label className="categorylabel">
                                        Search by Description:
                                    </label>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search donations"
                                        className="textareastyle"
                                    />
                                </div>

                                {/* Proximity Filter */}
                                <div className="flex flex-col">
                                    <label className="categorylabel">
                                        Filter by Proximity:
                                    </label>
                                    <select
                                        value={proximityFilter}
                                        onChange={(e) => setProximityFilter(e.target.value)}
                                        className="categorystyle"
                                    >
                                        {proximityOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Items Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {filteredItems.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => openModal(item)}
                                        className="border-2 border-indigo-200 rounded-lg p-4 bg-white/85 
                                                 hover:bg-gradient-to-r hover:from-white/90 hover:to-indigo-50/90 
                                                 hover:border-indigo-300 hover:scale-[1.01] hover:shadow-md 
                                                 transition-all duration-300 cursor-pointer"
                                    >
                                        <h3 className="font-bold text-lg text-sky-800 mb-2">{item.description}</h3>
                                        <p className="text-sm text-gray-600">
                                            <strong>Category:</strong> {categories[item.category] || "Unknown"}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Distance:</strong> {item.distanceKm} Km
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Pickup Window:</strong> {item.pickupStart} - {item.pickupEnd}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Available Till:</strong> {item.availableTill}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="flex justify-between items-center mt-6">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`button-base ${currentPage === 1
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-sky-500 hover:bg-sky-600'}`}
                                >
                                    Previous
                                </button>
                                <span className="text-sky-800 font-medium">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`button-base ${currentPage === totalPages
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-sky-500 hover:bg-sky-600'}`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* History Section */}
                    <div className="w-full lg:w-96 animate-slideInRight hover:scale-[1.02] transition-transform duration-300">
                        <OrganisationHistory
                            donations={receivedDonations}
                            categories={categoryList}
                        />
                    </div>
                </div>

                {/* Modal */}
                {isModalOpen && selectedItem && (
                    <Modal
                        isOpen={isModalOpen}
                        onClose={closeModal}
                        selectedItem={selectedItem}
                        categories={categories}
                    />
                )}
                <footer className="mt-12 text-center text-sky-600 text-sm animate-slideUp">
                    <p>Together we can make a difference.</p>
                </footer>
            </div>
        </div>
    );
}

export default OrganizationHome;