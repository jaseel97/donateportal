import { useState, useEffect } from "react";
import axios from "axios";
import { apiDomain } from "./Config";
import OrganisationHistory from './OrganisationHistory';
import Modal from './Modal';
import Category from './Category';
import ProximityDropdown from './ProximityDropdown';
import { useLocation } from 'react-router-dom';
import UsernameAva from "./UsernameAva";
import { MapPinIcon } from "@heroicons/react/24/solid";

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
    const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
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

    const location = useLocation();
    const { username } = location.state || {}; 

    // console.log("User name from Organization Home Page:", username);

    const formatReadableDate = (isoDateString) => {
        if (!isoDateString) return ""; 
        return new Date(isoDateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${apiDomain}/categories`, {
                withCredentials: true
            });
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

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
                bestBefore: formatReadableDate(item?.best_before),
                image_url: item?.image_url
            }));

            setItems(mappedItems);
            setTotalPages(response.data.total_pages);
        } catch (error) {
            console.error("Error fetching items:", error);
        }
    };

    const handleDirectionsClick = (e, item) => {
        e.stopPropagation(); // Prevent the card's onClick from triggering
        // Extract coordinates from the POINT string
        const coordinatesMatch = item.pickupLocation.match(/POINT \((.*?) (.*?)\)/);
        if (coordinatesMatch) {
            const [_, longitude, latitude] = coordinatesMatch;
            window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const selectedCategory = filter === "" ? "" : filter;
        fetchItems(currentPage, itemsPerPage, proximityFilter, selectedCategory);
    }, [currentPage, itemsPerPage, proximityFilter, filter]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleCategoryChange = (e) => {
        setFilter(e.target.id || "");
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

    const handleReservationSuccess = () => {
        const selectedCategory = filter === "" ? "" : filter;
        fetchItems(currentPage, itemsPerPage, proximityFilter, selectedCategory);
        setHistoryRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-sky-50 to-indigo-50 animate-fadeIn">
            <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-center items-center mb-8 relative">
          <h1 className="text-3xl font-bold text-sky-900 animate-slideDown">
            Organization Home
          </h1>
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <UsernameAva username={username} />
          </div>
        </div>

                <div className="flex flex-col lg:flex-row gap-6 max-w-7xl w-full mx-auto min-h-[calc(100vh-12rem)]">
                    <div className="flex-grow animate-slideInLeft h-full">
                        <div className="bg-white/90 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 h-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                <div className="flex flex-col">
                                    <Category
                                        value={filter ? categories.options?.[filter] : ""}
                                        onChange={handleCategoryChange}
                                    />
                                </div>

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

                                <div className="flex flex-col">
                                    <ProximityDropdown
                                        value={proximityFilter}
                                        onChange={(e) => setProximityFilter(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {filteredItems.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => openModal(item)}
                                        className="relative border-2 border-indigo-200 rounded-lg p-4 bg-white/85 
                                                 hover:bg-gradient-to-r hover:from-white/90 hover:to-indigo-50/90 
                                                 hover:border-indigo-300 hover:scale-[1.01] hover:shadow-md 
                                                 transition-all duration-300 cursor-pointer"
                                    >
                                        <div className="absolute top-4 right-4">
                                            <button
                                                onClick={(e) => handleDirectionsClick(e, item)}
                                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                            >
                                                <MapPinIcon className="h-5 w-5 text-sky-600 hover:text-sky-800 transform hover:scale-110 transition-all duration-300 hover:drop-shadow-md cursor-pointer" />

                                            </button>
                                        </div>
                                        <h3 className="font-bold text-lg text-sky-800 mb-2">{item.description}</h3>
                                        <p className="text-sm text-gray-600">
                                            <strong>Category:</strong> {categories.options?.[item.category] || "Unknown"}
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

                    <div className="w-full lg:w-96 animate-slideInRight hover:scale-[1.02] transition-transform duration-300 h-full">
                        <OrganisationHistory
                            donations={receivedDonations}
                            categories={categories}
                            refreshTrigger={historyRefreshTrigger}
                            username={username}
                        />
                    </div>
                </div>

                {isModalOpen && selectedItem && (
                    <Modal
                        isOpen={isModalOpen}
                        onClose={closeModal}
                        selectedItem={selectedItem}
                        categories={categories.options}
                        onReserve={handleReservationSuccess}
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