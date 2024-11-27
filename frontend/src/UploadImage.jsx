import React from 'react';
import { PhotoIcon } from '@heroicons/react/24/solid';

const UploadImage = ({ images, onChange, setFormData }) => {
  const handleDefaultImage = async () => {
    try {
      const response = await fetch('/vite.svg');
      const blob = await response.blob();
      const file = new File([blob], 'default-image.svg', { type: 'image/svg+xml' });
      return [file];
    } catch (error) {
      console.error('Error loading default image:', error);
      return [];
    }
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) {
      // If no files selected, use default image
      const defaultImages = await handleDefaultImage();
      setFormData(prev => ({
        ...prev,
        images: defaultImages
      }));
    } else {
      onChange(e);
    }
  };

  return (
    <div className="mb-6">
      <label htmlFor="donation-images" className="block text-sm font-medium text-gray-700 mb-2">
        Upload Images (Optional)
      </label>
      <div className="flex justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8">
        <div className="text-center">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
          <div className="mt-4 flex text-sm leading-6 text-gray-600">
            <label htmlFor="donation-images" className="relative cursor-pointer rounded-md font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500">
              <span>Upload photos</span>
              <input
                id="donation-images"
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
          <p className="text-xs leading-5 text-gray-500">PNG, JPG, GIF up to 10MB</p>
          {images.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {images.length} file{images.length !== 1 ? 's' : ''} selected
              </p>
              <div className="mt-2 flex justify-center">
                <img 
                  src={images[0] instanceof File ? URL.createObjectURL(images[0]) : images[0]} 
                  alt="Preview" 
                  className="h-20 w-20 object-cover rounded-md"
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