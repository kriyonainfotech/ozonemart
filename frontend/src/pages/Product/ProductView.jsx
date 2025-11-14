import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// --- Dummy Data (for simulation) ---
// This includes the "Parent" product and "Child" variants
const dummyFullProduct = {
    product: {
        "_id": "6916f03aa943e6a8d3aaf755",
        "category": { "_id": "6916c2ae68dd2b8b8013b564", "name": "Electronics" },
        "title": "Amul Butter",
        "brand": "Amul",
        "description": "Pure and fresh butter from the house of Amul. Made with fresh cream. An essential ingredient for a rich and creamy taste in various dishes. Enjoy the delicious taste of Amul butter spread on toast, parathas, or in your baking.",
        "images": [
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDnk2H8CGJpBv-KubncCLsNnUh7cHvTQONXw&s",
            "https://static.wixstatic.com/media/c78d0e_0efbbb2cc3944b16b054bd728d88863b~mv2.jpeg/v1/fill/w_568,h_378,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/c78d0e_0efbbb2cc3944b16b054bd728d88863b~mv2.jpeg"
        ],
        "attributes": {
            "fssaiNumber": "1234567890",
            "origin": "India",
            "manufacturer": "Amul Pvt Ltd",
            "returnPolicy": "7 days return",
            "customerCareInfo": "1800-111-222"
        },
        "shippingDetails": { "weight": 200, "length": 10, "width": 8, "height": 5, "perishable": true },
        "taxPercentage": 12,
        "hsnCode": "0405",
        "status": "published",
    },
    variants: [
        { _id: "variant1", name: "200g", sku: "AMUL-BTR-200G", mrp: 140, sellingPrice: 135, stock: 50, status: "active", discount: 4 },
        { _id: "variant2", name: "500g", sku: "AMUL-BTR-500G", mrp: 285, sellingPrice: 260, stock: 120, status: "active", discount: 9 },
        { _id: "variant3", name: "100g", sku: "AMUL-BTR-100G", mrp: 70, sellingPrice: 70, stock: 0, status: "outOfStock", discount: 0 },
    ]
};


/**
 * @desc    A read-only page to view all details of a product.
 * Routed to /products/view/:id
 */
const ProductView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);

    // --- Data Loading ---
    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${API_URL}/api/product/get/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.data.success) {
                    const { product, variants } = res.data;
                    setProduct({
                        ...product,
                        tags: product.tags || [],
                        images: product.images || [],
                        attributes: product.attributes || {},
                        shippingDetails: product.shippingDetails || {},
                    });
                    setVariants(variants || []);
                } else {
                    alert("Product not found");
                }
            } catch (err) {
                console.error("Error fetching product:", err);
                alert("Failed to fetch product details.");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);


    if (isLoading) {
        return (
            <div className="text-center p-12">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading Product Details...</p>
            </div>
        );
    }

    if (!product) {
        return <div className="p-4 text-center text-red-600">Product not found.</div>;
    }

    return (
        <div className="font-sans">
            {/* --- Page Header --- */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/products')}
                        className="p-2 rounded-full hover:bg-gray-200"
                        title="Back to products"
                    >
                        <ArrowLeft size={20} className="text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{product.title}</h1>
                        <span className="text-gray-500">{product.brand}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* --- Left Column (Main Details) --- */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Product Info */}
                    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Product Details</h2>
                            <p className="text-gray-600 leading-relaxed">{product.description}</p>
                            <p className="text-gray-500 mt-2 italic">{product.shortDescription}</p>

                            <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-4">Attributes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DetailItem label="FSSAI Number" value={product.attributes?.fssaiNumber} />
                                <DetailItem label="Origin" value={product.attributes?.origin} />
                                <DetailItem label="Manufacturer" value={product.attributes?.manufacturer} />
                                <DetailItem label="Return Policy" value={product.attributes?.returnPolicy} />
                                <DetailItem label="Customer Care" value={product.attributes?.customerCareInfo} />
                            </div>

                            <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-4">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.tags?.map((tag, i) => (
                                    <span key={i} className="px-2 py-1 bg-gray-200 rounded text-sm">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Variants */}
                    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-6">Variants</h2>
                            {variants.map(v => (
                                <div key={v._id} className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-6 gap-4 items-center mb-2">
                                    <DetailItem label="Name" value={v.name} />
                                    <DetailItem label="SKU" value={v.sku} />
                                    <DetailItem label="Barcode" value={v.barcode} />
                                    <DetailItem label="MRP" value={`₹${v.mrp}`} />
                                    <DetailItem label="Selling Price" value={`₹${v.sellingPrice}`} />
                                    <DetailItem label="Discount" value={`${v.discount || 0}%`} />
                                    <DetailItem label="Stock" value={v.stock} />
                                    <DetailItem label="Lead Time" value={v.leadTime} />
                                    <DetailItem label="Status" value={v.status} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- Right Column (Images & Settings) --- */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Images */}
                    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-6">Images</h2>
                            <div className="grid grid-cols-2 gap-2">
                                {product.images?.map((url, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                                        <img src={url} alt={`product ${index + 1}`} className="w-full h-full object-cover" />
                                        {index === 0 && (
                                            <span className="absolute bottom-0 left-0 bg-black/50 text-white text-xs px-2 py-0.5 rounded-tr-lg">
                                                Primary
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Organization */}
                    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                        <div className="p-6 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Organization</h2>
                            <DetailItem label="Category" value={product.category?.name} />
                            <DetailItem label="Status" value={product.status} />
                            <DetailItem label="Tax Percentage" value={`${product.taxPercentage}%`} />
                            <DetailItem label="HSN Code" value={product.hsnCode} />
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                        <div className="p-6 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Shipping</h2>
                            <DetailItem label="Weight" value={`${product.shippingDetails?.weight || 0} g`} />
                            <DetailItem label="Dimensions" value={`${product.shippingDetails?.length || 0} x ${product.shippingDetails?.width || 0} x ${product.shippingDetails?.height || 0} cm`} />
                            <DetailItem label="Fragile" value={product.shippingDetails?.fragile ? 'Yes' : 'No'} />
                            <DetailItem label="Perishable" value={product.shippingDetails?.perishable ? 'Yes' : 'No'} />
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

// Helper components for the View page
const DetailItem = ({ label, value, isStatus = false }) => (
    <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</h4>
        {isStatus ? (
            <span className={`px-2 py-0.5 inline-flex text-sm leading-5 font-semibold rounded-full capitalize ${value === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                {value}
            </span>
        ) : (
            <p className="text-base text-gray-800 font-semibold">{value || '---'}</p>
        )}
    </div>
);

export default ProductView;