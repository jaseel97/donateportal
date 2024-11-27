import React from 'react';
import { PhotoIcon } from '@heroicons/react/24/solid';

const UploadImage = ({ image, preview, onChange }) => {
  return (
    <div className="mb-6">
      <label className="categorylabel">
        Upload Image
      </label>
      <div className="mt-2">
        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>
      {preview && (
        <div className="mt-4">
          <img
            src={preview}
            alt="Preview"
            className="max-w-xs h-auto rounded-lg shadow-sm"
          />
        </div>
      )}
    </div>
  );
};

export default UploadImage;