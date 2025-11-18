import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Search, Package, Inbox } from 'lucide-react';
import { ElegantInput, ElegantButton } from '../../components/Registration/FormComponents';
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
import axios from 'axios';

/**
 * @desc    The main "Manage Product" page (Table View).
 * Routed to /products
 */
const ProductList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // --- Data Fetching ---
    // useEffect(() => {
    //     // (SIMULATION) Fetch products
    //     console.log("Fetching products...");
    //     setTimeout(() => {
    //         // We'll calculate total stock for the table
    //         const populatedData = dummyProductData.map(prod => ({
    //             ...prod,
    //             totalStock: prod.variants.reduce((acc, v) => acc + v.stock, 0)
    //         }));
    //         setProducts(populatedData);
    //         setIsLoading(false);
    //     }, 1000); // 1 second delay
    // }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);

                const token = localStorage.getItem("token");

                const res = await axios.get(`${API_URL}/api/product/all`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log("Products fetched:", res.data);

                if (!res.data.success) {
                    console.error("Error fetching products:", res.data.message);
                    setIsLoading(false);
                    return;
                }

                // Add total stock field
                const populatedData = res.data.products.map(prod => ({
                    ...prod,
                    totalStock: prod.variants?.reduce((acc, v) => acc + v.stock, 0) || 0,
                }));

                setProducts(populatedData);
                setIsLoading(false);

            } catch (error) {
                console.error("Fetch products failed:", error);
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);


    // --- Filtered Products (based on search) ---
    const filteredProducts = useMemo(() => {
        return products.filter(prod =>
            prod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prod.brand.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    // --- Handlers ---
    const handleView = (id) => {
        navigate(`/products/view/${id}`);
    };

    const handleEdit = (id) => {
        navigate(`/products/edit/${id}`);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product? This is permanent.')) {
            console.log("Deleting product:", id);
            setIsLoading(true);
            setTimeout(() => {
                setProducts(prev => prev.filter(p => p._id !== id));
                setIsLoading(false);
            }, 500);
        }
    };

    // --- Render Status Badge ---
    const StatusBadge = ({ status }) => {
        let colorClasses = '';
        switch (status) {
            case 'published':
                colorClasses = 'bg-green-100 text-green-800';
                break;
            case 'draft':
                colorClasses = 'bg-yellow-100 text-yellow-800';
                break;
            case 'archived':
                colorClasses = 'bg-gray-100 text-gray-800';
                break;
            default:
                colorClasses = 'bg-gray-100 text-gray-800';
        }
        return (
            <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}>
                {status}
            </span>
        );
    };

    if (isLoading) {
        return <LoadingSkeleton />; // Show skeleton
    }

    if (error) {
        return <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
    }

    return (
        <div className="font-sans">
            {/* --- Page Header --- */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    Product Management
                </h1>

                <div className="w-full sm:w-auto">
                    <ElegantButton
                        onClick={() => navigate('/products/new')}
                        className="w-full sm:w-auto"
                    >
                        <Plus size={20} className="mr-2" />
                        Create Product
                    </ElegantButton>
                </div>

            </div>


            {/* --- Search & Filter Bar --- */}
            <div className="mb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by product name or brand..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* --- Product Table --- */}
            <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
                {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                        <Inbox size={48} className="mb-4" />
                        <h3 className="text-lg font-semibold">No products found.</h3>
                        {searchTerm ? (
                            <p>Try adjusting your search.</p>
                        ) : (
                            <p>Get started by adding a new product.</p>
                        )}
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.map(prod => (
                                <tr key={prod._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img
                                                    className="h-10 w-10 rounded-md object-cover"
                                                    src={prod.images[0] || 'https://placehold.co/400x400/eeeeee/999999?text=No+Image'}
                                                    alt={prod.title}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{prod.title}</div>
                                                <div className="text-xs text-gray-500">{prod.brand}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prod.category.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prod.totalStock} units</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={prod.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleView(prod._id)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full" title="View">
                                            <Eye size={18} />
                                        </button>
                                        <button onClick={() => handleEdit(prod._id)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Edit">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(prod._id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

// --- NEW: Loading Skeleton Component ---
const LoadingSkeleton = () => (
    <div className="font-sans animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-6">
            <div className="h-9 w-1/3 bg-gray-300 rounded-md"></div>
            <div className="h-12 w-48 bg-gray-300 rounded-lg"></div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="mb-4">
            <div className="h-12 w-full bg-gray-300 rounded-lg"></div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white shadow-xl rounded-lg p-6">
            <div className="h-4 w-1/4 bg-gray-300 rounded-md mb-6"></div>
            <div className="space-y-4">
                <div className="h-8 w-full bg-gray-200 rounded-md"></div>
                <div className="h-8 w-full bg-gray-200 rounded-md"></div>
                <div className="h-8 w-full bg-gray-200 rounded-md"></div>
                <div className="h-8 w-3/4 bg-gray-200 rounded-md"></div>
            </div>
        </div>
    </div>
);

export default ProductList;