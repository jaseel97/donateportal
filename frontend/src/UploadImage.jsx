import React from 'react';
import { PhotoIcon } from '@heroicons/react/24/solid';

const UploadImage = ({ images, onChange }) => {
  return (
    <div className="mb-6">
      <label htmlFor="donation-images" className="block text-sm font-medium text-gray-700 mb-2">
        Upload Images
      </label>
      <div className="flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-8 bg-gray-50">
        <div className="text-center">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
          <div className="mt-4 flex text-sm text-gray-600">
            <label htmlFor="donation-images" className="uploadimagetext">
              <span>Upload photos</span>
              <input
                id="donation-images"
                name="images"
                type="file"
                multiple
                className="sr-only"
                onChange={onChange}
                accept="image/*"
                required
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          {images.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              {images.length} files selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadImage;