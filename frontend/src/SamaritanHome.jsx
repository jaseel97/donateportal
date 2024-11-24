import React, { useState } from 'react';
import { PhotoIcon } from '@heroicons/react/24/solid';

export default function SamaritanHome() {
  const [formData, setFormData] = useState({
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
    console.log('Form Data:', formData);
  };

  const handleReset = () => {
    setFormData({
      category: '',
      about: '',
      images: [],
      pickupDate: ''
    });
  };

  const endButtons = `
    px-8 py-3 rounded-2xl 
    relative overflow-hidden
    bg-gradient-to-r from-gray-800 to-gray-900
    font-medium
    border-2
    before:absolute before:inset-0
    before:bg-gradient-to-r
    before:translate-x-[-200%]
    hover:before:translate-x-[200%]
    before:transition-transform before:duration-1000
    transition-all duration-300 ease-in-out
  `;

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl w-full mx-auto p-4 bg-gray-900 text-gray-100">
      <div className="space-y-12">
        <div className="border-b border-gray-700 pb-12">
          <h2 className="text-base font-semibold text-gray-100">Donation Details</h2>
          
          {/* Category Dropdown */}
          <div className="mt-10">
            <label htmlFor="category" className="block text-sm font-medium text-gray-200">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 
                       bg-gray-800 text-gray-200 
                       ring-1 ring-inset ring-gray-700 
                       focus:ring-2 focus:ring-indigo-500 
                       sm:text-sm"
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
          <div className="mt-10">
            <label htmlFor="about" className="block text-sm font-medium text-gray-200">
              About Item
            </label>
            <div className="mt-2">
              <textarea
                id="about"
                name="about"
                rows={3}
                value={formData.about}
                onChange={handleInputChange}
                className="block w-full rounded-md border-0 py-1.5 
                         bg-gray-800 text-gray-200 
                         shadow-sm ring-1 ring-inset ring-gray-700 
                         placeholder:text-gray-500 
                         focus:ring-2 focus:ring-inset focus:ring-indigo-500 
                         sm:text-sm"
                placeholder="Describe your donation item..."
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="mt-10">
            <label htmlFor="images" className="block text-sm font-medium text-gray-200">
              Upload Item Images
            </label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-700 px-6 py-10 bg-gray-800">
              <div className="text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-600" aria-hidden="true" />
                <div className="mt-4 flex text-sm text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-indigo-400 
                             focus-within:outline-none focus-within:ring-2 
                             focus-within:ring-indigo-500 focus-within:ring-offset-2 
                             hover:text-indigo-300"
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
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                {formData.images.length > 0 && (
                  <div className="mt-4 text-sm text-gray-400">
                    {formData.images.length} files selected
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Date Picker */}
          <div className="mt-10">
            <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-200">
              Preferred Pickup Date
            </label>
            <div className="mt-2">
              <input
                type="datetime-local"
                id="pickupDate"
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleInputChange}
                className="block w-full rounded-md border-0 py-1.5 
                         bg-gray-800 text-gray-200 
                         ring-1 ring-inset ring-gray-700 
                         focus:ring-2 focus:ring-indigo-500 
                         hover:bg-gray-750 transition-colors duration-200 
                         sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <div className="mt-6 flex gap-4">
          {/* Submit Button */}
          <button
            type="submit"
            className={`${endButtons}
              text-green-400
              border-green-500/30
              shadow-[4px_4px_10px_0_rgba(0,0,0,0.3),-4px_-4px_10px_0_rgba(255,255,255,0.1),0_0_10px_rgba(74,222,128,0.2)]
              before:from-green-500/0 before:via-green-500/10 before:to-green-500/0
              hover:border-green-400/50
              hover:shadow-[inset_4px_4px_10px_0_rgba(0,0,0,0.3),inset_-4px_-4px_10px_0_rgba(255,255,255,0.1),0_0_15px_rgba(74,222,128,0.3)]`}
          >
            <span className="relative z-10">Submit Donation</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            className={`${endButtons}
              text-red-400
              border-red-500/30
              shadow-[4px_4px_10px_0_rgba(0,0,0,0.3),-4px_-4px_10px_0_rgba(255,255,255,0.1),0_0_10px_rgba(248,113,113,0.2)]
              before:from-red-500/0 before:via-red-500/10 before:to-red-500/0
              hover:border-red-400/50
              hover:shadow-[inset_4px_4px_10px_0_rgba(0,0,0,0.3),inset_-4px_-4px_10px_0_rgba(255,255,255,0.1),0_0_15px_rgba(248,113,113,0.3)]`}
          >
            <span className="relative z-10">Reset</span>
          </button>
        </div>
      </div>
    </form>
  );
}