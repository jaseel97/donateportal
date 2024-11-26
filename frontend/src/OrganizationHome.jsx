import { useState, useEffect } from "react";
import axios from "axios";

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
    const [itemsPerPage, setItemsPerPage] = useState(12);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("http://localhost:8080/categories", {
                    headers: {
                        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlRhbmdvRGphbmdvIiwiZW1haWwiOiJ0YW5nb0BkamFuZ28uY2EiLCJpc19zdGFmZiI6ZmFsc2UsInVzZXJfdHlwZSI6Im9yZ2FuaXphdGlvbiIsImV4cCI6MTczNTA5Mjc4OX0.Us5JB1L6Zh3rhPSxTYUvCzYIk-G8JHcYCPSohuhI1VM"
                    }
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

            const response = await axios.get("http://localhost:8080/listings", {
                params,
                headers: {
                    Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlRhbmdvRGphbmdvIiwiZW1haWwiOiJ0YW5nb0BkamFuZ28uY2EiLCJpc19zdGFmZiI6ZmFsc2UsInVzZXJfdHlwZSI6Im9yZ2FuaXphdGlvbiIsImV4cCI6MTczNTA5Mjc4OX0.Us5JB1L6Zh3rhPSxTYUvCzYIk-G8JHcYCPSohuhI1VM"
                }
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

    const handleReserve = () => {
        alert(`Reserved item: ${selectedItem.description}`);
        closeModal();
    };

    const handleCancel = () => {
        closeModal();
    };

    return (
        <div className="max-w-7xl w-full mx-auto p-4">
            <h1 className="text-2xl font-bold text-center mb-8">Organization - Choose Donation</h1>

            {/* Filter Section */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 mb-6">
                {/* Filter by Category */}
                <div className="flex flex-col items-start w-full max-w-sm">
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
                <div className="flex flex-col items-start w-full max-w-sm">
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

                {/* Filter by Pickup Date */}
                <div className="flex flex-col items-start w-full max-w-sm">
                    <label htmlFor="pickupDate" className="font-medium mb-2">
                        Filter by Pickup Date:
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
                <div className="flex flex-col items-start w-full max-w-sm">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                    className="px-4 py-2 bg-gray-300 rounded-md"
                >
                    Previous
                </button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-300 rounded-md"
                >
                    Next
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold mb-4">{selectedItem.description}</h2>
                        <p>
                            <strong>Category:</strong> {categories[selectedItem.category] || "Unknown"}
                        </p>
                        <p>
                            <strong>Weight:</strong> {selectedItem.weight} {selectedItem.weightUnit}
                        </p>
                        <p>
                            <strong>Volume:</strong> {selectedItem.volume} {selectedItem.volumeUnit}
                        </p>
                        <p>
                            <strong>Distance:</strong> {selectedItem.distanceKm} Km
                        </p>
                        <p>
                            <strong>Best Before:</strong> {new Date(selectedItem.bestBefore).toLocaleDateString("en-GB")}
                        </p>
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 mr-2 bg-gray-300 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReserve}
                                className="px-4 py-2 bg-green-500 text-white rounded-md"
                            >
                                Reserve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrganizationHome;
