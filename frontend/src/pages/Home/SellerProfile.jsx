import React, { useState, useEffect } from 'react';
import { User, Building, Banknote, Store, FileText, Edit, X, Check, AlertCircle } from 'lucide-react';
import { ElegantButton, ElegantInput, FormSelect } from '../../components/Registration/FormComponents';
import BusinessInfoForm from '../../components/Registration/BusinessInfoForm';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// --- Dummy Data (from your API response) ---
const dummySellerData = {
    "success": true,
    "seller": {
        "businessInfo": {
            "businessName": "Sharma Traders",
            "legalName": "Sharma Traders Pvt. Ltd.",
            "businessType": "Proprietorship",
            "gstNumber": "27ABCDE1234F1Z5",
            "panNumber": "ABCDE1234F",
            "businessAddress": {
                "addressLine1": "123, MG Road",
                "addressLine2": null,
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001"
            },
            "businessContact": "02212345678",
            "businessEmail": "contact@sharmatraders.com"
        },
        "bankDetails": {
            "accountHolderName": "Rahul Sharma",
            "bankName": "HDFC Bank",
            "branchName": "Andheri East",
            "accountNumber": "123456789012",
            "ifscCode": "HDFC0001234",
            "cancelledChequeUrl": "https://placehold.co/600x400/eeeeee/999999?text=Cheque",
            "verificationStatus": "pending"
        },
        "storeDetails": {
            "storeTimings": { "open": "09:00", "close": "21:00" },
            "storeName": "Sharma Shops",
            "storeAddress": {
                "addressLine1": "Sikshapatri Heights, Kosad",
                "city": "Surat",
                "state": "Gujarat",
                "pincode": "394107"
            },
            "storeType": "Retail",
            "fssaiLicenceNumber": "12345678901234",
            "storeContactNumber": "07778854551",
            "storePhotos": [
                "https://placehold.co/600x400/eeeeee/999999?text=Store+Photo"
            ]
        },
        "_id": "69156bdbbcaad6577617919e",
        "fullName": "Kirtan Narola",
        "email": "prarthanavaghani@gmail.com",
        "mobileNumber": "9601475737",
        "status": "active",
        "documents": [
            { "_id": "doc1", "docType": "GST Certificate", "fileUrl": "#", "verificationStatus": "pending" },
            { "_id": "doc2", "docType": "PAN Card", "fileUrl": "#", "verificationStatus": "pending" },
            { "_id": "doc3", "docType": "FSSAI Licence", "fileUrl": "#", "verificationStatus": "verified" }
        ]
    }
};
const STORE_TYPES = ['Warehouse', 'Retail', 'Dark Store'];

const TABS = [
    { name: 'personal', label: 'Personal Details', icon: User },
    { name: 'business', label: 'Business Info', icon: Building },
    { name: 'bank', label: 'Bank Details', icon: Banknote },
    { name: 'store', label: 'Store Details', icon: Store },
    { name: 'documents', label: 'Documents', icon: FileText },
];

/**
 * @desc    The main Seller Profile page.
 * Routed to /profile
 */
