import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from '@googlemaps/js-api-loader';
import illustration from './assets/login.jpg';
import { apiDomain } from './Config';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        userType: '',
        address: {
            city: '',
            province: '',
            address_line1: '',
            address_line2: '',
            postal_code: ''
        },
        name: '',  // For the organization name
        location: {
            latitude: '89',
            longitude: '90'
        }
    });
    const [message, setMessage] = useState('');
    //const [isFlipped, setIsFlipped] = useState(false);
    const [activeForm, setActiveForm] = useState('samaritan');
    const navigate = useNavigate();

    // Google Places Autocomplete states
    const [suggestions, setSuggestions] = useState([]);
    const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
    const [placesService, setPlacesService] = useState(null);

    // Load Google Maps API
    useEffect(() => {
        // console.log(process.env.REACT_APP_GOOGLE_MAPS_API_KEY)
        // const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        const mapsKey = 'AIzaSyAQb8A0cRrWKqVwEl8cACxfeykZtBxmp8A';    
        const loader = new Loader({
            apiKey: mapsKey,
            version: 'weekly',
            libraries: ['places']
        });

        loader.load().then(() => {
            // Create services once API is loaded
            const service = new window.google.maps.places.PlacesService(
                document.createElement('div')
            );
            setPlacesService(service);
            setIsGoogleMapsLoaded(true);
        }).catch((error) => {
            console.error('Google Maps API load error:', error);
        });
    }, []);

    // Fetch address suggestions
    const fetchSuggestions = (input) => {
        if (!isGoogleMapsLoaded || input.length < 3) {
            setSuggestions([]);
            return;
        }

        const autocompleteService = new window.google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions(
            {
                input,
                types: ['address'],
                componentRestrictions: { country: 'ca' }
            },
            (predictions, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    setSuggestions(predictions || []);
                } else {
                    setSuggestions([]);
                }
            }
        );
    };

    const handleAddressChange = (e) => {
        const inputValue = e.target.value;
    
        setFormData((prevState) => ({
            ...prevState,
            address: {
                ...prevState.address,
                address_line1: inputValue, // Update address_line1
                city: '',                  // Reset city
                province: '',              // Reset province
                postal_code: '',           // Reset postal code
            },
            location: {
                ...prevState.location,
                latitude: null,            // Reset latitude
                longitude: null,           // Reset longitude
            },
        }));
    
        // Fetch suggestions
        fetchSuggestions(inputValue);
    };

    const handleSuggestionSelect = (suggestion) => {
        if (!placesService) return;
    
        placesService.getDetails(
            { placeId: suggestion.place_id },
            (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    // Extract address components
                    let extractedCity = '';
                    let extractedProvince = '';
                    let extractedStreetNumber = '';
                    let extractedStreetName = '';
                    let extractedPostalCode = '';
    
                    place.address_components.forEach((component) => {
                        const componentType = component.types[0];
    
                        switch (componentType) {
                            case 'street_number':
                                extractedStreetNumber = component.long_name;
                                break;
                            case 'route':
                                extractedStreetName = component.long_name;
                                break;
                            case 'locality':
                                extractedCity = component.long_name;
                                break;
                            case 'administrative_area_level_1':
                                extractedProvince = component.short_name;
                                break;
                            case 'postal_code':
                                extractedPostalCode = component.long_name;
                                break;
                            default:
                                break;
                        }
                    });
    
                    // Construct full address
                    const fullAddress = `${extractedStreetNumber} ${extractedStreetName}`;
    
                    // Set state values
                    setFormData((prevState) => ({
                        ...prevState,
                        address: {
                            ...prevState.address,
                            address_line1: fullAddress,
                            city: extractedCity,
                            province: extractedProvince,
                            postal_code: extractedPostalCode,
                        },
                        location: {
                            ...prevState.location,
                            latitude: place.geometry.location.lat(),
                            longitude: place.geometry.location.lng(),
                        },
                    }));
    
                    // Clear suggestions
                    setSuggestions([]);
                }
            }
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
    
        // Handle nested fields dynamically
        if (name.includes('.')) {
            const keys = name.split('.');
            setFormData((prevState) => {
                const updatedData = { ...prevState };
                let pointer = updatedData;
    
                // Traverse the nested structure except for the last key
                for (let i = 0; i < keys.length - 1; i++) {
                    pointer = pointer[keys[i]];
                }
    
                // Update the last key
                pointer[keys[keys.length - 1]] = value;
    
                return updatedData;
            });
        } else {
            // Handle flat fields
            setFormData((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let endpoint = '';
            if (activeForm === 'samaritan') {
                endpoint = `${apiDomain}/auth/samaritan/signup`;
            } else if (activeForm === 'organization') {
                endpoint = `${apiDomain}/auth/organization/signup`;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Signup successful!');
                navigate("/login")
            } else {
                setMessage(data.error || 'Signup failed. Please try again.');
            }
        } catch (error) {
            console.error('Signup error:', error);
            setMessage('An error occurred. Please try again later.');
        }
    };

    // const parseJwt = (token) => {
    //     try {
    //         const base64Url = token.split('.')[1];
    //         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    //         const jsonPayload = decodeURIComponent(
    //             atob(base64)
    //                 .split('')
    //                 .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
    //                 .join('')
    //         );
    //         return JSON.parse(jsonPayload);
    //     } catch (error) {
    //         console.error('Failed to parse JWT:', error);
    //         return null;
    //     }
    // };

    // const handleFlip = () => {
    //     setIsFlipped((prevState) => !prevState);
    //     setActiveForm((prevState) => (prevState === 'samaritan' ? 'organization' : 'samaritan'));
    // };

    return (
        <div className="flex min-h-screen w-screen bg-gradient-to-br from-rose-50 via-sky-50 to-indigo-50">
            {/* Left Section with Illustration */}
            <div className="w-7/12 flex items-center justify-center bg-white">
                <img
                    src={illustration}
                    alt="Illustration"
                    className="w-10/12 h-auto"
                />
            </div>

            {/* Right Section with Signup Form Selector */}
            <div className="w-5/12 flex flex-col items-center bg-white shadow-xl p-6">
                {/* Title */}
                <h1 className="text-3xl font-extrabold text-blue-600 mb-6 text-center">
                    Samaritan Connect
                </h1>
                <p className="text-center text-gray-600 mb-4">
                    Create an account to get started
                </p>

                {/* Tab Navigation */}
                <div className="flex space-x-4 mb-6">
                    <button
                        className={`px-4 py-2 rounded-lg ${activeForm === 'samaritan' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                            }`}
                        onClick={() => setActiveForm('samaritan')}
                    >
                        Samaritan Signup
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg ${activeForm === 'organization' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                            }`}
                        onClick={() => setActiveForm('organization')}
                    >
                        Organization Signup
                    </button>
                </div>

                {/* Form Content */}
                {activeForm === 'samaritan' ? (
                    <div className="flex flex-col items-center w-full">
                        <form onSubmit={handleSubmit} className="flex flex-col space-y-6 w-full">
                            {/* Fields for Samaritan Signup */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-semibold text-gray-800">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="Enter your username"
                                    className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-800">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                    className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-800">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter your password"
                                    className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="address.city" className="block text-sm font-semibold text-gray-800">
                                    City
                                </label>
                                <input
                                    type="text"
                                    id="address.city"
                                    name="address.city"
                                    value={formData.address.city}
                                    onChange={handleInputChange}
                                    placeholder="Enter your city"
                                    className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="address.province" className="block text-sm font-semibold text-gray-800">
                                    Province
                                </label>
                                <input
                                    type="text"
                                    id="address.province"
                                    name="address.province"
                                    value={formData.address.province}
                                    onChange={handleInputChange}
                                    placeholder="Enter your province"
                                    className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-lg hover:opacity-90 transition duration-300 text-lg font-semibold shadow-md"
                            >
                                Sign Up
                            </button>
                        </form>
                        {message && (
                            <p
                                className={`mt-4 text-center ${message.includes('successful') ? 'text-green-600' : 'text-red-600'
                                    } font-semibold`}
                            >
                                {message}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full">
                        <form onSubmit={handleSubmit} className="w-full space-y-6">
                            {/* First Row: Email */}
                            <div className="flex flex-wrap gap-6">
                                <div className="w-full">
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-800">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter your email"
                                        className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Second Row: Username and Password */}
                            <div className="flex flex-wrap gap-6">
                                <div className="flex-1">
                                    <label htmlFor="username" className="block text-sm font-semibold text-gray-800">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="Enter your username"
                                        className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-800">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter your password"
                                        className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Third Row: Name and Address Line 1 */}
                            <div className="flex flex-wrap gap-6">
                                <div className="flex-1">
                                    <label htmlFor="name" className="block text-sm font-semibold text-gray-800">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your company name"
                                        className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="address_line1" className="block text-sm font-semibold text-gray-800">
                                        Address Line 1
                                    </label>
                                    <input
                                        type="text"
                                        id="address_line1"
                                        name="address.address_line1"
                                        value={formData.address.address_line1}
                                        onChange={handleAddressChange}
                                        placeholder="Enter the first line of your address"
                                        className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                                        required
                                    />
                                                    {suggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                      <li 
                        key={suggestion.place_id}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                      >
                        {suggestion.description}
                      </li>
                    ))}
                  </ul>
                )}
                                </div>
                            </div>

                            {/* Fourth Row: Address Line 2 and City */}
                            <div className="flex flex-wrap gap-6">
                                <div className="flex-1">
                                    <label htmlFor="address_line2" className="block text-sm font-semibold text-gray-800">
                                        Address Line 2
                                    </label>
                                    <input
                                        type="text"
                                        id="address_line2"
                                        name="address.address_line2"
                                        value={formData.address.address_line2}
                                        onChange={handleInputChange}
                                        placeholder="Enter the second line of your address (optional)"
                                        className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="city" className="block text-sm font-semibold text-gray-800">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="address.city"
                                        value={formData.address.city}
                                        onChange={handleInputChange}
                                        placeholder="Enter your city"
                                        className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Fifth Row: Province and Postal Code */}
                            <div className="flex flex-wrap gap-6">
                                <div className="flex-1">
                                    <label htmlFor="province" className="block text-sm font-semibold text-gray-800">
                                        Province
                                    </label>
                                    <input
                                        type="text"
                                        id="province"
                                        name="address.province"
                                        value={formData.address.province}
                                        onChange={handleInputChange}
                                        placeholder="Enter your province"
                                        className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="postal_code" className="block text-sm font-semibold text-gray-800">
                                        Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        id="postal_code"
                                        name="address.postal_code"
                                        value={formData.address.postal_code}
                                        onChange={handleInputChange}
                                        placeholder="Enter your postal code"
                                        className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                                        required
                                    />
                                </div>
                            </div>


                            {/* Submit button spans across two columns */}
                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Sign Up
                                </button>
                            </div>
                        </form>

                        {message && (
                            <p
                                className={`mt-4 text-center ${message.includes('successful') ? 'text-green-600' : 'text-red-600'
                                    } font-semibold`}
                            >
                                {message}
                            </p>
                        )}
                    </div>
                )}


            </div>
        </div>
    );
};

export default Signup;
