import React, { useState, useEffect } from 'react';
import axios from "axios";
import { apiDomain } from "./Config";
import Category from './Category';
import DatePicker from './DatePicker';
import Calendar from './Calendar';
import { Loader } from "@googlemaps/js-api-loader";

const DonationForm = ({ onSubmit, onDonationSuccess }) => {
  const [formData, setFormData] = useState({
    category: '',
    categoryID: '',
    about: '',
    image: null,
    weight: '',
    volume: '',
    bestBefore: '',
    pickupWindowStart: '09:00',
    pickupWindowEnd: '17:00',
    availableTill: '',
    pickupLocation: '',
    coordinates: {
      latitude: null,
      longitude: null
    }
  });
  
  const [imagePreview, setImagePreview] = useState(null);

  // Google Places Autocomplete states
  const [suggestions, setSuggestions] = useState([]);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [placesService, setPlacesService] = useState(null);

  // Load Google Maps API
  useEffect(() => {
    const mapsKey = 'AIzaSyAQb8A0cRrWKqVwEl8cACxfeykZtBxmp8A';
    const loader = new Loader({
      apiKey: mapsKey,
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
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

  const handleLocationChange = (e) => {
    const inputValue = e.target.value;
    setFormData(prev => ({
      ...prev,
      pickupLocation: inputValue,
      coordinates: {
        latitude: null,
        longitude: null
      }
    }));
    fetchSuggestions(inputValue);
  };

  const handleSuggestionSelect = (suggestion) => {
    if (!placesService) return;

    placesService.getDetails(
      { placeId: suggestion.place_id },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setFormData(prev => ({
            ...prev,
            pickupLocation: suggestion.description,
            coordinates: {
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng()
            }
          }));
          setSuggestions([]);
        }
      }
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (e) => {
    const { value, id } = e.target;
    setFormData(prev => ({
      ...prev,
      categoryID: id,
      category: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const convertToISO = (input) => {
    const [datePart, startTime] = input.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    const isoDate = date.toISOString();
    const [dateStr, timeStr] = isoDate.split('T');
    const [time,] = timeStr.split('.');
    return `${dateStr}T${time}+00:00`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = ['categoryID', 'about', 'availableTill', 'pickupLocation'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    const submitFormData = new FormData();
    
    if (formData.image) {
      submitFormData.append('image', formData.image);
    }

    if (!formData.coordinates.latitude || !formData.coordinates.longitude) {
      alert('Please select a valid address from the suggestions');
      return;
    }

    const postData = {
      category: parseInt(formData.categoryID, 10),
      description: formData.about,
      pickup_location: {
        latitude: formData.coordinates.latitude,
        longitude: formData.coordinates.longitude
      },
      weight: formData.weight || null,
      weight_unit: "kg",
      volume: formData.volume || null,
      volume_unit: "m³",
      best_before: formData.bestBefore ? new Date(formData.bestBefore).toISOString().split('T')[0] : null,
      pickup_window_start: formData.pickupWindowStart,
      pickup_window_end: formData.pickupWindowEnd,
      available_till: convertToISO(formData.availableTill)
    };

    submitFormData.append('data', JSON.stringify(jsonData));

    try {
      const response = await axios.post(`${apiDomain}/samaritan/donate`, submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });
      
      console.log("Donation saved successfully:", response.data);
      onSubmit(response.data);
      onDonationSuccess(); // Call the success callback to refresh history
      handleReset();
    } catch (error) {
      console.error("Error saving donation:", error);
      alert(error.response?.data?.error || "Error saving donation");
    }
  };

  const handleReset = () => {
    setFormData({
      categoryID: '',
      category: '',
      about: '',
      image: null,
      weight: '',
      volume: '',
      bestBefore: '',
      pickupWindowStart: '09:00',
      pickupWindowEnd: '17:00',
      availableTill: '',
      pickupLocation: '',
      coordinates: {
        latitude: null,
        longitude: null
      }
    });
    
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="flex-1 w-full bg-white/90 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Add New Donation</h2>

          <div className="flex gap-2 w-full mx-auto">
            <Category
              id={formData.categoryID}
              value={formData.category}
              onChange={handleCategoryChange}
              required
            />
            <div className="mb-6">
              <label htmlFor="availableTill" className="categorylabel">
                Available Till*
              </label>
              <DatePicker
                name="availableTill"
                value={formData.availableTill}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="donation-description" className="categorylabel">
              Item Description*
            </label>
            <textarea
              id="donation-description"
              name="about"
              rows={3}
              value={formData.about}
              onChange={handleInputChange}
              className="textareastyle resize-none"
              placeholder="Describe your donation item..."
              required
            />
          </div>

          <div className="flex gap-6 mb-6">
            <div className="flex-1">
              <label htmlFor="weight" className="categorylabel">
                Weight (kg)
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="textareastyle"
                placeholder="Enter weight"
                min="0"
                step="0.1"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="volume" className="categorylabel">
                Volume (m³)
              </label>
              <input
                type="number"
                id="volume"
                name="volume"
                value={formData.volume}
                onChange={handleInputChange}
                className="textareastyle"
                placeholder="Enter volume"
                min="0"
                step="1.0"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="bestBefore" className="categorylabel">
                Best Before
              </label>
              <Calendar
                name="bestBefore"
                value={formData.bestBefore}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="mb-6 relative">
            <label htmlFor="pickup-location" className="categorylabel">
              Pickup Location*
            </label>
            <input
              type="text"
              id="pickup-location"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleLocationChange}
              className="textareastyle"
              placeholder="Enter pickup location"
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

          <div className="mb-6">
            <label className="categorylabel">
              Upload Image
            </label>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-xs h-auto rounded-lg shadow-sm"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <button
            type="button"
            onClick={handleReset}
            className="resetbutton"
          >
            Clear Form
          </button>
          <button
            type="submit"
            className="submitbutton"
          >
            Confirm Donation
          </button>
        </div>
      </form>
    </div>
  );
};

export default DonationForm;