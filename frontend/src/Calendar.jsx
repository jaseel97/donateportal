import React from 'react';

const Calendar = ({ value, onChange, name = "date" }) => {
  const handleDateChange = (e) => {
    onChange({ target: { name, value: e.target.value } });
  };

  return (
    <input
      type="date"
      id={name}
      name={name}
      value={value}
      onChange={handleDateChange}
      className="relative w-full bg-white/85 py-3 pl-4 pr-10 text-left border-2 border-indigo-200 
      hover:bg-gradient-to-r hover:from-white/90 hover:to-indigo-50/90 hover:border-indigo-300 
      hover:scale-[1.01] hover:shadow-md focus:border-sky-500 
      transition-all duration-300 rounded-t-lg"
      required
    />
  );
};

export default Calendar;