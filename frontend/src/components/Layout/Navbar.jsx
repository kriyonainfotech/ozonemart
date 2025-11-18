import React, { useState } from "react";
import { Bell, User, LogOut, X, Menu } from "lucide-react"; // Added Menu icon
import { useNavigate } from "react-router-dom";

// --- UPDATED: Added props for sidebar ---
const Navbar = ({ onLogout, toggleSidebar }) => {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear tokens & other auth info
        localStorage.clear();
        sessionStorage.clear();
        if (onLogout) onLogout();
        navigate('/login'); // redirect to login/dashboard
    };

    return (
        <>
            {/* --- UPDATED: Added responsive padding (px-4 sm:px-6) --- */}
            <header className="bg-white shadow-sm flex items-center justify-between px-4 sm:px-6 py-3">

                {/* --- NEW: Hamburger menu button for mobile (links to AdminLayout's sidebar toggle) --- */}
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
                >
                    <Menu size={24} />
                </button>

                {/* --- UPDATED: Title is smaller on mobile --- */}
                <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Ozone Mart</h1>

                {/* --- UPDATED: Gap is smaller on mobile --- */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* <button className="relative">
                        <Bell size={20} className="text-gray-600 hover:text-indigo-600" />
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
                            3
                        </span>
                    </button> */}

                    <div className="flex items-center gap-2">
                        <User size={20} className="text-gray-600" />
                        {/* --- UPDATED: Text is hidden on mobile --- */}
                        <span className="font-medium text-gray-700 hidden sm:block">Admin</span>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        // --- UPDATED: Padding changes for mobile (icon-only) vs. desktop ---
                        className="bg-red-100 text-red-600 p-2 sm:px-3 sm:py-1 rounded-md hover:bg-red-200 flex items-center gap-1"
                    >
                        <LogOut size={16} />
                        {/* --- UPDATED: Text is hidden on mobile --- */}
                        <span className="text-sm font-medium hidden sm:block">Logout</span>
                    </button>
                </div>
            </header>

            {/* --- Logout Confirmation Modal --- */}
            {showModal && (
                <div className="fixed inset-0 bg-black/30 bg-opacity-40 flex items-center justify-center z-50 p-4">
                    {/* --- UPDATED: Modal is responsive --- */}
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            <X size={18} />
                        </button>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Logout</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;