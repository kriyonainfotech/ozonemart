import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, X, Search, Inbox, AlertTriangle } from 'lucide-react';
// We'll use the components you already have
import { ElegantButton } from '../../components/Registration/FormComponents';
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
import axios from 'axios';

/**
 * @desc    The main Category Management page (Table View).
 * Routed to /categories
 */
const CategoryManager = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // --- NEW: State for Modals ---
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);


                const token = localStorage.getItem("token");

                const res = await axios.get(
                    `${API_URL}/api/category/all`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                console.log("Fetching categories", res.data);

                if (res.data.success) {
                    // Add parentName manually here
                    const populatedData = res.data.categories.map(cat => ({
                        ...cat,
                        parentName: res.data.categories.find(
                            p => p._id === cat.parentCategory
                        )?.name || null
                    }));

                    setCategories(populatedData);
                }

            } catch (err) {
                console.error("Error fetching categories:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);


    // --- Filtered Categories (based on search) ---
    const filteredCategories = useMemo(() => {
        return categories.filter(cat =>
            cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    // --- Handlers ---
    const handleEdit = (id) => {
        navigate(`/categories/edit/${id}`);
    };

    const handleOpenView = (category) => {
        setSelectedCategory(category);
        setShowViewModal(true);
    };

    const handleOpenDelete = (category) => {
        setSelectedCategory(category);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedCategory) return;

        console.log("Deleting category:", selectedCategory._id);
        setIsLoading(true); // You can set a different "isDeleting" state for the modal
        setShowDeleteModal(false);

        // --- SIMULATION (replace with your API call) ---
        const token = localStorage.getItem("token");
        const res = await axios.delete(`${API_URL}/api/category/delete/${selectedCategory._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setTimeout(() => {
            setCategories(prev => prev.filter(cat => cat._id !== selectedCategory._id));
            setSelectedCategory(null);
            setIsLoading(false);
        }, 500);
    };

    // --- Render Status Badge ---
    const StatusBadge = ({ status }) => (
        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
            {status}
        </span>
    );

    return (
        <div className="font-sans">
            {/* --- Page Header (Responsive) --- */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Category Management</h1>
                <div className="w-full sm:w-auto">
                    <ElegantButton onClick={() => navigate('/categories/new')} className="w-full sm:w-auto">
                        <Plus size={20} className="mr-0 sm:mr-2" />
                        <span className="hidden sm:block">Create Category</span>
                    </ElegantButton>
                </div>
            </div>

            {/* --- Search Bar --- */}
            <div className="mb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {error && <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

            {/* --- Category Table (Responsive) --- */}
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                {isLoading ? (
                    <TableLoadingSkeleton />
                ) : filteredCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                        <Inbox size={48} className="mb-4" />
                        <h3 className="text-lg font-semibold">No categories found.</h3>
                        {searchTerm ? (
                            <p>Try adjusting your search.</p>
                        ) : (
                            <p>Get started by creating a new one.</p>
                        )}
                    </div>
                ) : (
                    // --- This div makes the table scroll horizontally on mobile ---
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCategories.map((cat) => (
                                    <tr key={cat._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{cat.name}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-xs">{cat.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {cat.parentName || '---'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={cat.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(cat.createdAt).toLocaleString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => handleOpenView(cat)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full" title="View">
                                                <Eye size={18} />
                                            </button>
                                            <button onClick={() => handleEdit(cat._id)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Edit">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleOpenDelete(cat)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- View Category Modal --- */}
            {showViewModal && selectedCategory && (
                <ViewCategoryModal
                    category={selectedCategory}
                    onClose={() => setShowViewModal(false)}
                />
            )}

            {/* --- Delete Confirmation Modal --- */}
            {showDeleteModal && selectedCategory && (
                <DeleteCategoryModal
                    category={selectedCategory}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={confirmDelete}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};

// --- View Category Modal Component ---
const ViewCategoryModal = ({ category, onClose }) => (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
                    <p className="text-gray-500">{category.description}</p>
                </div>
                <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                    <X size={20} />
                </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto">
                <div className="flex items-center gap-6">
                    <AttributeItem label="Parent Category" value={category.parentName || '--- (Top Level)'} />
                    <AttributeItem label="Status" value={category.status} isStatus={true} />
                </div>

                <h3 className="text-xl font-semibold text-gray-700 pt-4 border-t">Reusable Attributes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <AttributeItem label="Return Policy" value={category.attributes.returnPolicy} />
                    <AttributeItem label="Origin" value={category.attributes.origin} />
                    <AttributeItem label="Manufacturer" value={category.attributes.manufacturerName} />
                    <AttributeItem label="Warranty" value={category.attributes.productWarrantyInfo} />
                    <AttributeItem label="Customer Care Email" value={category.attributes.customerCareEmail} />
                    <AttributeItem label="Customer Care Phone" value={category.attributes.customerCarePhone} />
                    <AttributeItem label="FSSAI Number" value={category.attributes.fssaiLicenceNumber} />
                    <AttributeItem label="Expiry Date Required?" value={category.attributes.expiryDateRequired ? 'Yes' : 'No'} />
                </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t text-right">
                <ElegantButton onClick={onClose} className="w-auto bg-gray-200 text-gray-800 hover:bg-gray-300">
                    Close
                </ElegantButton>
            </div>
        </div>
    </div>
);

// --- Delete Confirmation Modal Component ---
const DeleteCategoryModal = ({ category, onClose, onConfirm, isLoading }) => (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <AlertTriangle size={24} className="text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Delete Category</h2>
                        <p className="text-gray-600 mt-2">
                            Are you sure you want to delete the category "{category.name}"? This action cannot be undone.
                        </p>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                <ElegantButton onClick={onClose} className="w-auto bg-gray-200 text-gray-800 hover:bg-gray-300">
                    Cancel
                </ElegantButton>
                <ElegantButton onClick={onConfirm} isLoading={isLoading} variant="danger" className="w-auto bg-red-600 hover:bg-red-700">
                    Delete
                </ElegantButton>
            </div>
        </div>
    </div>
);


// --- Helper component for Modals ---
const AttributeItem = ({ label, value, isStatus = false }) => (
    <div>
        <h4 className="text-sm font-medium text-gray-500">{label}</h4>
        {isStatus ? (
            <span className={`px-2 py-0.5 inline-flex text-sm leading-5 font-semibold rounded-full capitalize ${value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {value}
            </span>
        ) : (
            <p className="text-base text-gray-800 font-semibold">{value || '---'}</p>
        )}
    </div>
);

// --- NEW: Table Loading Skeleton Component ---
const TableLoadingSkeleton = () => (
    <div className="font-sans animate-pulse">
        <div className="bg-white rounded-lg p-6 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3"><div className="h-4 w-24 bg-gray-300 rounded"></div></th>
                            <th className="px-6 py-3"><div className="h-4 w-32 bg-gray-300 rounded"></div></th>
                            <th className="px-6 py-3"><div className="h-4 w-20 bg-gray-300 rounded"></div></th>
                            <th className="px-6 py-3"><div className="h-4 w-28 bg-gray-300 rounded"></div></th>
                            <th className="px-6 py-3"><div className="h-4 w-24 bg-gray-300 rounded"></div></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {[...Array(4)].map((_, i) => (
                            <tr key={i}>
                                <td className="px-6 py-4">
                                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                    <div className="h-3 w-40 bg-gray-200 rounded mt-2"></div>
                                </td>
                                <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                                <td className="px-6 py-4"><div className="h-5 w-16 bg-gray-200 rounded-full"></div></td>
                                <td className="px-6 py-4"><div className="h-4 w-28 bg-gray-200 rounded"></div></td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">
                                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

export default CategoryManager;