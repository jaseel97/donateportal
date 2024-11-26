import React from 'react';

const DatePicker = ({ value, onChange, name = "pickupDate" }) => {
  // Parse the value string if it exists
  const [date, timeFrom, timeTo] = value ? value.split(' ') : ['', '', ''];

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    const combinedValue = `${newDate} ${timeFrom || ''} ${timeTo || ''}`;
    onChange({ target: { name, value: combinedValue } });
  };

  const handleTimeFromChange = (e) => {
    const newTimeFrom = e.target.value;
    const combinedValue = `${date || ''} ${newTimeFrom} ${timeTo || ''}`;
    onChange({ target: { name, value: combinedValue } });
  };

  const handleTimeToChange = (e) => {
    const newTimeTo = e.target.value;
    if (timeFrom && newTimeTo < timeFrom) {
      alert("End time cannot be earlier than start time");
      return;
    }
    const combinedValue = `${date || ''} ${timeFrom || ''} ${newTimeTo}`;
    onChange({ target: { name, value: combinedValue } });
  };

  const inputStyle = "relative w-full bg-white/85 py-3 pl-4 pr-10 text-left border-2 border-indigo-200 hover:bg-gradient-to-r hover:from-white/90 hover:to-indigo-50/90 hover:border-indigo-300 hover:scale-[1.01] hover:shadow-md focus:border-sky-500 transition-all duration-300 rounded-t-lg";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex-1">
        <input
          type="date"
          id={`${name}-date`}
          value={date}
          onChange={handleDateChange}
          className={inputStyle}
          required
        />
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="time"
          id={`${name}-time-from`}
          value={timeFrom}
          onChange={handleTimeFromChange}
          className={inputStyle}
          required
        />
        <span className="text-indigo-500 font-medium">-</span>
        <input
          type="time"
          id={`${name}-time-to`}
          value={timeTo}
          onChange={handleTimeToChange}
          className={inputStyle}
          required
        />
      </div>
    </div>
  );
};

export default DatePicker;