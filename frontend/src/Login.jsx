import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import illustration from "./assets/login.jpg";
import { apiDomain } from "./Config";

const Login = () => {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [message, setMessage] = useState("");
    const [isFlipped, setIsFlipped] = useState(false);
    const [userType, setUserType] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { username, password } = formData;

        try {
            const response = await fetch(`${apiDomain}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);

                if (data.message === "Login successful") {
                    setMessage("Login successful!");

                    const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
                        const [key, value] = cookie.split("=");
                        acc[key] = value;
                        return acc;
                    }, {});

                    const jwtToken = cookies.jwt;
                    console.log("JWT Token:", jwtToken);

                    if (jwtToken) {
                        // Decode JWT to get user_type (if needed)
                        const payload = JSON.parse(atob(jwtToken.split(".")[1]));
                        const decodedUserType = payload.user_type;
                        const userName = payload.username;

                        console.log("User Type from JWT:", decodedUserType);
                        console.log("User Name:", userName);

                        setUserType(decodedUserType);  // Update userType to trigger navigation
                    } else {
                        setMessage("JWT token not found.");
                    }
                } else {
                    setMessage(data.error || "An error occurred. Please try again.");
                }
            } else {
                const errorData = await response.json();
                setMessage(errorData.error || "Invalid credentials.");
            }
        } catch (error) {
            console.error("Login error:", error);
            setMessage("Unable to log in. Please try again later.");
        }
    };


    useEffect(() => {
        if (userType) {
            const stateData = { username: formData.username };  // Send the username in state

            if (userType === "samaritan") {
                console.log("Navigating to /samaritan...");
                navigate("/samaritan", { state: stateData });
            } else if (userType === "organization") {
                console.log("Navigating to /organization...");
                navigate("/organization", { state: stateData });
            } else {
                setMessage("Unknown user type.");
            }
        }
    }, [userType, navigate, formData.username]); 


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

            {/* Right Section with Login and Flip Animation */}
            <div
                className={`relative w-5/12 bg-white shadow-xl transition-transform duration-500 transform ${isFlipped ? "rotate-y-180" : ""
                    }`}
                style={{
                    perspective: "1000px",
                    transformStyle: "preserve-3d",
                }}
            >
                {/* Front Side: Login Form */}
                <div
                    className={`absolute w-full h-full backface-hidden ${isFlipped ? "hidden" : "flex"
                        } flex-col items-center justify-center p-8`}
                >
                    <h1 className="text-3xl font-extrabold text-blue-600 mb-6 text-center">
                        Samaritan Connect
                    </h1>
                    <p className="text-center text-gray-600 mb-4">
                        Please log in to your account
                    </p>
                    <form onSubmit={handleSubmit} className="flex flex-col space-y-6 w-full">
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-semibold text-gray-800"
                            >
                                Username or Email
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter your username or email"
                                className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                                required
                            />
                        </div>
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
                                className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 sm:text-sm bg-blue-50"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-lg hover:opacity-90 transition duration-300 text-lg font-semibold shadow-md"
                        >
                            Login
                        </button>
                    </form>
                    {message && (
                        <p
                            className={`mt-4 text-center ${message.includes("successful")
                                ? "text-green-600"
                                : "text-red-600"
                                } font-semibold`}
                        >
                            {message}
                        </p>
                    )}
                    <div className="flex justify-between w-full mt-4">
                        <Link
                            to="/signup"
                            className="text-blue-600 hover:underline text-sm font-medium"
                        >
                            Don't have an account? Register here
                        </Link>
                        <a
                            href="/forgot-password"
                            className="text-blue-600 hover:underline text-sm font-medium"
                        >
                            Forgot Password?
                        </a>
                    </div>
                    <button
                        onClick={handleFlip}
                        className="absolute top-4 left-4 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-800 transition duration-300 shadow-lg"
                        title="Flip to About"
                    >
                        🔄
                    </button>
                </div>

                {/* Back Side: About App */}
                <div
                    className={`absolute w-full h-full backface-hidden rotate-y-180 ${isFlipped ? "flex" : "hidden"
                        } flex-col items-center justify-center p-8`}
                >
                    <h1 className="text-3xl font-extrabold text-blue-600 mb-6 text-center">
                        About Samaritan Connect
                    </h1>
                    <p className="text-center text-gray-700">
                        This app helps you connect, share, and grow. Explore all
                        the features tailored to provide the best user
                        experience. Login or sign up to get started!
                    </p>
                    <button
                        onClick={handleFlip}
                        className="absolute top-4 left-4 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-800 transition duration-300 shadow-lg"
                        title="Flip to Login"
                    >
                        🔄
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
