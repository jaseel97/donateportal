import React, { useState } from "react";
import illustration from "./assets/login.jpg";

const provinces = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Nova Scotia",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Northwest Territories",
  "Nunavut",
  "Yukon"
];

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    username: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
  });

  const [message, setMessage] = useState("");
  const [accountType, setAccountType] = useState("user"); // user or organization
  const [isFlipped, setIsFlipped] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("Signup successful!");
  };

  const handleFlip = () => {
    setIsFlipped((prevState) => !prevState);
  };

  return (
    <div className="flex min-h-screen w-screen bg-gradient-to-br from-blue-300 via-blue-500 to-blue-700">
      {/* Left Section with Illustration */}
      <div className="w-7/12 flex items-center justify-center bg-white">
        <img
          src={illustration}
          alt="Illustration"
          className="w-10/12 h-auto"
        />
      </div>

      {/* Right Section with Signup and Flip Animation */}
      <div
        className={`relative w-5/12 bg-white shadow-xl transition-transform duration-500 transform ${isFlipped ? "rotate-y-180" : ""
          }`}
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Front Side: Signup Form */}
        <div
          className={`absolute w-full h-full backface-hidden ${isFlipped ? "hidden" : "flex"
            } flex-col items-center justify-center p-8`}
        >
          <h1 className="text-3xl font-extrabold text-blue-600 mb-6 text-center">
            Samaritan Connect
          </h1>
          <p className="text-center text-gray-600 mb-4">
            Please choose the account type
          </p>
          <div className="flex space-x-6 mb-6">
            <button
              onClick={() => setAccountType("user")}
              className={`w-32 py-3 rounded-lg ${accountType === "user" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"}`}
            >
              Samaritan
            </button>
            <button
              onClick={() => setAccountType("organization")}
              className={`w-32 py-3 rounded-lg ${accountType === "organization" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"}`}
            >
              Organization
            </button>
          </div>

          {/* Form for Organization */}
          {accountType === "organization" ? (
            <form onSubmit={handleSubmit} className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                    required
                  />
                </div>
                {/* Email Address */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                    required
                  />
                </div>
                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                    required
                  />
                </div>
                {/* Address Line 1 */}
                <div>
                  <label
                    htmlFor="addressLine1"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="Enter address line 1"
                    className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                    required
                  />
                </div>
                {/* Address Line 2 */}
                <div>
                  <label
                    htmlFor="addressLine2"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    placeholder="Enter address line 2"
                    className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                  />
                </div>
                {/* City */}
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter your city"
                    className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                    required
                  />
                </div>
                {/* Province */}
                <div>
                  <label
                    htmlFor="province"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Province
                  </label>
                  <select
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                    required
                  >
                    <option value="" disabled>Select your province</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Postal Code */}
                <div>
                  <label
                    htmlFor="postalCode"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="Enter your postal code"
                    className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2 rounded-lg hover:opacity-90 transition duration-300 text-lg font-semibold shadow-md mt-4 w-full"
              >
                Sign Up
              </button>
              {/* Add "Already have an account?" Link */}
              <p className="text-center text-gray-600 mt-4">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-blue-600 hover:underline"
                >
                  Login
                </a>
              </p>
            </form>
          ) : (
            // Form for User
            <form onSubmit={handleSubmit} className="w-full">
              <div className="grid grid-cols-1 gap-4">
                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                    required
                  />
                </div>
                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                    required
                  />
                </div>
                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                    required
                  />
                </div>
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                    required
                  />
                </div>
                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2 rounded-lg hover:opacity-90 transition duration-300 text-lg font-semibold shadow-md mt-4 w-full"
              >
                Sign Up
              </button>
              {/* Add "Already have an account?" Link */}
              <p className="text-center text-gray-600 mt-4">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-blue-600 hover:underline"
                >
                  Login
                </a>
              </p>
            </form>
          )}
          {message && <p className="text-center text-green-500 mt-4">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default Signup;
