import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
// We'll use the components you already have
import { ElegantInput, ElegantButton } from '../../components/Registration/FormComponents';
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
/**
 * @desc A reusable form page for Creating or Editing a Category.
 * Routed to /categories/new and /categories/edit/:id
 */
const FormCard = ({ title, children, footer, className = '' }) => (
    <div className={`bg-white shadow-xl rounded-lg ${className}`}>
        {title && (
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            </div>
        )}
        <div className="p-6 space-y-6">
            {children}
        </div>
        {footer && (
            <div className="bg-gray-50 px-6 py-4">
                {footer}
            </div>
        )}
    </div>
);

// --- Error Message Component ---
const ErrorMessage = ({ message, onDismiss }) => (
    <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
        <span>{message}</span>
        <button onClick={onDismiss} className="p-1 rounded-full hover:bg-red-200">
            <X size={18} />
        </button>
    </div>
);


/**
 * @desc A reusable form page for Creating or Editing a Category.
 * Routed to /categories/new and /categories/edit/:id
 */
const CategoryForm = () => {
    const { id } = useParams(); // Check if we have an ID from the URL
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null); // <-- NEW: For showing API errors
    const [parentCategories, setParentCategories] = useState([]); // For the dropdown
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parentCategory: '',
        status: 'active', // Added status
        // Attributes
        fssaiLicenceNumber: '',
        returnPolicy: '',
        origin: '',
        customerCareEmail: '',
        customerCarePhone: '',
        manufacturerName: '',
        expiryDateRequired: false,
        productWarrantyInfo: '',
    });

    // --- Data Loading Effect ---
    useEffect(() => {
        const token = localStorage.getItem("token");

        const fetchParents = async () => {
            try {
                const res = await axios.get(
                    `${API_URL}/api/category/all`, // <-- Corrected path
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (res.data.success) {
                    const onlyTop = res.data.categories.filter(c => !c.parentCategory);
                    setParentCategories(onlyTop);
                }
            } catch (err) {
                console.error("Error loading categories", err);
                setError("Could not load parent categories."); // <-- Set error
            }
        };

        const fetchCategoryById = async () => {
            setIsLoading(true); // <-- Start loading
            try {
                const res = await axios.get(
                    `${API_URL}/api/category/get/${id}`, // <-- Corrected path
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (res.data.success) {
                    const cat = res.data.category;

                    setFormData({
                        name: cat.name,
                        description: cat.description,
                        parentCategory: cat.parentCategory || "",
                        status: cat.status || "active",
                        fssaiLicenceNumber: cat.attributes?.fssaiLicenceNumber || "",
                        returnPolicy: cat.attributes?.returnPolicy || "",
                        origin: cat.attributes?.origin || "",
                        customerCareEmail: cat.attributes?.customerCareEmail || "",
                        customerCarePhone: cat.attributes?.customerCarePhone || "",
                        manufacturerName: cat.attributes?.manufacturerName || "",
                        expiryDateRequired: cat.attributes?.expiryDateRequired || false,
                        productWarrantyInfo: cat.attributes?.productWarrantyInfo || "",
                    });
                }

            } catch (err) {
                console.error("Error fetching category:", err);
                setError("Could not load category data."); // <-- Set error
            } finally {
                setIsLoading(false); // <-- Stop loading
            }
        };

        fetchParents();

        if (id) {
            setIsEditing(true);
            fetchCategoryById();
        }

    }, [id]);


    // --- Handlers ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null); // <-- Clear old errors

        const token = localStorage.getItem("token");

        const payload = {
            name: formData.name,
            description: formData.description,
            parentCategory: formData.parentCategory || null,
            status: formData.status,
            attributes: {
                fssaiLicenceNumber: formData.fssaiLicenceNumber,
                returnPolicy: formData.returnPolicy,
                origin: formData.origin,
                customerCareEmail: formData.customerCareEmail,
                customerCarePhone: formData.customerCarePhone,
                manufacturerName: formData.manufacturerName,
                expiryDateRequired: formData.expiryDateRequired,
                productWarrantyInfo: formData.productWarrantyInfo,
            }
        };

        try {
            let res;
            const url = isEditing
                ? `${API_URL}/api/category/update/${id}` // <-- Corrected path
                : `${API_URL}/api/category/create`; // <-- Corrected path

            const method = isEditing ? 'put' : 'post';

            res = await axios[method](
                url,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (res.data.success) {
                // alert(isEditing ? "Category updated!" : "Category created!"); // <-- Removed alert
                navigate("/categories");
            }

        } catch (err) {
            console.error("❌ API Error:", err);
            setError(err.response?.data?.message || "Something went wrong."); // <-- Set error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="font-sans">
            {/* --- Page Header (Responsive) --- */}
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4 md:gap-0">

                {/* Left Section */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/categories')}
                        className="p-2 rounded-full hover:bg-gray-200"
                        title="Back to categories"
                    >
                        <ArrowLeft size={20} className="text-gray-700" />
                    </button>

                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        {isEditing ? 'Edit Category' : 'Create New Category'}
                    </h1>
                </div>

                {/* Right Section */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
                    <ElegantButton
                        type="button"
                        variant="secondary"
                        onClick={() => navigate('/categories')}
                        className="w-full sm:w-auto bg-gray-200 text-gray-800 hover:bg-gray-300"
                    >
                        Cancel
                    </ElegantButton>

                    <ElegantButton type="submit" isLoading={isLoading} className="w-full sm:w-auto">
                        <Save size={18} className="mr-2" />
                        {isEditing ? 'Save Changes' : 'Create Category'}
                    </ElegantButton>
                </div>
            </div>


            {/* --- NEW: Error Message --- */}
            {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

            {/* --- NEW Two-Column Layout --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* --- Left Column (Main Content) --- */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Card 1: Basic Details */}
                    <FormCard title="Basic Details">
                        <ElegantInput
                            label="Category Name" id="name" name="name"
                            value={formData.name} onChange={handleChange}
                            placeholder="e.g., Electronics" required
                        />
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description" name="description"
                                value={formData.description} onChange={handleChange}
                                placeholder="e.g., All electronic items and accessories"
                                rows="4"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </FormCard>

                    {/* Card 2: Reusable Attributes */}
                    <FormCard title="Reusable Attributes">
                        <p className="text-sm text-gray-500 -mt-4">
                            These values will be auto-filled when sellers add new products to this category.
                        </p>
                        {/* NEW: 3-column grid for better space */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ElegantInput
                                label="Return Policy" id="returnPolicy" name="returnPolicy"
                                value={formData.returnPolicy} onChange={handleChange}
                                placeholder="e.g., 7 Days"
                            />
                            <ElegantInput
                                label="Origin" id="origin" name="origin"
                                value={formData.origin} onChange={handleChange}
                                placeholder="e.g., India"
                            />
                            <ElegantInput
                                label="Manufacturer Name" id="manufacturerName" name="manufacturerName"
                                value={formData.manufacturerName} onChange={handleChange}
                                placeholder="e.g., Ozonemart Pvt Ltd."
                            />
                            <ElegantInput
                                label="Product Warranty" id="productWarrantyInfo" name="productWarrantyInfo"
                                value={formData.productWarrantyInfo} onChange={handleChange}
                                placeholder="e.g., 1 Year Warranty"
                            />
                            <ElegantInput
                                label="Customer Care Email" id="customerCareEmail" name="customerCareEmail"
                                value={formData.customerCareEmail} onChange={handleChange}
                                type="email"
                                placeholder="e.g., support@ozonemart.com"
                            />
                            <ElegantInput
                                label="Customer Care Phone" id="customerCarePhone" name="customerCarePhone"
                                value={formData.customerCarePhone} onChange={handleChange}
                                placeholder="e.g., 1800-123-456"
                            />
                            <div className="md:col-span-3">
                                <ElegantInput
                                    label="FSSAI Number (if applicable)" id="fssaiLicenceNumber" name="fssaiLicenceNumber"
                                    value={formData.fssaiLicenceNumber} onChange={handleChange}
                                    placeholder="e.g., 12345678901234"
                                />
                            </div>
                            <div className="flex items-center pt-3 md:col-span-3">
                                <input
                                    type="checkbox"
                                    id="expiryDateRequired"
                                    name="expiryDateRequired"
                                    checked={formData.expiryDateRequired}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="expiryDateRequired" className="ml-3 block text-sm font-medium text-gray-700">
                                    Products in this category require an expiry date?
                                </label>
                            </div>
                        </div>
                    </FormCard>
                </div>

                {/* --- Right Column (Meta Settings) --- */}
                <div className="lg:col-span-1 space-y-8">

                    {/* Card 3: Status */}
                    <FormCard title="Status">
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </FormCard>

                    {/* Card 4: Parent Category */}
                    <FormCard title="Parent Category">
                        <select
                            id="parentCategory"
                            name="parentCategory"
                            value={formData.parentCategory}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">-- No Parent (Top Level) --</option>
                            {parentCategories.map(parentCat => (
                                // Prevent selecting itself as a parent
                                parentCat._id !== id && (
                                    <option key={parentCat._id} value={parentCat._id}>
                                        {parentCat.name}
                                    </option>
                                )
                            ))}
                        </select>
                    </FormCard>

                </div>
            </div>
        </form>
    );
};

export default CategoryForm;