const SellerProfile = () => {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false); // For save buttons
    const [sellerData, setSellerData] = useState(null);
    const [activeTab, setActiveTab] = useState('personal');

    // --- State to control "Edit" mode for each section ---
    const [isEditing, setIsEditing] = useState({
        personal: false,
        business: false,
        bank: false,
        store: false,
    });

    useEffect(() => {
        const fetchSellerData = async () => {
            try {
                setIsLoading(true);

                const token = localStorage.getItem("token");
                console.log("Retrieved token:", token);
                if (!token) {
                    console.warn("⚠️ No token found!");
                    return;
                }

                console.log("🔍 Fetching seller data from backend...");

                //  ⭐ YOU FORGOT AWAIT HERE ⭐
                const res = await axios.post(
                    `${API_URL}/api/auth/get-user`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                console.log("✅ API Response:", res.data);

                if (res.data?.success) {
                    const seller = res.data.seller;

                    // Add file field
                    seller.bankDetails.cancelledCheque = null;

                    setSellerData(seller);
                } else {
                    console.error("❌ API returned success=false", res.data);
                }

            } catch (error) {
                console.error("🔥 Error fetching seller:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSellerData();
    }, []);

    // --- GENERIC HANDLERS ---
    const handleEditToggle = (section) => {
        setIsEditing(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleFileChange = (e, section) => {
        const { name, files } = e.target;
        if (!files[0]) return;

        const file = files[0];
        const previewUrl = URL.createObjectURL(file);

        setSellerData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [name]: file,
                [`${name}Preview`]: previewUrl // ⭐ ADD PREVIEW
            }
        }));
    };


    // Handles nested businessInfo changes
    const handleBusinessChange = (e) => {
        const { name, value } = e.target;
        setSellerData(prev => ({
            ...prev,
            businessInfo: { ...prev.businessInfo, [name]: value }
        }));
    };

    // Handles nested businessInfo.businessAddress changes
    const handleBusinessAddressChange = (e, addressType) => {
        const { name, value } = e.target;
        setSellerData(prev => ({
            ...prev,
            businessInfo: {
                ...prev.businessInfo,
                businessAddress: { ...prev.businessInfo.businessAddress, [name]: value }
            }
        }));
    };

    // Handles nested bankDetails changes
    const handleBankChange = (e) => {
        const { name, value } = e.target;
        setSellerData(prev => ({
            ...prev,
            bankDetails: { ...prev.bankDetails, [name]: value }
        }));
    };



    // Handles nested storeDetails changes
    const handleStoreChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        // --- THIS IS THE FIX ---
        // Removed extra curly braces
        setSellerData(prev => ({
            ...prev,
            storeDetails: { ...prev.storeDetails, [name]: val }
        }));
    };

    // Handles nested storeDetails.storeAddress changes
    const handleStoreAddressChange = (e, addressType) => {
        const { name, value } = e.target;
        setSellerData(prev => ({
            ...prev,
            storeDetails: {
                ...prev.storeDetails,
                storeAddress: { ...prev.storeDetails.storeAddress, [name]: value }
            }
        }));
    };

    const token = localStorage.getItem("token");
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    // --- API SUBMIT HANDLERS ---
    // (We'll just simulate these for now)

    const handlePersonalUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const body = {
                fullName: sellerData.fullName,
                mobileNumber: sellerData.mobileNumber,
                alternateContact: sellerData.alternateContact
            };

            const res = await axios.put(
                `${API_URL}/api/profile/personal`,
                body,
                config
            );

            console.log("Personal Update API:", res.data);

            if (res.data.success) {
                setIsEditing(prev => ({ ...prev, personal: false }));
            }
        } catch (err) {
            console.error("Personal Update Error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleBusinessUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const body = sellerData.businessInfo;

            const res = await axios.put(
                `${API_URL}/api/profile/business`,
                body,
                config
            );

            console.log("Business Update API:", res.data);

            if (res.data.success) {
                setIsEditing(prev => ({ ...prev, business: false }));
            }
        } catch (err) {
            console.error("Business Update Error:", err);
        } finally {
            setIsSaving(false);
        }
    };


    const handleBankDetailsUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const body = new FormData();
            body.append("accountHolderName", sellerData.bankDetails.accountHolderName);
            body.append("bankName", sellerData.bankDetails.bankName);
            body.append("branchName", sellerData.bankDetails.branchName);
            body.append("accountNumber", sellerData.bankDetails.accountNumber);
            body.append("ifscCode", sellerData.bankDetails.ifscCode);

            if (sellerData.bankDetails.cancelledCheque) {
                body.append("cancelledCheque", sellerData.bankDetails.cancelledCheque);
            }

            const res = await axios.put(
                `${API_URL}/api/profile/bank`,
                body,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    }
                }
            );

            console.log("Bank Update:", res.data);

            if (res.data.success) {
                setIsEditing(prev => ({ ...prev, bank: false }));
            }
        } catch (err) {
            console.error("Bank Update Error:", err);
        } finally {
            setIsSaving(false);
        }
    };


    const handleStoreUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const body = sellerData.storeDetails;

            const res = await axios.put(
                `${API_URL}/api/profile/store-details`,
                body,
                config
            );

            console.log("Store Update API:", res.data);

            if (res.data.success) {
                setIsEditing(prev => ({ ...prev, store: false }));
            }
        } catch (err) {
            console.error("Store Update Error:", err);
        } finally {
            setIsSaving(false);
        }
    };


    if (isLoading) {
        return (
            <div className="text-center p-12">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading Profile...</p>
            </div>
        );
    }

    if (!sellerData) {
        return <div className="p-4 text-center text-red-600">Could not load seller data.</div>;
    }

    return (
        <div className="font-sans">
            {/* --- Page Header --- */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
                <p className="text-gray-500">View and manage your account details.</p>
            </div>

            {/* --- Tab Navigation --- */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {TABS.map(tab => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`flex items-center gap-2 px-1 py-4 border-b-2 text-sm font-medium ${activeTab === tab.name
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <tab.icon size={18} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* --- Tab Content --- */}
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">

                {/* Personal Details */}
                {activeTab === 'personal' && (
                    <TabContent
                        title="Personal Details"
                        onEditToggle={() => handleEditToggle('personal')}
                        isEditing={isEditing.personal}
                        onSubmit={handlePersonalUpdate}
                        isLoading={isSaving}
                    >
                        {isEditing.personal ? (
                            // --- THIS IS THE FIX ---
                            // We are now rendering the form component
                            <PersonalDetailsForm
                                data={sellerData}
                                onChange={handlePersonalChange}
                            />
                        ) : (
                            <DisplaySection>
                                <DisplayItem label="Full Name" value={sellerData.fullName} />
                                <DisplayItem label="Email" value={sellerData.email} />
                                <DisplayItem label="Mobile Number" value={sellerData.mobileNumber} />
                            </DisplaySection>
                        )}
                    </TabContent>
                )}

                {/* Business Info */}
                {activeTab === 'business' && (
                    <TabContent
                        title="Business Information"
                        onEditToggle={() => handleEditToggle('business')}
                        isEditing={isEditing.business}
                        onSubmit={handleBusinessUpdate}
                        isLoading={isSaving}
                    >
                        {isEditing.business ? (
                            <div className='p-6'>
                                <BusinessInfoForm
                                    data={sellerData.businessInfo}
                                    handleChange={handleBusinessChange}
                                    handleAddressChange={handleBusinessAddressChange}
                                />
                            </div>
                        ) : (
                            <DisplaySection>
                                <DisplayItem label="Business Name" value={sellerData.businessInfo.businessName} />
                                <DisplayItem label="Legal Name" value={sellerData.businessInfo.legalName} />
                                <DisplayItem label="Business Type" value={sellerData.businessInfo.businessType} />
                                <DisplayItem label="GST Number" value={sellerData.businessInfo.gstNumber} />
                                <DisplayItem label="PAN Number" value={sellerData.businessInfo.panNumber} />
                                <DisplayItem label="Business Contact" value={sellerData.businessInfo.businessContact} />
                                <DisplayItem label="Business Email" value={sellerData.businessInfo.businessEmail} />
                                <DisplayItem label="Business Address" value={`${sellerData.businessInfo.businessAddress.addressLine1}, ${sellerData.businessInfo.businessAddress.city}, ${sellerData.businessInfo.businessAddress.state} - ${sellerData.businessInfo.businessAddress.pincode}`} />
                            </DisplaySection>
                        )}
                    </TabContent>
                )}

                {/* Bank Details */}
                {activeTab === 'bank' && (
                    <TabContent
                        title="Bank Details"
                        onEditToggle={() => handleEditToggle('bank')}
                        isEditing={isEditing.bank}
                        onSubmit={handleBankDetailsUpdate}
                        isLoading={isSaving}
                    >
                        {isEditing.bank ? (
                            <BankDetailsForm
                                data={sellerData.bankDetails}
                                handleChange={handleBankChange}
                                handleFileChange={(e) => handleFileChange(e, 'bankDetails')}
                            />
                        ) : (
                            <DisplaySection>
                                <DisplayItem label="Account Holder" value={sellerData.bankDetails.accountHolderName} />
                                <DisplayItem label="Bank Name" value={sellerData.bankDetails.bankName} />
                                <DisplayItem label="Branch Name" value={sellerData.bankDetails.branchName} />
                                <DisplayItem label="Account Number" value={sellerData.bankDetails.accountNumber} />
                                <DisplayItem label="IFSC Code" value={sellerData.bankDetails.ifscCode} />
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Cancelled Cheque</h4>

                                    {sellerData.bankDetails.cancelledChequePreview ? (
                                        <img
                                            src={sellerData.bankDetails.cancelledChequePreview}
                                            alt="Preview"
                                            className="mt-2 w-48 h-auto border rounded"
                                        />
                                    ) : sellerData.bankDetails.cancelledChequeUrl ? (
                                        <img
                                            src={sellerData.bankDetails.cancelledChequeUrl}
                                            alt="Cancelled Cheque"
                                            className="mt-2 w-48 h-auto border rounded"
                                        />
                                    ) : null}
                                </div>

                            </DisplaySection>
                        )}
                    </TabContent>
                )}

                {/* Store Details */}
                {activeTab === 'store' && (
                    <TabContent
                        title="Store Details"
                        onEditToggle={() => handleEditToggle('store')}
                        isEditing={isEditing.store}
                        onSubmit={handleStoreUpdate}
                        isLoading={isSaving}
                    >
                        {isEditing.store ? (
                            <StoreDetailsForm
                                data={sellerData.storeDetails}
                                handleChange={handleStoreChange}
                                handleAddressChange={handleStoreAddressChange}
                            // We'll skip file uploads for now to keep it simple
                            />
                        ) : (
                            <DisplaySection>
                                <DisplayItem label="Store Name" value={sellerData.storeDetails.storeName} />
                                <DisplayItem label="Store Type" value={sellerData.storeDetails.storeType} />
                                <DisplayItem label="Store Contact" value={sellerData.storeDetails.storeContactNumber} />
                                <DisplayItem label="FSSAI Number" value={sellerData.storeDetails.fssaiLicenceNumber} />
                                <DisplayItem label="Store Timings" value={`${sellerData.storeDetails.storeTimings.open} - ${sellerData.storeDetails.storeTimings.close}`} />
                                <DisplayItem label="Store Address" value={`${sellerData.storeDetails.storeAddress.addressLine1}, ${sellerData.storeDetails.storeAddress.city}, ${sellerData.storeDetails.storeAddress.state} - ${sellerData.storeDetails.storeAddress.pincode}`} />
                            </DisplaySection>
                        )}
                    </TabContent>
                )}

                {/* Documents */}
                {activeTab === 'documents' && (
                    <TabContent title="My Documents" showEditButton={false}>
                        <div className="p-6 space-y-4">
                            {sellerData.documents.map((doc, index) => (
                                <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <FileText size={20} className="text-indigo-600" />
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{doc.docType}</h3>

                                            {/* Show preview if image */}
                                            {doc.fileUrl.match(/\.(jpeg|jpg|png)$/i) ? (
                                                <img
                                                    src={doc.fileUrl}
                                                    alt={doc.docType}
                                                    className="mt-1 w-32 h-auto border rounded"
                                                />
                                            ) : null}

                                            {/* Link to view document */}
                                            {/* <a
                                                href={doc.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-indigo-600 hover:underline mt-1 block"
                                            >
                                                View Document
                                            </a> */}
                                        </div>
                                    </div>

                                    {/* Verification badge */}
                                    {/* <VerificationBadge status={doc.verificationStatus} /> */}
                                </div>
                            ))}
                        </div>
                    </TabContent>
                )}
            </div>
        </div>
    );
};


// --- Helper Components (Defined *OUTSIDE* main component to prevent re-renders) ---

// Wrapper for Tab Content (Card)
const TabContent = ({ title, children, isEditing, onEditToggle, showEditButton = true, onSubmit, isLoading }) => (
    <form onSubmit={onSubmit}>
        <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            {showEditButton && (
                <ElegantButton
                    type="button"
                    onClick={onEditToggle}
                    className={`w-auto ${isEditing ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : ''}`}
                >
                    {isEditing ? (
                        <> <X size={18} className="mr-2" /> Cancel </>
                    ) : (
                        <> <Edit size={18} className="mr-2" /> Edit </>
                    )}
                </ElegantButton>
            )}
        </div>

        {/* Render children (either DisplaySection or Form) */}
        {children}

        {isEditing && (
            <div className="bg-gray-50 p-4 flex justify-end">
                <ElegantButton type="submit" isLoading={isLoading} className="w-auto">
                    <Check size={18} className="mr-2" />
                    Save Changes
                </ElegantButton>
            </div>
        )}
    </form>
);

// Read-only grid
const DisplaySection = ({ children }) => (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-4">
        {children}
    </div>
);

// Read-only item
const DisplayItem = ({ label, value, isStatus = false }) => (
    <div>
        <h4 className="text-sm font-medium text-gray-500">{label}</h4>
        {isStatus ? (
            <VerificationBadge status={value} />
        ) : (
            <p className="text-base text-gray-800 font-semibold">{value || '---'}</p>
        )}
    </div>
);

// Verification Status Badge
const VerificationBadge = ({ status }) => {
    let colorClasses = '';
    let Icon = AlertCircle;
    switch (status) {
        case 'verified':
            colorClasses = 'bg-green-100 text-green-800';
            Icon = Check;
            break;
        case 'pending':
            colorClasses = 'bg-yellow-100 text-yellow-800';
            break;
        case 'rejected':
            colorClasses = 'bg-red-100 text-red-800';
            break;
        default:
            colorClasses = 'bg-gray-100 text-gray-800';
    }
    return (
        <span className={`px-3 py-1 inline-flex items-center gap-1 text-sm leading-5 font-semibold rounded-full ${colorClasses}`}>
            <Icon size={14} />
            {status}
        </span>
    );
};

// --- NEW: Reusable Forms for Editing ---

const PersonalDetailsForm = ({ data, onChange }) => (
    <div className="p-6 space-y-4">
        <ElegantInput
            label="Full Name" id="fullName" name="fullName"
            value={data.fullName} onChange={onChange}
        />
        <ElegantInput
            label="Email" id="email" name="email"
            value={data.email} onChange={onChange}
            disabled // Don't allow email editing
        />
        <ElegantInput
            label="Mobile Number" id="mobileNumber" name="mobileNumber"
            value={data.mobileNumber} onChange={onChange}
        />
    </div>
);

const BankDetailsForm = ({ data, handleChange, handleFileChange }) => (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <ElegantInput
            label="Account Holder Name" id="accountHolderName" name="accountHolderName"
            value={data.accountHolderName} onChange={handleChange} required
        />
        <ElegantInput
            label="Bank Name" id="bankName" name="bankName"
            value={data.bankName} onChange={handleChange} required
        />
        <ElegantInput
            label="Branch Name" id="branchName" name="branchName"
            value={data.branchName} onChange={handleChange} required
        />
        <ElegantInput
            label="Account Number" id="accountNumber" name="accountNumber"
            value={data.accountNumber} onChange={handleChange} required
        />
        <ElegantInput
            label="IFSC Code" id="ifscCode" name="ifscCode"
            value={data.ifscCode} onChange={handleChange} required
        />
        <div className="md:col-span-2">
            <label htmlFor="cancelledCheque" className="block text-sm font-medium text-gray-700 mb-1">
                Upload New Cancelled Cheque
            </label>
            <input
                id="cancelledCheque" name="cancelledCheque" type="file"
                onChange={handleFileChange}
                accept="image/png, image/jpeg, application/pdf"
                className="w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:font-semibold file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
            />
            {data.cancelledCheque && <p className="text-sm text-gray-600 mt-2">New file selected: {data.cancelledCheque.name}</p>}
        </div>
    </div>
);

const StoreDetailsForm = ({ data, handleChange, handleAddressChange }) => (
    <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ElegantInput
                label="Store Name" id="storeName" name="storeName"
                value={data.storeName} onChange={handleChange} required
            />
            <FormSelect
                id="storeType" label="Store Type" name="storeType"
                value={data.storeType} onChange={handleChange}
            >
                {STORE_TYPES.map((type) => (<option key={type} value={type}>{type}</option>))}
            </FormSelect>
            <ElegantInput
                label="Store Contact Number" id="storeContactNumber" name="storeContactNumber"
                value={data.storeContactNumber} onChange={handleChange} required
            />
            <ElegantInput
                label="FSSAI Number" id="fssaiLicenceNumber" name="fssaiLicenceNumber"
                value={data.fssaiLicenceNumber} onChange={handleChange}
            />
            <ElegantInput
                label="Opening Time" id="open" name="open" type="time"
                value={data.storeTimings.open}
                onChange={(e) => handleChange({ target: { name: 'storeTimings', value: { ...data.storeTimings, open: e.target.value } } })}
            />
            <ElegantInput
                label="Closing Time" id="close" name="close" type="time"
                value={data.storeTimings.close}
                onChange={(e) => handleChange({ target: { name: 'storeTimings', value: { ...data.storeTimings, close: e.target.value } } })}
            />
        </div>

        {/* Address Sub-section */}
        <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Store Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <ElegantInput
                        label="Address Line 1" id="store_addressLine1" name="addressLine1"
                        value={data.storeAddress.addressLine1}
                        onChange={(e) => handleAddressChange(e, 'storeAddress')} required
                    />
                </div>
                <ElegantInput
                    label="City" id="store_city" name="city"
                    value={data.storeAddress.city}
                    onChange={(e) => handleAddressChange(e, 'storeAddress')} required
                />
                <ElegantInput
                    label="State" id="store_state" name="state"
                    value={data.storeAddress.state}
                    onChange={(e) => handleAddressChange(e, 'storeAddress')} required
                />
                <ElegantInput
                    label="Pincode" id="store_pincode" name="pincode"
                    value={data.storeAddress.pincode}
                    onChange={(e) => handleAddressChange(e, 'storeAddress')} required
                />
            </div>
        </div>
    </div>
);

export default SellerProfile;