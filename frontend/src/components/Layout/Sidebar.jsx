// src/components/Layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Tag,            // For categories
    Package,        // For products
    User,           // For profile
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    return (
        <aside
            className={`bg-gray-900 text-gray-100 flex flex-col justify-between transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"
                }`}
        >
            <div className="p-4 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <div
                        className={`text-center font-bold text-indigo-400 text-lg ${isCollapsed ? "hidden" : "block"
                            }`}
                    >
                        Seller Admin
                    </div>

                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 bg-gray-700 hover:bg-gray-700 flex justify-center items-center transition"
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                <nav className="flex flex-col space-y-2 mt-4">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition ${isActive ? "bg-indigo-600" : "hover:bg-gray-800"
                            }`
                        }
                    >
                        <LayoutDashboard size={20} />
                        {!isCollapsed && <span>Dashboard</span>}
                    </NavLink>

                    <NavLink
                        to="/categories"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition ${isActive ? "bg-indigo-600" : "hover:bg-gray-800"
                            }`
                        }
                    >
                        <Tag size={20} />
                        {!isCollapsed && <span>Category</span>}
                    </NavLink>

                    <NavLink
                        to="/products"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition ${isActive ? "bg-indigo-600" : "hover:bg-gray-800"
                            }`
                        }
                    >
                        <Package size={20} />
                        {!isCollapsed && <span>Product</span>}
                    </NavLink>

                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition ${isActive ? "bg-indigo-600" : "hover:bg-gray-800"
                            }`
                        }
                    >
                        <User size={20} />
                        {!isCollapsed && <span>Profile</span>}
                    </NavLink>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
