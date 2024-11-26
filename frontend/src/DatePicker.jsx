import React from 'react';

const DatePicker = ({ value, onChange, name = "pickupDate" }) => {
  // Parse the value string if it exists, otherwise use default times
  const [date, timeFrom, timeTo] = value ? value.split(' ') : ['', '09:00', '17:00'];

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    // Include default times if they haven't been set yet
    const combinedValue = `${newDate} ${timeFrom || '09:00'} ${timeTo || '17:00'}`;
    onChange({ target: { name, value: combinedValue } });
  };

  const handleTimeFromChange = (e) => {
    const newTimeFrom = e.target.value;
    const combinedValue = `${date || ''} ${newTimeFrom} ${timeTo || '17:00'}`;
    onChange({ target: { name, value: combinedValue } });
  };

  const handleTimeToChange = (e) => {
    const newTimeTo = e.target.value;
    if (timeFrom && newTimeTo < timeFrom) {
      alert("End time cannot be earlier than start time");
      return;
    }
    const combinedValue = `${date || ''} ${timeFrom || '09:00'} ${newTimeTo}`;
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
          value={timeFrom || '09:00'}
          onChange={handleTimeFromChange}
          className={inputStyle}
          required
        />
        <span className="text-indigo-500 font-medium">-</span>
        <input
          type="time"
          id={`${name}-time-to`}
          value={timeTo || '17:00'}
          onChange={handleTimeToChange}
          className={inputStyle}
          required
        />
      </div>
    </div>
  );
};

export default DatePicker;