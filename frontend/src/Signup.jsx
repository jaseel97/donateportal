import React, { useState, useEffect } from "react";
import { Loader } from '@googlemaps/js-api-loader';
import illustration from "./assets/login.jpg";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    username: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
    latitude: null,
    longitude: null
  });

  const [message, setMessage] = useState("");
  const [accountType, setAccountType] = useState("user");
  const [isFlipped, setIsFlipped] = useState(false);

  // Google Places Autocomplete states
  const [suggestions, setSuggestions] = useState([]);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [placesService, setPlacesService] = useState(null);

  // Load Google Maps API
  useEffect(() => {
    // console.log(process.env.REACT_APP_GOOGLE_MAPS_API_KEY)
    console.log(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
    const loader = new Loader({
      apiKey: AIzaSyAQb8A0cRrWKqVwEl8cACxfeykZtBxmp8A,
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

  // Handle address input changes
  const handleAddressChange = (e) => {
    const inputValue = e.target.value;
    setFormData(prevState => ({
      ...prevState,
      addressLine1: inputValue,
      city: '',
      province: '',
      latitude: null,
      longitude: null
    }));
    
    // Fetch suggestions
    fetchSuggestions(inputValue);
  };

  // Select a suggestion and get full details
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
            }
          });

          // Construct full address
          const fullAddress = `${extractedStreetNumber} ${extractedStreetName}`;

          // Set state values
          setFormData(prevState => ({
            ...prevState,
            addressLine1: fullAddress,
            city: extractedCity,
            province: extractedProvince,
            postalCode: extractedPostalCode,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng()
          }));
          
          // Debug 
          console.log("Latitude: ", place.geometry.location.lat());
          console.log("Longitude: ", place.geometry.location.lng());

          // Clear suggestions
          setSuggestions([]);
        }
      }
    );
  };

  // Handle general input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your form validation and submission logic here
    setMessage("Signup successful!");
  };

  return (
    <div className="flex min-h-screen w-screen bg-gradient-to-br from-blue-300 via-blue-500 to-blue-700">
      {/* Left Section with Illustration */}
      <div className="w-7/12 flex items-center justify-center bg-white">
        <img
          src={illustration}
          alt="Illustration"
          className="w-10/12 h-auto"
        />
      </div>

      {/* Right Section with Signup Form */}
      <div className="w-5/12 bg-white shadow-xl p-8">
        <h1 className="text-3xl font-extrabold text-blue-600 mb-6 text-center">
          Samaritan Connect
        </h1>
        <p className="text-center text-gray-600 mb-4">
          Please choose the account type
        </p>
        <div className="flex space-x-6 mb-6">
          <button
            onClick={() => setAccountType("user")}
            className={`w-32 py-3 rounded-lg ${accountType === "user" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"}`}
          >
            Samaritan
          </button>
          <button
            onClick={() => setAccountType("organization")}
            className={`w-32 py-3 rounded-lg ${accountType === "organization" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"}`}
          >
            Organization
          </button>
        </div>

        {/* Form for Organization */}
        {accountType === "organization" ? (
          <form onSubmit={handleSubmit} className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                  required
                />
              </div>
              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                  required
                />
              </div>
              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                  required
                />
              </div>
              {/* Address Line 1 */}
              <div className="relative">
                <label
                  htmlFor="addressLine1"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Address Line 1
                </label>
                <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleAddressChange}
                  placeholder="Enter address line 1"
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
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
              {/* Address Line 2 */}
              <div>
                <label
                  htmlFor="addressLine2"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Address Line 2
                </label>
                <input
                  type="text"
                  id="addressLine2"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Enter address line 2"
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                />
              </div>
              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-semibold text-gray-800"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                  required
                  readOnly
                />
              </div>
              {/* Province */}
              <div>
                <label
                  htmlFor="province"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Province
                </label>
                <input
                  type="text"
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  placeholder="Enter your province"
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                  required
                  readOnly
                />
              </div>
              {/* Postal Code */}
              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Enter your postal code"
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                  required
                  readOnly
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2 rounded-lg hover:opacity-90 transition duration-300 text-lg font-semibold shadow-md mt-4 w-full"
            >
              Sign Up
            </button>
            {/* Add "Already have an account?" Link */}
            <p className="text-center text-gray-600 mt-4">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-blue-600 hover:underline"
              >
                Login
              </a>
            </p>
          </form>
        ) : (
          // Form for User (similar structure, omitted for brevity)
          <form onSubmit={handleSubmit} className="w-full">
            {/* User form fields */}
            <div className="grid grid-cols-1 gap-4">
              {/* Similar to organization form, but without address fields */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                  required
                />
              </div>
              {/* Other user fields... */}
              {/* First Name */}
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-semibold text-gray-800"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                  required
                />
              </div>
              {/* Last Name */}
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                  required
                />
              </div>
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                  required
                />
              </div>
              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2 rounded-lg hover:opacity-90 transition duration-300 text-lg font-semibold shadow-md mt-4 w-full"
            >
              Sign Up
            </button>
            {/* Add "Already have an account?" Link */}
            <p className="text-center text-gray-600 mt-4">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-blue-600 hover:underline"
              >
                Login
              </a>
            </p>
          </form>
        )}
        
        {message && (
          <p className="text-center text-green-500 mt-4">{message}</p>
        )}
      </div>
    </div>
  );
};

export default Signup;
