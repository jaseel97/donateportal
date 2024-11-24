import { useState } from "react";

const categoryMapping = {
    0: "Food",
    1: "Clothing",
    2: "Books",
    3: "Furniture",
    4: "Household Items",
    5: "Electronics",
    6: "Toys",
    7: "Medical Supplies",
    8: "Pet Supplies",
    9: "Others"
};

const items = [
    {
        id: 1,
        category: 4,
        description: "Street Cups",
        weight: "47.90",
        weightUnit: "lbs",
        volume: "5.15",
        volumeUnit: "ft³",
        reservedTill: "2024-12-12T18:24:41.575Z",
        pickupLocation: "SRID=4326;POINT (-82.55610893308248 42.320471851517986)",
        postedBy: 53,
        reservedBy: 45,
        pickupTime: "2024-11-23T16:45:21.563Z",
        isPickedUp: true,
    },
    {
        id: 2,
        category: 1,
        description: "Moccasin Pants",
        weight: "78.17",
        weightUnit: "kg",
        volume: "2.52",
        volumeUnit: "ft³",
        reservedTill: "2024-12-02T05:58:56.984Z",
        pickupLocation: "SRID=4326;POINT (-82.51681392753251 42.236303102428096)",
        postedBy: 47,
        reservedBy: 53,
        pickupTime: "2024-11-24T16:06:28.052Z",
        isPickedUp: true,
    },
    {
        id: 3,
        category: 7,
        description: "Close Supplies",
        weight: "82.32",
        weightUnit: "kg",
        volume: "11.96",
        volumeUnit: "ft³",
        reservedTill: "2024-12-03T01:10:57.508Z",
        pickupLocation: "SRID=4326;POINT (-82.65032101593296 42.342786064317814)",
        postedBy: 54,
        reservedBy: 53,
        pickupTime: "2024-12-07T06:37:31.212Z",
        isPickedUp: true,
    },
    {
        id: 4,
        category: 1,
        description: "LawnGreen Sweater",
        weight: "8.28",
        weightUnit: "lbs",
        volume: "40.87",
        volumeUnit: "ft³",
        reservedTill: "2024-12-11T03:22:55.384Z",
        pickupLocation: "SRID=4326;POINT (-82.85089528192285 42.14075002820068)",
        postedBy: 47,
        reservedBy: 54,
        pickupTime: "2024-11-27T15:15:01.651Z",
        isPickedUp: true,
    },
    // Additional data provided by user
    {
        id: 21,
        category: 8,
        description: "Modern Bed",
        weight: "25.58",
        weightUnit: "lbs",
        volume: "41.72",
        volumeUnit: "ft³",
        reservedTill: "2024-12-14T04:39:31.555Z",
        pickupLocation: "SRID=4326;POINT (-82.85137820357848 42.04181879672585)",
        postedBy: 46,
        reservedBy: 49,
        pickupTime: "2024-11-25T02:33:20.391Z",
        isPickedUp: true,
    },
    {
        id: 22,
        category: 7,
        description: "Establish First Aid Kit",
        weight: "80.77",
        weightUnit: "lbs",
        volume: "5.79",
        volumeUnit: "m³",
        reservedTill: "2024-12-20T17:22:27.168Z",
        pickupLocation: "SRID=4326;POINT (-82.60422333534984 41.93156221407673)",
        postedBy: 48,
        reservedBy: 54,
        pickupTime: null,
        isPickedUp: false,
    },
    {
        id: 23,
        category: 4,
        description: "Street Cups",
        weight: "47.90",
        weightUnit: "lbs",
        volume: "5.15",
        volumeUnit: "ft³",
        reservedTill: "2024-12-12T18:24:41.575Z",
        pickupLocation: "SRID=4326;POINT (-82.55610893308248 42.320471851517986)",
        postedBy: 53,
        reservedBy: 45,
        pickupTime: "2024-11-23T16:45:21.563Z",
        isPickedUp: true,
    },
    {
        id: 24,
        category: 1,
        description: "Moccasin Pants",
        weight: "78.17",
        weightUnit: "kg",
        volume: "2.52",
        volumeUnit: "ft³",
        reservedTill: "2024-12-02T05:58:56.984Z",
        pickupLocation: "SRID=4326;POINT (-82.51681392753251 42.236303102428096)",
        postedBy: 47,
        reservedBy: 53,
        pickupTime: "2024-11-24T16:06:28.052Z",
        isPickedUp: true,
    },
    {
        id: 25,
        category: 7,
        description: "Close Supplies",
        weight: "82.32",
        weightUnit: "kg",
        volume: "11.96",
        volumeUnit: "ft³",
        reservedTill: "2024-12-03T01:10:57.508Z",
        pickupLocation: "SRID=4326;POINT (-82.65032101593296 42.342786064317814)",
        postedBy: 54,
        reservedBy: 53,
        pickupTime: "2024-12-07T06:37:31.212Z",
        isPickedUp: true,
    },
    {
        id: 26,
        category: 1,
        description: "LawnGreen Sweater",
        weight: "8.28",
        weightUnit: "lbs",
        volume: "40.87",
        volumeUnit: "ft³",
        reservedTill: "2024-12-11T03:22:55.384Z",
        pickupLocation: "SRID=4326;POINT (-82.85089528192285 42.14075002820068)",
        postedBy: 47,
        reservedBy: 54,
        pickupTime: "2024-11-27T15:15:01.651Z",
        isPickedUp: true,
    },
    {
        id: 27,
        category: 3,
        description: "Aqua Table",
        weight: "81.88",
        weightUnit: "lbs",
        volume: "46.69",
        volumeUnit: "ft³",
        reservedTill: "2024-11-24T04:09:13.880Z",
        pickupLocation: "SRID=4326;POINT (-82.8882830007884 42.117285768496984)",
        postedBy: 54,
        reservedBy: 45,
        pickupTime: null,
        isPickedUp: false,
    },
    {
        id: 28,
        category: 0,
        description: "Bit Rice",
        weight: "3.09",
        weightUnit: "kg",
        volume: "39.14",
        volumeUnit: "ft³",
        reservedTill: "2024-12-16T06:02:49.879Z",
        pickupLocation: "SRID=4326;POINT (-82.86889648767513 42.39228868224104)",
        postedBy: 48,
        reservedBy: 51,
        pickupTime: "2024-12-07T02:48:50.035Z",
        isPickedUp: true,
    },
    {
        id: 29,
        category: 5,
        description: "Castro Ltd Tablet",
        weight: "87.95",
        weightUnit: "kg",
        volume: "45.50",
        volumeUnit: "ft³",
        reservedTill: "2024-12-13T17:48:15.632Z",
        pickupLocation: "SRID=4326;POINT (-82.50390828686227 42.31730048460234)",
        postedBy: 52,
        reservedBy: 48,
        pickupTime: "2024-11-25T08:50:18.359Z",
        isPickedUp: true,
    },
];

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

