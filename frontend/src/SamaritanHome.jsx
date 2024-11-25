import React from "react";
import { useNavigate } from "react-router-dom";
import { apiDomain } from "./Config";

const Samaritan = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await fetch(`${apiDomain}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
    
            console.log("Logout Response:", response); // Debugging log
    
            if (response.ok) {
                const data = await response.json();
                console.log("Logout Success:", data); // Debugging log
                alert("You have been logged out.");
                navigate("/");
            } else {
                const errorData = await response.json();
                console.error("Logout Error Response:", errorData); // Debugging log
                alert("Failed to log out. Please try again.");
            }
        } catch (error) {
            console.error("Logout Network/Processing Error:", error); // Debugging log
            alert("An error occurred while logging out. Please try again later.");
        }
    };
    

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100">
            <h1 className="text-4xl font-bold text-blue-600 mb-8">
                Welcome to the Samaritan Page!
            </h1>
            <button
                onClick={handleLogout}
                className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
                Logout
            </button>
        </div>
    );
};

export default Samaritan;
