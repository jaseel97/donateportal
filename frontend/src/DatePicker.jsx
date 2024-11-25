import React from 'react';

const DatePicker = ({ value, onChange }) => {
  return (
    <div className="mb-6">
      <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-2">
        Preferred Pickup Date
      </label>
      <input
        type="datetime-local"
        id="pickupDate"
        name="pickupDate"
        value={value}
        onChange={onChange}
        className="textareastyle"
        required
      />
    </div>
  );
};

export default DatePicker;