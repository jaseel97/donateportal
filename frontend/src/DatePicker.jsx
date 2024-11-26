import React from 'react';

const DatePicker = ({ value, onChange, name = "pickupDate" }) => {
  return (
    <input
      type="datetime-local"
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="textareastyle"
      required
    />
  );
};

export default DatePicker;