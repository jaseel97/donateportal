// ProximityDropdown.jsx
import React from 'react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';

const ProximityDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  const proximityOptions = [
    { label: "All", value: "" },
    { label: "5 km", value: 5 },
    { label: "10 km", value: 10 },
    { label: "20 km", value: 20 },
    { label: "50 km", value: 50 },
  ];

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDisplayValue = () => {
    if (!value) return "All";
    return `${value} km`;
  };

  return (
    <div className="mb-6">
      <label className="categorylabel">Filter by Proximity:</label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className="categorystyle"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center">
            <span className="block truncate min-w-[200px]">
              {getDisplayValue()}
            </span>
          </div>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className={`category-icon ${isOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </span>
        </button>

        {isOpen && (
          <ul className="categorylist">
            {proximityOptions.map((option) => (
              <li
                key={option.value}
                className={`categoryitem ${
                  value === option.value ? 'categoryitem-selected' : ''
                }`}
                onClick={() => {
                  onChange({ target: { value: option.value } });
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center">
                  <span className={`categoryitem-text ${
                    value === option.value ? 'categoryitem-text-selected' : ''
                  }`}>
                    {option.label}
                  </span>
                  {value === option.value && (
                    <span className="category-checkicon">
                      <CheckIcon className="checkicon" />
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProximityDropdown;