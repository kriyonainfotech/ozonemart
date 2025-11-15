import { useEffect, useState } from "react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        console.log("🔐 ProtectedRoute mounted... Checking auth...");

        const token = localStorage.getItem("token");
        console.log("📦 LocalStorage token:", token);

        if (!token) {
            console.log("❌ No token found → user NOT authenticated");
            setLoading(false);
            setIsValid(false);
            return;
        }

        console.log("➡️ Sending token to backend for verification...");

        axios
            .get(`${API_URL}/api/auth/check-auth`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                console.log("✅ Backend verification success:", res.data);
                setIsValid(true);
            })
            .catch((err) => {
                console.error("❌ Backend verification failed:", err?.response?.data);
                console.log("🗑 Removing invalid/expired token...");
                localStorage.removeItem("token");
                setIsValid(false);
            })
            .finally(() => {
                console.log("⏳ Verification completed. Loading false.");
                setLoading(false);
            });
    }, []);

    // Show loading
    if (loading) {
        console.log("⏳ Showing loading screen...");
        return (
            <div className="flex items-center justify-center h-screen text-xl">
                Checking Authentication...
            </div>
        );
    }

    // Redirect if invalid
    if (!isValid) {
        console.log("🚫 Auth invalid → redirecting to /login");
        return <Navigate to="/login" replace />;
    }

    console.log("🎉 Auth valid → Rendering protected page");
    return children;
}

