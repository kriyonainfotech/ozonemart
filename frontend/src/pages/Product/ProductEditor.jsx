import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, X } from 'lucide-react';
// We'll use the components you already have
import { ElegantInput, ElegantButton } from '../../components/Registration/FormComponents';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// --- THIS IS THE FIX ---
// Moved FormCard outside the main component to prevent re-mounting on every render.
// This stops the "jumping" effect when typing.
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
 * @desc    The main "Add/Edit Product" form page.
 * Routed to /products/new and /products/edit/:id
 */
const ProductEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);

    // --- Form State ---
    // "Parent" product data
    const [productData, setProductData] = useState({
        title: '',
        brand: '',
        description: '',
        shortDescription: '', // <-- ADDED
        categoryId: '',
        tags: '', // <-- ADDED (will be comma-separated string)
        images: [], // Will store { file, preview } objects
        attributes: { // <-- ADDED
            fssaiNumber: '',
            origin: '',
            manufacturer: '',
            returnPolicy: '',
            customerCareInfo: '',
            expiryDate: '',
        },
        shippingDetails: { // <-- ADDED
            weight: '',
            length: '',
            width: '',
            height: '',
            fragile: false,
            perishable: false,
        },
        taxPercentage: 0,
        hsnCode: '',
        status: 'draft',
    });

    // "Child" variants data
    const [variants, setVariants] = useState([
        {
            id: Date.now(),
            name: '',
            sku: '',
            barcode: '', // <-- ADDED
            mrp: '',
            sellingPrice: '',
            stock: '',
            leadTime: '', // <-- ADDED
            status: 'active' // <-- ADDED
        }
    ]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // 1️⃣ Fetch categories for dropdown
                const token = localStorage.getItem("token");
                const categoriesRes = await axios.get(`${API_URL}/api/category/all`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (categoriesRes.data.success) {
                    setCategories(categoriesRes.data.categories);
                }

                // 2️⃣ If editing, fetch product details
                if (id) {
                    setIsEditing(true);
                    const productRes = await axios.get(`${API_URL}/api/product/get/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (productRes.data.success) {
                        const prod = productRes.data.product;
                        const fetchedVariants = productRes.data.variants;

                        setProductData({
                            title: prod.title || '',
                            brand: prod.brand || '',
                            description: prod.description || '',
                            shortDescription: prod.shortDescription || '', // <-- ADDED
                            categoryId: prod.category?._id || prod.category || '', // Handle populated or just ID
                            tags: (prod.tags || []).join(', '), // <-- ADDED (join array)
                            images: (prod.images || []).map(url => ({ file: null, preview: url })), // <-- Format for image preview
                            attributes: { // <-- ADDED
                                fssaiNumber: prod.attributes?.fssaiNumber || '',
                                origin: prod.attributes?.origin || '',
                                manufacturer: prod.attributes?.manufacturer || '',
                                returnPolicy: prod.attributes?.returnPolicy || '',
                                customerCareInfo: prod.attributes?.customerCareInfo || '',
                                expiryDate: prod.attributes?.expiryDate ? new Date(prod.attributes.expiryDate).toISOString().split('T')[0] : '', // Format date
                            },
                            shippingDetails: { // <-- ADDED
                                weight: prod.shippingDetails?.weight || '',
                                length: prod.shippingDetails?.length || '',
                                width: prod.shippingDetails?.width || '',
                                height: prod.shippingDetails?.height || '',
                                fragile: prod.shippingDetails?.fragile || false,
                                perishable: prod.shippingDetails?.perishable || false,
                            },
                            taxPercentage: prod.taxPercentage || 0,
                            hsnCode: prod.hsnCode || '',
                            status: prod.status || 'draft',
                        });

                        // Map variants and add React keys
                        const mappedVariants = (fetchedVariants || []).map(v => ({
                            ...v,
                            id: v._id, // Use _id as the key
                            barcode: v.barcode || '', // <-- ADDED
                            leadTime: v.leadTime || '', // <-- ADDED
                            status: v.status || 'active' // <-- ADDED
                        }));
                        setVariants(mappedVariants.length > 0 ? mappedVariants : [
                            { id: Date.now(), name: '', sku: '', barcode: '', mrp: '', sellingPrice: '', stock: '', leadTime: '', status: 'active' }
                        ]);
                    }
                } else {
                    setIsEditing(false);
                }
            } catch (err) {
                console.error("Error fetching product data:", err);
                setError("Failed to load product data. Check console.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);


    // --- Handlers ---

    const handleProductChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProductData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleShippingChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProductData(prev => ({
            ...prev,
            shippingDetails: {
                ...prev.shippingDetails,
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    };

    const handleAttributeChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProductData(prev => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    };

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        const selectedCat = categories.find(c => c._id === categoryId);
        setProductData(prev => ({
            ...prev,
            categoryId: categoryId,
            // Auto-fill attributes from category
            attributes: selectedCat ? selectedCat.attributes : {}
        }));
    };

    // --- Variant Handlers ---
    const handleVariantChange = (index, e) => {
        const { name, value } = e.target;
        const newVariants = [...variants];
        newVariants[index][name] = value;
        setVariants(newVariants);
    };

    const addVariant = () => {
        setVariants(prev => [
            ...prev,
            {
                id: Date.now(),
                name: '',
                sku: '',
                barcode: '', // <-- ADDED
                mrp: '',
                sellingPrice: '',
                stock: '',
                leadTime: '', // <-- ADDED
                status: 'active' // <-- ADDED
            }
        ]);
    };

    const removeVariant = (id) => {
        if (variants.length <= 1) {
            setError("You must have at least one variant.");
            return;
        }
        setVariants(prev => prev.filter(v => v.id !== id));
    };

    // --- Image Handlers ---
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files); // Convert FileList to Array
        if (!files.length) return;

        // Create previews for display
        const filesWithPreview = files.map(file => ({
            file, // Actual File object for submission
            preview: URL.createObjectURL(file) // Preview URL for <img>
        }));

        setProductData(prev => ({
            ...prev,
            images: [...prev.images, ...filesWithPreview]
        }));
    };

    const removeImage = (index) => {
        setProductData(prev => {
            const newImages = [...prev.images];
            const imgToRemove = newImages[index];

            // Revoke preview URL to free memory, only if it's a blob URL
            if (imgToRemove.preview.startsWith('blob:')) {
                URL.revokeObjectURL(imgToRemove.preview);
            }

            newImages.splice(index, 1);
            return { ...prev, images: newImages };
        });
    };

    // --- Form Submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();

            // Append product fields
            formData.append("title", productData.title);
            formData.append("brand", productData.brand);
            formData.append("description", productData.description);
            formData.append("shortDescription", productData.shortDescription); // <-- ADDED
            formData.append("categoryId", productData.categoryId);
            formData.append("taxPercentage", productData.taxPercentage);
            formData.append("hsnCode", productData.hsnCode);
            formData.append("status", productData.status);
            formData.append("tags", productData.tags); // <-- ADDED (send as string)

            // Append images as files
            // Differentiate between new files (File objects) and existing URLs (strings)
            const existingImageUrls = [];
            productData.images.forEach(imgObj => {
                if (imgObj.file) {
                    formData.append("images", imgObj.file); // Append new files
                } else if (imgObj.preview) {
                    existingImageUrls.push(imgObj.preview); // Collect existing URLs
                }
            });
            // Send existing URLs as a JSON string
            formData.append("existingImages", JSON.stringify(existingImageUrls));

            // Append attributes & shippingDetails as JSON strings
            formData.append("attributes", JSON.stringify(productData.attributes));
            formData.append("shippingDetails", JSON.stringify(productData.shippingDetails)); // <-- ADDED

            // Append variants as JSON
            const finalVariants = variants.map(v => {
                const { id, ...rest } = v; // Remove temp React key
                return rest;
            });
            formData.append("variants", JSON.stringify(finalVariants));

            let res;
            if (isEditing) {
                res = await axios.put(`${API_URL}/api/product/update/${id}`, formData, { // <-- Corrected path
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                });
            } else {
                res = await axios.post(`${API_URL}/api/product/create`, formData, { // <-- Corrected path
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                });
            }

            console.log("✅ API Response:", res.data);

            if (res.data.success) {
                // alert(isEditing ? "Product updated!" : "Product created!");
                navigate("/products");
            }

        } catch (err) {
            console.error("❌ API Error:", err);
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };


    if (isLoading) {
        return (
            <div className="text-center p-12">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading Product Data...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="font-sans">
            {/* --- Page Header --- */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="p-2 rounded-full hover:bg-gray-200"
                        title="Back to products"
                    >
                        <ArrowLeft size={20} className="text-gray-700" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {isEditing ? 'Edit Product' : 'Create New Product'}
                    </h1>
                </div>
                <div className="flex gap-3">
                    <ElegantButton type="button" variant="secondary" className="w-auto bg-gray-200 text-gray-800 hover:bg-gray-300">
                        Save as Draft
                    </ElegantButton>
                    <ElegantButton type="submit" isLoading={isLoading} className="w-auto">
                        <Save size={18} className="mr-2" />
                        {isEditing ? 'Save Changes' : 'Publish Product'}
                    </ElegantButton>
                </div>
            </div>

            {/* --- Error Message --- */}
            {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

            {/* --- Two-Column Layout --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* --- Left Column (Main Details) --- */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Basic Details Card */}
                    <FormCard title="Basic Details">
                        <ElegantInput
                            label="Product Title" id="title" name="title"
                            value={productData.title} onChange={handleProductChange}
                            placeholder="e.g., Amul Butter" required
                        />
                        <ElegantInput
                            label="Brand Name" id="brand" name="brand"
                            value={productData.brand} onChange={handleProductChange}
                            placeholder="e.g., Amul" required
                        />
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description" name="description"
                                value={productData.description} onChange={handleProductChange}
                                rows="5"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., Pure and fresh butter..."
                            ></textarea>
                        </div>
                        {/* --- ADDED shortDescription --- */}
                        <div>
                            <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                Short Description
                            </label>
                            <textarea
                                id="shortDescription" name="shortDescription"
                                value={productData.shortDescription} onChange={handleProductChange}
                                rows="2"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., Tasty and creamy"
                            ></textarea>
                        </div>
                    </FormCard>

                    {/* Variants Card */}
                    <FormCard title="Variants, Pricing & Stock">
                        <div className="space-y-6">
                            {variants.map((variant, index) => (
                                <div key={variant.id} className="p-4 border rounded-lg bg-gray-50 relative">
                                    <h3 className="font-medium text-gray-600 mb-4">Variant {index + 1}</h3>
                                    {variants.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(variant.id)}
                                            className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 rounded-full"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                    {/* --- UPDATED GRID --- */}
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                        <ElegantInput
                                            label="Name (e.g., 500g)" id={`v_name_${index}`} name="name"
                                            value={variant.name} onChange={(e) => handleVariantChange(index, e)}
                                            required className="md:col-span-2"
                                        />
                                        <ElegantInput
                                            label="SKU" id={`v_sku_${index}`} name="sku"
                                            value={variant.sku} onChange={(e) => handleVariantChange(index, e)}
                                            required className="md:col-span-2"
                                        />
                                        <ElegantInput
                                            label="Stock" id={`v_stock_${index}`} name="stock"
                                            value={variant.stock} onChange={(e) => handleVariantChange(index, e)}
                                            type="number" required
                                        />
                                        <ElegantInput
                                            label="MRP (₹)" id={`v_mrp_${index}`} name="mrp"
                                            value={variant.mrp} onChange={(e) => handleVariantChange(index, e)}
                                            type="number" required
                                        />
                                        <ElegantInput
                                            label="Selling Price (₹)" id={`v_sp_${index}`} name="sellingPrice"
                                            value={variant.sellingPrice} onChange={(e) => handleVariantChange(index, e)}
                                            type="number" required
                                        />
                                        {/* --- ADDED FIELDS --- */}
                                        <ElegantInput
                                            label="Barcode" id={`v_barcode_${index}`} name="barcode"
                                            value={variant.barcode} onChange={(e) => handleVariantChange(index, e)}
                                        />
                                        <ElegantInput
                                            label="Lead Time" id={`v_leadTime_${index}`} name="leadTime"
                                            value={variant.leadTime} onChange={(e) => handleVariantChange(index, e)}
                                            placeholder="e.g., 2 days"
                                        />
                                        <div>
                                            <label htmlFor={`v_status_${index}`} className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <select
                                                id={`v_status_${index}`} name="status"
                                                value={variant.status} onChange={(e) => handleVariantChange(index, e)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="outOfStock">Out of Stock</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <ElegantButton
                                type="button"
                                variant="secondary"
                                onClick={addVariant}
                                className="w-auto bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                            >
                                <Plus size={18} className="mr-2" />
                                Add Another Variant
                            </ElegantButton>
                        </div>
                    </FormCard>

                    {/* --- ADDED: Shipping Card --- */}
                    <FormCard title="Shipping & Compliance">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ElegantInput
                                label="Weight (grams)" id="ship_weight" name="weight"
                                value={productData.shippingDetails.weight} onChange={handleShippingChange}
                                type="number" placeholder="e.g., 500"
                            />
                            <ElegantInput
                                label="Length (cm)" id="ship_length" name="length"
                                value={productData.shippingDetails.length} onChange={handleShippingChange}
                                type="number" placeholder="e.g., 10"
                            />
                            <ElegantInput
                                label="Width (cm)" id="ship_width" name="width"
                                value={productData.shippingDetails.width} onChange={handleShippingChange}
                                type="number" placeholder="e.g., 8"
                            />
                            <ElegantInput
                                label="Height (cm)" id="ship_height" name="height"
                                value={productData.shippingDetails.height} onChange={handleShippingChange}
                                type="number" placeholder="e.g., 5"
                            />
                            <div>
                                <label htmlFor="ship_fragile" className="block text-sm font-medium text-gray-700 mb-1">Fragile?</label>
                                <select
                                    id="ship_fragile" name="fragile"
                                    value={productData.shippingDetails.fragile} onChange={handleShippingChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value={false}>No</option>
                                    <option value={true}>Yes</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="ship_perishable" className="block text-sm font-medium text-gray-700 mb-1">Perishable?</label>
                                <select
                                    id="ship_perishable" name="perishable"
                                    value={productData.shippingDetails.perishable} onChange={handleShippingChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value={false}>No</option>
                                    <option value={true}>Yes</option>
                                </select>
                            </div>
                        </div>
                    </FormCard>

                    {/* Attributes Card */}
                    <FormCard title="Attributes">
                        <p className="text-sm text-gray-500 mb-4 -mt-4">
                            These values are auto-filled from your selected category.
                        </p>
                        {/* --- UPDATED GRID --- */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ElegantInput
                                label="Return Policy" id="attr_return" name="returnPolicy"
                                value={productData.attributes.returnPolicy || ''}
                                onChange={handleAttributeChange}
                            />
                            <ElegantInput
                                label="Origin" id="attr_origin" name="origin"
                                value={productData.attributes.origin || ''}
                                onChange={handleAttributeChange}
                            />
                            {/* --- ADDED FIELDS --- */}
                            <ElegantInput
                                label="Manufacturer" id="attr_manufacturer" name="manufacturer"
                                value={productData.attributes.manufacturer || ''}
                                onChange={handleAttributeChange}
                            />
                            <ElegantInput
                                label="Customer Care" id="attr_care" name="customerCareInfo"
                                value={productData.attributes.customerCareInfo || ''}
                                onChange={handleAttributeChange}
                                placeholder="e.g., 1800-123-456"
                            />
                            <ElegantInput
                                label="FSSAI Number" id="attr_fssai" name="fssaiNumber"
                                value={productData.attributes.fssaiNumber || ''}
                                onChange={handleAttributeChange}
                            />
                            <ElegantInput
                                label="Expiry Date" id="attr_expiry" name="expiryDate"
                                value={productData.attributes.expiryDate || ''}
                                onChange={handleAttributeChange}
                                type="date"
                            />
                        </div>
                    </FormCard>

                </div>

                {/* --- Right Column (Settings) --- */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Organization Card */}
                    <FormCard title="Organization">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="categoryId" name="categoryId"
                                    value={productData.categoryId}
                                    onChange={handleCategoryChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    id="status" name="status"
                                    value={productData.status}
                                    onChange={handleProductChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                            <ElegantInput
                                label="Tax %" id="taxPercentage" name="taxPercentage"
                                value={productData.taxPercentage} onChange={handleProductChange}
                                type="number"
                            />
                            <ElegantInput
                                label="HSN Code" id="hsnCode" name="hsnCode"
                                value={productData.hsnCode} onChange={handleProductChange}
                            />
                            {/* --- ADDED tags --- */}
                            <ElegantInput
                                label="Tags (comma-separated)" id="tags" name="tags"
                                value={productData.tags} onChange={handleProductChange}
                                placeholder="e.g., butter, amul, dairy"
                            />
                        </div>
                    </FormCard>

                    {/* Images Card */}
                    <FormCard title="Product Images">
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <input
                                    type="file"
                                    id="imageUpload"
                                    accept="image/png, image/jpeg"
                                    multiple // <-- ADDED multiple
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                                <label htmlFor="imageUpload" className="cursor-pointer text-indigo-600 font-medium">
                                    Click to upload
                                    <span className="text-gray-500 block text-sm">(or drag and drop)</span>
                                </label>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {productData.images.map((imgObj, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                                        <img src={imgObj.preview} alt="product preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                        >
                                            &times;
                                        </button>
                                        {index === 0 && (
                                            <div className="absolute bottom-0 w-full bg-black bg-opacity-50 text-white text-xs text-center py-0.5">
                                                Primary
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FormCard>

                </div>
            </div>
        </form>
    );
};

export default ProductEditor;