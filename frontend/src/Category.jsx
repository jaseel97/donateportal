import React from 'react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';
import axios from "axios";
import { apiDomain } from "./Config";

const Category = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [categories, setCategories] = React.useState({});
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${apiDomain}/categories`, {
          withCredentials: true
        });
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

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
      <label className="categorylabel">Category*</label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className="categorystyle"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center">
            <span className="block truncate min-w-[200px]">
              {value || "Select a category"}
            </span>
          </div>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className={`category-icon ${isOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </span>
        </button>

        {isOpen && categories.options && (
          <ul className="categorylist">
            {Object.entries(categories.options).map(([key, categoryValue]) => (
              <li
                key={key}
                className={`categoryitem ${
                  value === categoryValue ? 'categoryitem-selected' : ''
                }`}
                onClick={() => {
                  onChange({ target: { name: 'category', id: key, value: categoryValue } });
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center">
                  <span className={`categoryitem-text ${
                      value === categoryValue ? 'categoryitem-text-selected' : ''
                    }`}>
                    {categoryValue}
                  </span>
                  {value === categoryValue && (
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

export default Category;