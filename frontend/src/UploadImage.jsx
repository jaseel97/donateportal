import React from 'react';
import { PhotoIcon } from '@heroicons/react/24/solid';

const UploadImage = ({ image, onChange, setFormData }) => {
  const handleDefaultImage = async () => {
    try {
      const response = await fetch('/vite.svg');
      const blob = await response.blob();
      const file = new File([blob], 'default-image.svg', { type: 'image/svg+xml' });
      return file;
    } catch (error) {
      console.error('Error loading default image:', error);
      return null;
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      // If no file selected, use default image
      const defaultImage = await handleDefaultImage();
      setFormData(prev => ({
        ...prev,
        image: defaultImage
      }));
    } else {
      onChange(e);
    }
  };

  return (
    <div className="mb-6">
      <label htmlFor="donation-image" className="categorylabel">
        Upload Image (Optional)
      </label>
      <div className="flex justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8">
        <div className="text-center">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
          <div className="mt-4 flex text-sm leading-6 text-gray-600">
            <label htmlFor="donation-image" className="relative cursor-pointer rounded-md font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500">
              <span>Upload a photo</span>
              <input
                id="donation-image"
                name="image"
                type="file"
                className="sr-only"
                onChange={handleImageChange}
                accept="image/*"
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs leading-5 text-gray-500">PNG, JPG, GIF up to 10MB</p>
          {image && (
            <div className="mt-4">
              <div className="mt-2 flex justify-center">
                <img 
                  src={image instanceof File ? URL.createObjectURL(image) : image} 
                  alt="Preview" 
                  className="max-w-xs h-auto rounded-lg shadow-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadImage;