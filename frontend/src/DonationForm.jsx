import React, { useState, useEffect } from 'react';
import axios from "axios";
import { apiDomain } from "./Config";
import { PhotoIcon } from '@heroicons/react/24/solid';
import Category from './Category';
import DatePicker from './DatePicker';
import UploadImage from './UploadImage';

const DonationForm = ({ onSubmit }) => {
  const [categories, setCategories] = useState({});
  const [formData, setFormData] = useState({
    category: '',
    categoryID: '',
    about: '',
    images: [],
    pickupDate: '',
    weight: '',
    volume: '',
    bestBefore: '',
    latitude: '',
    longitude: '' 
  });

  useEffect(() => {
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

    fetchCategories();
  }, []);

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
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const postData = {
      category: parseInt(formData.categoryID, 10),
      description: formData.about,
      pickup_location: {
        latitude: 43.880, 
        longitude: -79.605 
      },
      weight: formData.weight,
      weight_unit: "g",
      volume: formData.volume,
      volume_unit: "m³",
      best_before: new Date(formData.bestBefore).toISOString().split('T')[0]
    };

    try {
      const response = await axios.post("http://localhost:8080/samaritan/donate", postData, {
        headers: {
          "Content-Type": "application/json"
        },
        withCredentials: true
      });
      console.log("Donation saved successfully:", response.data);
      onSubmit(response.data);
      handleReset();
    } catch (error) {
      console.error("Error saving donation:", error);
    }
  };

  const handleReset = () => {
    setFormData({
      categoryID: '',
      category: '',
      about: '',
      images: [],
      pickupDate: '',
      weight: '',
      volume: '',
      bestBefore: ''
    });
  };

  return (
    <div className="flex-1 w-full bg-white p-6 rounded-lg shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="space-y-12">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Add New Donation</h2>
            <div className="flex gap-6 w-full mx-auto">
              <Category
                id={formData.categoryID}
                value={formData.category}
                onChange={handleCategoryChange}
                categories={categories}
              />
              <div className="mb-6">
                <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Pickup Date
                </label>
                <DatePicker
                  name="pickupDate"
                  value={formData.pickupDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="mb-6">
              <label htmlFor="donation-description" className="block text-sm font-medium text-gray-700 mb-2">
                Item Description
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

            {/* Weight and Volume inputs in one line */}
            <div className="flex gap-6 mb-6">
              <div className="flex-1">
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (g)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter weight"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-2">
                  Volume (m³)
                </label>
                <input
                  type="number"
                  id="volume"
                  name="volume"
                  value={formData.volume}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter volume"
                  min="0"
                  step="1.0"
                />
              </div>
            </div>

            {/* Best Before Date */}
            <div className="mb-6">
              <label htmlFor="bestBefore" className="block text-sm font-medium text-gray-700 mb-2">
                Best Before
              </label>
              <DatePicker
                name="bestBefore"
                value={formData.bestBefore}
                onChange={handleInputChange}
              />
            </div>

            <UploadImage
              images={formData.images}
              onChange={handleImageChange}
            />
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
