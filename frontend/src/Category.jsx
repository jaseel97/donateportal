import React from 'react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';

const Category = ({ value, onChange, categories }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="mb-6">
      <label className="categorylabel">Category</label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className="categorystyle"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="block truncate">
            {value || "Select a category"}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className={`category-icon ${isOpen ? 'rotate-180' : ''}`} />
          </span>
        </button>

        {isOpen && (
          <ul className="categorylist">
            {Object.entries(categories.options).map(([key, categoryValue]) => (
              <li
                key={key}
                className={`categoryitem ${value === categoryValue ? 'categoryitem-selected' : ''}`}
                onClick={() => {
                  onChange({ target: { name: 'category', value: categoryValue } });
                  setIsOpen(false);
                }}
              >
                <span className={`categoryitem-text ${value === categoryValue ? 'categoryitem-text-selected' : ''}`}>
                  {categoryValue}
                </span>
                {value === categoryValue && (
                  <span className="category-checkicon">
                    <CheckIcon className="checkicon" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Category;