function OrganizationHome() {
    // Hardcoded location of the logged-in organization
    const organizationLocation = { lat: 42.3173, lon: -82.5039 };

    const [filter, setFilter] = useState("");
    const [search, setSearch] = useState("");
    const [pickupDate, setPickupDate] = useState("");
    const [proximityFilter, setProximityFilter] = useState("");
    const [selectedItem, setSelectedItem] = useState(null); // Tracks selected item
    const [isModalOpen, setModalOpen] = useState(false); // Tracks modal visibility

    const proximityOptions = [
        { label: "All", value: "" },
        { label: "5 km", value: 5 },
        { label: "10 km", value: 10 },
        { label: "20 km", value: 20 },
    ];

    const filteredItems = items.filter((item) => {
        const matchesCategory = filter ? item.category.toString() === filter : true;
        const matchesSearch = item.description.toLowerCase().includes(search.toLowerCase());
        const matchesDate = pickupDate
            ? new Date(item.pickupTime).toISOString().split("T")[0] === pickupDate
            : true;

        const [_, pickupLon, pickupLat] = item.pickupLocation.match(/POINT \((-?\d+.\d+) (-?\d+.\d+)\)/);
        const distance = calculateDistance(
            organizationLocation.lat,
            organizationLocation.lon,
            parseFloat(pickupLat),
            parseFloat(pickupLon)
        );

        const matchesProximity = proximityFilter ? distance <= proximityFilter : true;

        return matchesCategory && matchesSearch && matchesDate && matchesProximity;
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

    return (
        <div className="max-w-7xl w-full mx-auto p-4">
            <h1 className="text-2xl font-bold text-center mb-8">
                Organization - Choose Donation
            </h1>

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
                        {Object.keys(categoryMapping).map((categoryId) => (
                            <option key={categoryId} value={categoryId}>
                                {categoryMapping[categoryId]}
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
                        <h3 className="font-bold text-lg text-gray-800 mb-2">
                            {item.description}
                        </h3>
                        <p className="text-sm text-gray-600">
                            <strong>Category:</strong> {categoryMapping[item.category]}
                        </p>
                        <p className="text-sm text-gray-600">
                            <strong>Weight:</strong> {item.weight} {item.weightUnit}
                        </p>
                        <p className="text-sm text-gray-600">
                            <strong>Volume:</strong> {item.volume} {item.volumeUnit}
                        </p>
                        <p className="text-sm text-gray-600">
                            <strong>Pickup Time:</strong>{" "}
                            {new Date(item.pickupTime).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                            <strong>Reserved Till:</strong>{" "}
                            {new Date(item.reservedTill).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>

            {/* Modal Section */}
            {isModalOpen && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-4">{selectedItem.description}</h2>
                        <p>
                            <strong>Category:</strong> {categoryMapping[selectedItem.category]}
                        </p>
                        <p>
                            <strong>Weight:</strong> {selectedItem.weight} {selectedItem.weightUnit}
                        </p>
                        <p>
                            <strong>Volume:</strong> {selectedItem.volume} {selectedItem.volumeUnit}
                        </p>
                        <p>
                            <strong>Pickup Time:</strong>{" "}
                            {new Date(selectedItem.pickupTime).toLocaleString()}
                        </p>
                        <p>
                            <strong>Reserved Till:</strong>{" "}
                            {new Date(selectedItem.reservedTill).toLocaleString()}
                        </p>
                        <div className="flex justify-end mt-6">
                            <button
                                className="mr-2 px-4 py-2 bg-gray-300 rounded-lg"
                                onClick={closeModal}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                                onClick={handleReserve}
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
