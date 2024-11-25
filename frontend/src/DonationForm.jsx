import React from 'react';
import { PhotoIcon } from '@heroicons/react/24/solid';

const DonationForm = ({ onSubmit }) => {
  const [formData, setFormData] = React.useState({
    category: '',
    about: '',
    images: [],
    pickupDate: ''
  });

  const categories = [
    { id: 'clothes', name: 'Clothes' },
    { id: 'food', name: 'Food' },
    { id: 'toys', name: 'Toys' },
    { id: 'others', name: 'Others' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: files
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      category: '',
      about: '',
      images: [],
      pickupDate: ''
    });
  };

  return (
    <div className="flex-1 w-1/2 bg-white p-6 rounded-lg shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="space-y-12">
          <div className="border-b border-gray-200 pb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Donation Details</h2>
            
            {/* Category Dropdown */}
            <div className="mb-6">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 
                         bg-white text-gray-900 
                         focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 
                         sm:text-sm"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* About Text Area */}
            <div className="mb-6">
              <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-2">
                About Item
              </label>
              <textarea
                id="about"
                name="about"
                rows={3}
                value={formData.about}
                onChange={handleInputChange}
                className="block w-full rounded-md border border-gray-300 py-2 px-3
                         bg-white text-gray-900 
                         focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                         placeholder:text-gray-400 
                         sm:text-sm"
                placeholder="Describe your donation item..."
                required
              />
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Item Images
              </label>
              <div className="flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-8 bg-gray-50">
                <div className="text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                  <div className="mt-4 flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-semibold text-blue-600 
                               focus-within:outline-none focus-within:ring-2 
                               focus-within:ring-blue-500 focus-within:ring-offset-2 
                               hover:text-blue-500"
                    >
                      <span>Upload photos</span>
                      <input
                        id="file-upload"
                        name="images"
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={handleImageChange}
                        accept="image/*"
                        required
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  {formData.images.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600">
                      {formData.images.length} files selected
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Date Picker */}
            <div className="mb-6">
              <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Pickup Date
              </label>
              <input
                type="datetime-local"
                id="pickupDate"
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleInputChange}
                className="block w-full rounded-md border border-gray-300 py-2 px-3
                         bg-white text-gray-900 
                         focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                         hover:border-gray-400 transition-colors duration-200 
                         sm:text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <button
            type="button"
            onClick={handleReset}
            className="px-8 py-3 rounded-2xl text-white bg-red-600 hover:bg-red-700 
                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-8 py-3 rounded-2xl text-white bg-green-600 hover:bg-green-700
                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Submit Donation
          </button>
        </div>
      </form>
    </div>
  );
};

export default DonationForm;