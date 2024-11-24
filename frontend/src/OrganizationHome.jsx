import { useState } from "react";
import "./OrganizationHome.css";

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

function OrganizationHome() {
    const [filter, setFilter] = useState("");
    const [search, setSearch] = useState("");
    const [pickupDate, setPickupDate] = useState("");

    const filteredItems = items.filter((item) => {
        const matchesCategory = filter ? item.category.toString() === filter : true;
        const matchesSearch = item.description.toLowerCase().includes(search.toLowerCase());

        const matchesDate = pickupDate
            ? new Date(item.pickupTime).toISOString().split("T")[0] === pickupDate
            : true;

        return matchesCategory && matchesSearch && matchesDate;
    });

    return (
        <div className="max-w-7xl w-full">
            <h1>Organization - Choose Donation</h1>
            <div className="filter-section">
                <div className="filter-by-category">
                    <label htmlFor="filter">Filter by Category:</label>
                    <select
                        id="filter"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="">All</option>
                        {Object.keys(categoryMapping).map((categoryId) => (
                            <option key={categoryId} value={categoryId}>
                                {categoryMapping[categoryId]}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="search-by-description">
                    <label htmlFor="search">Search by Description:</label>
                    <input
                        type="text"
                        id="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search donations"
                    />
                </div>

                <div className="filter-by-date">
                    <label htmlFor="pickupDate">Filter by Pickup Date:</label>
                    <input
                        type="date"
                        id="pickupDate"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="grid-container">
                {filteredItems.map((item) => (
                    <div key={item.id} className="card">
                        <h3>{item.description}</h3>
                        <p>
                            <strong>Category:</strong> {categoryMapping[item.category]}
                        </p>
                        <p>
                            <strong>Weight:</strong> {item.weight} {item.weightUnit}
                        </p>
                        <p>
                            <strong>Volume:</strong> {item.volume} {item.volumeUnit}
                        </p>
                        <p>
                            <strong>Pickup Time:</strong>{" "}
                            {new Date(item.pickupTime).toLocaleString()}
                        </p>
                        <p>
                            <strong>Reserved Till:</strong>{" "}
                            {new Date(item.reservedTill).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OrganizationHome;
