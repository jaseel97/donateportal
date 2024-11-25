import React from 'react';

const Category = ({ value, onChange, categories }) => {
  return (
    <div className="mb-6">
      <label htmlFor="donation-category" className="block text-sm font-medium text-gray-700 mb-2">
        Category
      </label>
      <select
        id="donation-category"
        name="category"
        value={value}
        onChange={onChange}
        className="textareastyle"
        required
      >
        <option value="">Select a category</option>
        {Object.entries(categories.options).map(([key, value]) => (
          <option key={key} value={value}>
            {value}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Category;