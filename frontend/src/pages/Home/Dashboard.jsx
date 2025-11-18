import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, Archive, Component, Boxes, Plus, Edit, User } from 'lucide-react';

// Use the same API_URL from your other files
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Dashboard = () => {
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState(null);
    const [seller, setSeller] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError(null);
            const token = localStorage.getItem("token");
            if (!token) {
                navigate('/login');
                return;
            }
            console.log("Fetching dashboard data with token:", token);

            try {
                // Fetch in parallel
                const [metricsRes, profileRes] = await Promise.all([
                    axios.get(`${API_URL}/api/auth/dashboard-metrics`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.post(`${API_URL}/api/auth/get-user`, {},
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        })
                ]);

                if (metricsRes.data.success) {
                    setMetrics(metricsRes.data.metrics);
                }
                if (profileRes.data.success) {
                    setSeller(profileRes.data.seller);
                }

            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError("Could not load dashboard data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
    }

    return (
        <div className="font-sans">
            {/* --- Header --- */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Welcome back, {seller?.fullName.split(' ')[0]}!
                </h1>
                <p className="text-gray-500">Here's a snapshot of your store today.</p>
            </div>

            {/* --- Stats Card Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Products"
                    value={metrics?.productCount}
                    icon={<Package className="text-indigo-500" />}
                    onClick={() => navigate('/products')}
                />
                <StatsCard
                    title="Total Stock"
                    value={metrics?.totalStock}
                    icon={<Boxes className="text-green-500" />}
                />
                <StatsCard
                    title="Out of Stock"
                    value={metrics?.outOfStockItems}
                    icon={<Archive className="text-red-500" />}
                />
                <StatsCard
                    title="Categories"
                    value={metrics?.categoryCount}
                    icon={<Component className="text-blue-500" />}
                    onClick={() => navigate('/categories')}
                />
            </div>

            {/* --- Quick Actions & Status --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Quick Actions */}
                <div className="lg:col-span-2 bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ActionButton
                            title="Add New Product"
                            icon={<Plus className="text-indigo-600" />}
                            onClick={() => navigate('/products/new')}
                        />
                        <ActionButton
                            title="Manage Categories"
                            icon={<Edit className="text-blue-600" />}
                            onClick={() => navigate('/categories')}
                        />
                        <ActionButton
                            title="Edit Profile"
                            icon={<User className="text-green-600" />}
                            onClick={() => navigate('/profile')}
                        />
                    </div>
                </div>

                {/* Profile Status */}
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Profile Status</h2>
                    <div className="flex items-center gap-3">
                        <StatusBadge status={seller?.status} />
                        <span className="font-semibold text-gray-700 capitalize">
                            {seller?.status.replace('-', ' ')}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">
                        {seller?.status === 'active'
                            ? "Your profile is active and customers can see your products."
                            : "Your profile is pending review. You can add products, but they won't be live."
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- Helper Components ---

const StatsCard = ({ title, value, icon, onClick }) => {
    const cardClasses = "bg-white shadow-lg rounded-lg p-6 flex items-center gap-4 transition-all"
    const clickableClasses = onClick ? "hover:shadow-xl hover:bg-indigo-50 cursor-pointer" : "";

    return (
        <div className={`${cardClasses} ${clickableClasses}`} onClick={onClick}>
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <p className="text-3xl font-bold text-gray-800">{value ?? '0'}</p>
            </div>
        </div>
    );
};

const ActionButton = ({ title, icon, onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-indigo-50 rounded-lg border border-gray-200 transition"
    >
        <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-sm mb-2">
            {icon}
        </div>
        <span className="font-semibold text-gray-700">{title}</span>
    </button>
);

const StatusBadge = ({ status }) => {
    let color = 'bg-gray-500';
    if (status === 'active') color = 'bg-green-500';
    if (status === 'pending-admin-approval') color = 'bg-yellow-500';

    return (
        <div className={`w-3 h-3 rounded-full ${color} relative flex items-center justify-center`}>
            <div className={`w-3 h-3 rounded-full ${color} animate-ping`}></div>
        </div>
    );
};

// --- Loading Skeleton ---
const LoadingSkeleton = () => (
    <div className="font-sans animate-pulse">
        {/* Header */}
        <div className="mb-6">
            <div className="h-9 w-1/2 bg-gray-300 rounded-md"></div>
            <div className="h-5 w-1/3 bg-gray-200 rounded-md mt-2"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-200 rounded-lg h-32"></div>
            <div className="bg-gray-200 rounded-lg h-32"></div>
            <div className="bg-gray-200 rounded-lg h-32"></div>
            <div className="bg-gray-200 rounded-lg h-32"></div>
        </div>

        {/* Quick Actions & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-200 rounded-lg h-48"></div>
            <div className="bg-gray-200 rounded-lg h-48"></div>
        </div>
    </div>
);

export default Dashboard;