import React, { useState, useEffect } from 'react';
// Import our new reusable components
import { FormInput, FormSelect, FormButton, FormSection, FormTitle, ElegantButton, ElegantInput } from '../Registration/FormComponents';
import BusinessInfoForm from '../Registration/BusinessInfoForm';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
import axios from "axios";
import MySVG from '../../assets/sellerlogin.svg'; // adjust path as needed
import { useNavigate } from 'react-router-dom';
import Step3Form from '../Registration/Step3Form';

// --- Constants ---
const API_BASE_URL = '/api/v1'; // Base URL for all API calls
const BUSINESS_TYPES = [
    'Proprietorship',
    'Private Ltd',
    'LLP',
    'Partnership',
    'Individual',
];
const STORE_TYPES = ['Warehouse', 'Retail', 'Dark Store'];


const DOC_TYPES = [
    'GST Certificate',
    'PAN Card',
    'FSSAI Licence',
    'Address Proof (Shop Act)',
    'Address Proof (Electricity Bill)',
    'Address Proof (Other)',
    'Additional Certificate',
];

const statusToStep = (status) => {
    switch (status) {
        case 'pending-email-verification': return 6; // OTP
        case 'pending-business-info': return 2;
        case 'pending-bank-details': return 3;
        case 'pending-documents': return 4;
        case 'pending-store-details': return 5;
        case 'pending-admin-approval': return 7; // Success
        case 'active': return 8; // Dashboard
        default: return 1;
    }
};

// --- Main App Component ---
export default function Register() {
    const [isLoggedIn, setIsLoggedIn] = useState(null); // null = checking, false = logged out, true = logged in
    const [authToken, setAuthToken] = useState(null);

    // --- Auth Flow State (for the Login/Register forms) ---
    const [authView, setAuthView] = useState('login');
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authFullName, setAuthFullName] = useState('');
    const [authMobile, setAuthMobile] = useState('');
    const [authOtp, setAuthOtp] = useState('');

    const [currentStep, setCurrentStep] = useState(1); // 1-5, 6 (OTP), 7 (Success)
    const [formData, setFormData] = useState({

        // Step 1
        fullName: '',
        email: '',
        mobileNumber: '',
        password: '',
        // Step 2
        businessName: '',
        legalName: '',
        businessType: BUSINESS_TYPES[0],
        gstNumber: '',
        panNumber: '',
        businessAddress: {
            addressLine1: '',
            city: '',
            state: '',
            pincode: '',
        },
        businessContact: '',
        businessEmail: '',
        // Step 3
        accountHolderName: '',
        bankName: '',
        branchName: '',
        accountNumber: '',
        ifscCode: '',
        cancelledCheque: null, // File object
        // Step 4
        documents: [
            // { docType: 'GST Certificate', file: null }
        ],
        // Step 5
        storeName: '',
        storeAddress: {
            addressLine1: '',
            city: '',
            state: '',
            pincode: '',
        },
        storeType: STORE_TYPES[0],
        storeTimings: { open: '09:00', close: '21:00' },
        fssaiLicenceNumber: '',
        storeContactNumber: '',
        coveredDeliveryAreas: '', // Will be split by comma
        storePhotos: [], // Array of File objects
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [otp, setOtp] = useState('');

    const navigate = useNavigate();

    // --- Check for existing token on load ---
    // --- Check for existing token on load ---
    useEffect(() => {
        const token = localStorage.getItem("token");
        const status = localStorage.getItem("sellerStatus");
        const details = JSON.parse(localStorage.getItem("sellerDetails") || "{}");

        if (token) {
            setAuthToken(token);
            setCurrentStep(statusToStep(status));
            setFormData(prev => ({ ...prev, ...details }));
            setIsLoggedIn(true);
        } else {
            // ----- THIS IS THE FIX -----
            // If no token, set logged in to false to stop the spinner
            setIsLoggedIn(false);
        }

        // We don't need setIsLoading(false) here,
        // because the spinner is controlled by isLoggedIn === null
    }, []);

    // --- Auth API Handlers (Login, Register, OTP) ---

    const handleLogin = async (e) => {
        e.preventDefault();
        const result = await makeApiCall('/api/auth/login/password', 'POST', {
            email: authEmail, password: authPassword,
        });
        if (result.success) {
            const { token, sellerStatus, sellerDetails } = result.data;
            localStorage.setItem("token", token);
            localStorage.setItem("sellerStatus", sellerStatus);
            localStorage.setItem("sellerDetails", JSON.stringify(sellerDetails));

            setAuthToken(token);
            setIsLoggedIn(true);

            // If active → skip steps → go to dashboard
            if (sellerStatus === "active") {
                console.log("🚀 Seller is active → Redirecting to /");
                navigate("/", { replace: true });
                return; // prevent further step logic
            }

            // Otherwise continue onboarding
            console.log("📝 Seller not active → going to steps");
            setFormData(prev => ({
                ...prev,
                ...sellerDetails,
                email: authEmail
            }));


            setCurrentStep(statusToStep(sellerStatus));
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const result = await makeApiCall('/api/auth/register', 'POST', {
            email: authEmail, password: authPassword, fullName: authFullName, mobileNumber: authMobile,
        });
        if (result.success) {
            setFormData(prev => ({ ...prev, email: authEmail, fullName: authFullName, mobileNumber: authMobile, password: authPassword }));
            setAuthView('otp');
            setError(null);
        }
    };

    const handleOtpVerify = async (e) => {
        e.preventDefault();
        const result = await makeApiCall('/api/auth/verify-email', 'POST', {
            email: authEmail, otp: authOtp,
        });
        if (result.success && result.data.token) {
            setAuthToken(result.data.token);
            setFormData(prev => ({ ...prev, email: authEmail })); // Set email in main form data
            setCurrentStep(statusToStep('pending-business-info'));
            setIsLoggedIn(true);
        }
    };

    const handleOtpLoginRequest = async () => {
        if (!authEmail) {
            setError('Please enter your email address first.');
            return;
        }
        const result = await makeApiCall('/api/auth/login/otp-request', 'POST', { email: authEmail });
        console.log("OTP Request Result:", result);
        if (result.success) {
            setAuthView('otp-login');
            setError(null);
        }
    };

    const handleOtpLoginVerify = async (e) => {
        e.preventDefault();
        const result = await makeApiCall('/api/auth/login/otp-verify', 'POST', {
            email: authEmail, otp: authOtp,
        });
        console.log("OTP Login Verify Result:", result);
        if (result.success) {
            const { token, sellerStatus, sellerDetails } = result.data;
            localStorage.setItem("token", token);
            localStorage.setItem("sellerStatus", sellerStatus);
            localStorage.setItem("sellerDetails", JSON.stringify(sellerDetails));

            setAuthToken(token);
            setFormData(prev => ({ ...prev, ...sellerDetails, email: authEmail })); // Pre-fill form
            setCurrentStep(statusToStep(sellerStatus));
            setIsLoggedIn(true);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("sellerStatus");
        localStorage.removeItem("sellerDetails");

        // In a real app, clear localStorage
        setAuthToken(null);
        setIsLoggedIn(false);
        setAuthEmail(formData.email || ''); // Keep email for easy re-login
        setAuthPassword('');
        setAuthView('login');
        setCurrentStep(1);
        setError(null);
    }

    // Simulates a Cloudinary file upload
    const fakeCloudinaryUpload = (file) => {
        console.log(`[Simulating Upload]... ${file.name}`);
        setError(null);
        return new Promise((resolve) => {
            setTimeout(() => {
                const fileUrl = `https://res.cloudinary.com/fake-cloud/image/upload/v12345/${file.name}`;
                console.log(`[Simulating Upload]... Success: ${fileUrl}`);
                resolve({
                    success: true,
                    fileUrl: fileUrl,
                    fileName: file.name,
                });
            }, 1000); // 1 second delay
        });
    };

    // Generic API request handler
    const makeApiCall = async (endpoint, method, body, token) => {
        setIsLoading(true);
        setError(null);
        try {
            const isFormData = body instanceof FormData;

            const config = {
                method,
                url: `${API_URL}${endpoint}`,
                headers: {},
                data: body,
            };

            // Only set JSON header if not sending FormData
            if (!isFormData) {
                config.headers["Content-Type"] = "application/json";
            }

            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await axios(config);

            return { success: true, data: response.data };
        } catch (err) {
            console.error("API Call Failed:", err);

            const message =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Something went wrong.";

            setError(message);
            return { success: false, message };
        } finally {
            setIsLoading(false);
        }
    };

    // --- Event Handlers ---

    // Handle all simple text/select inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle nested address inputs
    const handleAddressChange = (e, addressType) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [addressType]: {
                ...prev[addressType],
                [name]: value,
            },
        }));
    };

    // Handle file inputs (single file)
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files[0]) {
            setFormData((prev) => ({ ...prev, [name]: files[0] }));
        }
    };

    // Handle multi-doc uploads
    const handleAddDocument = () => {
        setFormData((prev) => ({
            ...prev,
            documents: [
                ...prev.documents,
                { docType: DOC_TYPES[0], file: null, id: Date.now() },
            ],
        }));
    };

    const handleDocChange = (index, e) => {
        const { name, value, files } = e.target;
        const newDocs = [...formData.documents];
        if (name === 'docType') {
            newDocs[index].docType = value;
        }
        if (name === 'file' && files[0]) {
            newDocs[index].file = files[0];
        }
        setFormData((prev) => ({ ...prev, documents: newDocs }));
    };

    const removeDoc = (id) => {
        setFormData((prev) => ({
            ...prev,
            documents: prev.documents.filter((doc) => doc.id !== id),
        }));
    };

    // Handle multi-photo uploads
    const handleStorePhotosChange = (e) => {
        if (e.target.files.length) {
            setFormData((prev) => ({
                ...prev,
                storePhotos: [...prev.storePhotos, ...Array.from(e.target.files)],
            }));
        }
    };

    const removeStorePhoto = (index) => {
        setFormData((prev) => ({
            ...prev,
            storePhotos: prev.storePhotos.filter((_, i) => i !== index),
        }));
    };

    // --- API Handlers ---

    // Step 2: Business Info
    const handleBusinessInfo = async (e) => {
        e.preventDefault();
        const body = {
            businessName: formData.businessName,
            legalName: formData.legalName,
            businessType: formData.businessType,
            gstNumber: formData.gstNumber,
            panNumber: formData.panNumber,
            businessAddress: formData.businessAddress,
            businessContact: formData.businessContact,
            businessEmail: formData.businessEmail,
        };
        const result = await makeApiCall('/api/auth/business-info', 'PUT', body, authToken);
        if (result.success) {
            setCurrentStep(3); // Move to Step 3
        }
    };

    // Step 3: Bank Details
    const handleBankDetails = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Manually set loading for upload

        // 🟢 1. Create FormData for file + text fields
        const body = new FormData();
        body.append("accountHolderName", formData.accountHolderName);
        body.append("bankName", formData.bankName);
        body.append("branchName", formData.branchName);
        body.append("accountNumber", formData.accountNumber);
        body.append("ifscCode", formData.ifscCode);
        body.append("cancelledCheque", formData.cancelledCheque);

        // 🟢 2. Call your existing API helper (axios-based)
        const result = await makeApiCall('/api/auth/bank-details', 'PUT', body, authToken);
        if (result.success) {
            setCurrentStep(4); // Move to Step 4
        }
        // makeApiCall will set isLoading(false)
    };

    // Step 4: Documents
    // const handleDocuments = async (e) => {
    //     e.preventDefault();
    //     setIsLoading(true);

    //     // 1. Upload all documents
    //     const uploadedDocs = [];
    //     try {
    //         for (const doc of formData.documents) {
    //             if (doc.file) {
    //                 const uploadResult = await fakeCloudinaryUpload(doc.file);
    //                 if (uploadResult.success) {
    //                     uploadedDocs.push({
    //                         docType: doc.docType,
    //                         fileUrl: uploadResult.fileUrl,
    //                         fileName: uploadResult.fileName,
    //                     });
    //                 } else {
    //                     throw new Error(`Failed to upload ${doc.file.name}`);
    //                 }
    //             }
    //         }
    //     } catch (err) {
    //         setError(err.message);
    //         setIsLoading(false);
    //         return;
    //     }

    //     // 2. Send data to API
    //     const body = { documents: uploadedDocs };
    //     const result = await makeApiCall('/api/auth/documents', 'PUT', body, authToken);
    //     if (result.success) {
    //         setCurrentStep(5); // Move to Step 5
    //     }
    //     // makeApiCall will set isLoading(false)
    // };

    const handleDocuments = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Prepare FormData for direct upload to backend
            const formDataToSend = new FormData();

            const fieldMap = {
                "GST Certificate": "gstCertificate",
                "PAN Card": "panCard",
                "FSSAI Licence": "fssaiLicence",
                "Address Proof": "addressProof",
                "Additional Certificate": "additionalCertificate"
            };

            formData.documents.forEach((doc) => {
                const fieldName = fieldMap[doc.docType];
                if (doc.file && fieldName) {
                    formDataToSend.append(fieldName, doc.file);
                }
            });

            // Send to backend using makeApiCall
            const result = await makeApiCall(
                '/api/auth/documents',
                'PUT',
                formDataToSend,
                authToken,
                true // <-- flag to indicate FormData (no JSON headers)
            );

            if (result.success) {
                setCurrentStep(5); // Move to Step 5
            } else {
                throw new Error(result.message || 'Failed to upload documents.');
            }
        } catch (err) {
            console.error('Document Upload Error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };


    // Step 5: Store Details
    const handleStoreDetails = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // 1. Upload all store photos
        const uploadedPhotos = [];
        try {
            for (const photo of formData.storePhotos) {
                const uploadResult = await fakeCloudinaryUpload(photo);
                if (uploadResult.success) {
                    uploadedPhotos.push(uploadResult.fileUrl);
                } else {
                    throw new Error(`Failed to upload ${photo.name}`);
                }
            }
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            return;
        }

        // 2. Send data to API
        const body = {
            storeName: formData.storeName,
            storeAddress: formData.storeAddress,
            storeType: formData.storeType,
            storeTimings: formData.storeTimings,
            fssaiLicenceNumber: formData.fssaiLicenceNumber,
            storeContactNumber: formData.storeContactNumber,
            coveredDeliveryAreas: formData.coveredDeliveryAreas.split(',').map(p => p.trim()),
            storePhotos: uploadedPhotos,
        };

        const result = await makeApiCall('/api/auth/store-details', 'PUT', body, authToken);
        if (result.success) {
            setCurrentStep(7); // All done! Move to Success page
        }
        // makeApiCall will set isLoading(false)
    };

    // --- Render Functions ---

    const renderAuth = () => (
        <div className="w-full min-h-screen flex">
            {/* --- Left Side (Brand Panel) --- */}
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 p-12 flex-col justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">
                        Ozonemart
                    </h2>
                    <p className="text-indigo-200 mt-2">Seller Panel</p>
                </div>

                {/* SVG Image (centered) */}
                <div className="flex justify-center items-center flex-1">
                    <img src={MySVG} alt="Business Illustration" className="w-3/4 max-w-md" />
                </div>

                <div>
                    <h3 className="text-4xl font-bold text-white">
                        Grow your business.
                    </h3>
                    <p className="text-indigo-100 mt-4 text-lg max-w-md">
                        Join thousands of sellers reaching millions of customers, all with
                        our simple, powerful panel.
                    </p>
                </div>
            </div>

            {/* --- Right Side (Form Panel) --- */}
            <div className="w-full lg:w-1/2 bg-white min-h-screen flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md">
                    {error && (
                        <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                            <span className="font-bold">Error:</span> {error}
                        </div>
                    )}

                    {/* --- LOGIN VIEW --- */}
                    {authView === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <h2 className="text-3xl font-bold text-gray-900">Welcome back.</h2>
                            <p className="text-gray-600">Login to your Seller Panel.</p>

                            <ElegantInput
                                id="login_email" label="Email Address" name="email" type="email"
                                value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                                required placeholder="rahulsharma@gmail.com"
                            />
                            <ElegantInput
                                id="login_password" label="Password" name="password" type="password"
                                value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
                                required placeholder="••••••••"
                            />
                            <FormButton type="submit" isLoading={isLoading}>Login</FormButton>

                            <div className="flex justify-between items-center text-sm">
                                <button type="button" onClick={handleOtpLoginRequest} className="font-medium text-indigo-600 hover:text-indigo-500">
                                    Login with OTP instead
                                </button>
                                {/* <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                    Forgot password?
                                </a> */}
                            </div>
                            <div className="text-center text-gray-600">
                                Don't have an account?{' '}
                                <button typeD="button" onClick={() => { setAuthView('register'); setError(null); }} className="font-medium text-indigo-600 hover:text-indigo-500">
                                    Sign Up
                                </button>
                            </div>
                        </form>
                    )}

                    {/* --- REGISTER VIEW --- */}
                    {authView === 'register' && (
                        <form onSubmit={handleRegister} className="space-y-6">
                            <h2 className="text-3xl font-bold text-gray-900">Create your Seller Account.</h2>
                            <p className="text-gray-600">Join us and grow your business.</p>

                            <ElegantInput
                                id="reg_fullname" label="Full Name" name="fullName"
                                value={authFullName} onChange={(e) => setAuthFullName(e.target.value)}
                                required placeholder="Rahul Sharma"
                            />
                            <ElegantInput
                                id="reg_email" label="Email Address" name="email" type="email"
                                value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                                required placeholder="seller@bhaikidukan.com"
                            />
                            <ElegantInput
                                id="reg_mobile" label="Mobile Number" name="mobile"
                                value={authMobile} onChange={(e) => setAuthMobile(e.target.value)}
                                required placeholder="9876543210"
                            />
                            <ElegantInput
                                id="reg_password" label="Password" name="password" type="password"
                                value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
                                required placeholder="••••••••"
                            />
                            <FormButton type="submit" isLoading={isLoading}>Create Account</FormButton>

                            <div className="text-center text-gray-600">
                                Already have an account?{' '}
                                <button type="button" onClick={() => { setAuthView('login'); setError(null); }} className="font-medium text-indigo-600 hover:text-indigo-500">
                                    Login
                                </button>
                            </div>
                        </form>
                    )}

                    {/* --- OTP VIEW (for Registration) --- */}
                    {authView === 'otp' && (
                        <form onSubmit={handleOtpVerify} className="space-y-6">
                            <h2 className="text-3xl font-bold text-gray-900">Check your email.</h2>
                            <p className="text-gray-600">We sent a 6-digit code to <span className="font-medium text-gray-800">{authEmail}</span>.</p>
                            <ElegantInput
                                id="otp_code" label="Enter 6-Digit OTP" name="otp"
                                value={authOtp} onChange={(e) => setAuthOtp(e.target.value)}
                                required placeholder="123456" maxLength={6}
                            />
                            <ElegantButton type="submit" isLoading={isLoading}>Verify Email</ElegantButton>

                            {/* <div className="text-center text-gray-600">
                                Didn't get a code?{' '}
                                <button
                                    type="button"
                                    onClick={() => { }} // Add resend logic here
                                    className="font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    Back to Login
                                </button>
                            </div> */}

                            <div className="text-center text-gray-600">
                                Want to login instead?{' '}
                                <a
                                    type="button"
                                    href='/login'
                                    className="font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    Back to Login
                                </a>
                            </div>
                        </form>
                    )}

                    {/* --- OTP VIEW (for Login) --- */}
                    {authView === 'otp-login' && (
                        <form onSubmit={handleOtpLoginVerify} className="space-y-6">
                            <h2 className="text-3xl font-bold text-gray-900">Check your email.</h2>
                            <p className="text-gray-600">We sent a 6-digit login code to <span className="font-medium text-gray-800">{authEmail}</span>.</p>
                            <ElegantInput
                                id="otp_login_code" label="Enter 6-Digit OTP" name="otp"
                                value={authOtp} onChange={(e) => setAuthOtp(e.target.value)}
                                required placeholder="123456" maxLength={6}
                            />
                            <ElegantButton type="submit" isLoading={isLoading}>Verify & Login</ElegantButton>

                            <div className="text-center text-gray-600">
                                <button
                                    type="button"
                                    onClick={() => { setAuthView('login'); setError(null); }}
                                    className="font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    Back to Password Login
                                </button>
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );

    /**
     * @desc    Renders the 5-STEP REGISTRATION WIZARD
     */
    const renderRegistrationStepper = () => (
        <div className="bg-slate-100 min-h-screen p-4 md:p-8 font-sans">

            {/* --- Elegant Header --- */}
            <header className="max-w-6xl mx-auto mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-indigo-600">
                    Ozonemart
                    <span className="text-gray-800 font-medium"> / Seller Setup</span>
                </h1>
                <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-gray-600 hover:text-red-500"
                >
                    Logout
                </button>
            </header>

            {/* --- New Stepper --- */}
            <Stepper currentStep={currentStep} />

            {/* --- Form Content Area --- */}
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    {isLoading && <LoadingSpinner />}

                    <div className={`p-6 md:p-10 ${isLoading ? 'opacity-50' : ''}`}>
                        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
                        {renderStep()}
                    </div>
                </div>
            </div>
        </div>
    );

    /**
     * @desc    Renders the correct form based on currentStep
     */
    const renderStep = () => {
        switch (currentStep) {
            // Note: Step 1 (Personal) is handled by the 'register' auth view
            case 2:
                return (
                    <form onSubmit={handleBusinessInfo}>
                        <FormTitle
                            title="Step 2: Business Information"
                            subtitle="Tell us about your business."
                        />
                        {/* This is our reusable component! */}
                        <BusinessInfoForm
                            data={formData}
                            handleChange={handleChange}
                            handleAddressChange={handleAddressChange}
                        />
                        <div className="mt-10">
                            <FormButton type="submit" isLoading={isLoading}>Save & Continue to Step 3</FormButton>
                        </div>
                    </form>
                );
            case 3:
                return (
                    <Step3Form
                        data={formData}
                        handleChange={handleChange}
                        handleFileChange={handleFileChange}
                        onSubmit={handleBankDetails}
                        isLoading={isLoading}
                    />
                );
            case 4:
                return (
                    <Step4Form
                        data={formData}
                        docs={formData.documents}
                        handleAddDocument={handleAddDocument}
                        handleDocChange={handleDocChange}
                        removeDoc={removeDoc}
                        onSubmit={handleDocuments}
                        isLoading={isLoading}
                    />
                );
            case 5:
                return (
                    <Step5Form
                        data={formData}
                        handleChange={handleChange}
                        handleAddressChange={handleAddressChange}
                        handleStorePhotosChange={handleStorePhotosChange}
                        removeStorePhoto={removeStorePhoto}
                        onSubmit={handleStoreDetails}
                        isLoading={isLoading}
                    />
                );
            case 6: // This is the OTP step after registration
                return (
                    <OtpForm
                        otp={authOtp}
                        setOtp={setAuthOtp}
                        onSubmit={handleOtpVerify}
                        email={formData.email}
                        isLoading={isLoading}
                    />
                );
            case 7:
                return <SuccessPage />;
            default:
                // This case handles 'active' (8) or any other status
                // In a real app, this would be a <Dashboard /> component
                return (
                    <div className="text-center py-10">
                        <h2 className="text-3xl font-bold text-gray-800">Welcome to your Dashboard!</h2>
                        <p className="text-lg text-gray-600 mt-3">Your account is fully active and ready to go.</p>
                        <div className="mt-6">
                            <FormButton
                                onClick={() => navigate('/')}
                                variant="primary"
                            >
                                Go to Dashboard
                            </FormButton>
                        </div>
                    </div>
                );
        }
    };


    // --- Main Return ---

    if (isLoggedIn === null) {
        // Global loading spinner while checking auth
        return (
            <div className="min-h-screen flex items-center justify-center">
                <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    // If logged in, show the 5-step wizard.
    // If not, show the new, elegant auth page.
    return isLoggedIn ? renderRegistrationStepper() : renderAuth();
}

// --- Stepper Component ---
const Stepper = ({ currentStep }) => {
    const steps = [
        { num: 1, label: 'Personal' },
        { num: 2, label: 'Business' },
        { num: 3, label: 'Bank' },
        { num: 4, label: 'Documents' },
        { num: 5, label: 'Store' },
    ];

    let activeStep = currentStep;
    if (currentStep === 6) activeStep = 1; // OTP is part of Step 1
    if (currentStep >= 7) activeStep = 6; // Success/Dashboard is after Step 5

    return (
        <div className="max-w-4xl mx-auto mb-8 px-4">
            <div className="flex items-center">
                {steps.map((step, index) => (
                    <React.Fragment key={step.num}>
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
                  ${step.num < activeStep ? 'bg-green-600 text-white' : ''}
                  ${step.num === activeStep ? 'bg-indigo-600 text-white ring-4 ring-indigo-200' : ''}
                  ${step.num > activeStep ? 'bg-gray-200 text-gray-500' : ''}
                `}
                            >
                                {step.num < activeStep ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    step.num
                                )}
                            </div>
                            <p className={`mt-2 text-xs font-medium text-center
                ${step.num <= activeStep ? 'text-indigo-600' : 'text-gray-500'}
              `}>
                                {step.label}
                            </p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-1 mx-2
                ${step.num < activeStep ? 'bg-green-600' : 'bg-gray-200'}
              `} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};


const LoadingSpinner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const ErrorMessage = ({ message, onDismiss }) => (
    <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded-md flex justify-between items-center">
        <div>
            <span className="font-bold">Error:</span> {message}
        </div>
        <button onClick={onDismiss} className="font-bold text-lg">&times;</button>
    </div>
);

// --- Form Components for Steps 3, 4, 5, OTP, Success ---

// --- Step 6: OTP (for registration) ---
const OtpForm = ({ otp, setOtp, onSubmit, email, isLoading }) => (
    <form onSubmit={onSubmit}>
        <FormTitle
            title="Verify Your Email"
            subtitle={`We've sent a 6-digit OTP to ${email}.`}
        />
        <div className="max-w-sm mx-auto">
            <FormSection>
                <div className="md:col-span-3">
                    <FormInput
                        id="otp"
                        label="Enter OTP"
                        name="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        placeholder="123456"
                        maxLength={6}
                    />
                </div>
            </FormSection>
            <div className="mt-10">
                <FormButton type="submit" isLoading={isLoading}>Verify & Continue</FormButton>
            </div>
        </div>
    </form>
);

// --- Step 3: Bank ---
// const Step3Form = ({ data, handleChange, handleFileChange, onSubmit, isLoading }) => (
//     <form onSubmit={onSubmit}>
//         <FormTitle
//             title="Step 3: Bank Details"
//             subtitle="Where we'll send your payments."
//         />
//         <FormSection>
//             <div className="md:col-span-2">
//                 <FormInput
//                     id="accountHolderName" label="Account Holder Name" name="accountHolderName"
//                     value={data.accountHolderName} onChange={handleChange} required
//                 />
//             </div>
//             <FormInput
//                 id="bankName" label="Bank Name" name="bankName"
//                 value={data.bankName} onChange={handleChange} required
//             />
//             <FormInput
//                 id="branchName" label="Branch Name" name="branchName"
//                 value={data.branchName} onChange={handleChange} required
//             />
//             <FormInput
//                 id="accountNumber" label="Account Number" name="accountNumber"
//                 value={data.accountNumber} onChange={handleChange} required
//             />
//             <FormInput
//                 id="ifscCode" label="IFSC Code" name="ifscCode"
//                 value={data.ifscCode} onChange={handleChange} required
//             />
//             <div className="md:col-span-3">
//                 <label htmlFor="cancelledCheque" className="block text-sm font-medium text-gray-700 mb-1">
//                     Upload Cancelled Cheque <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                     id="cancelledCheque" name="cancelledCheque" type="file"
//                     onChange={handleFileChange} required
//                     accept="image/png, image/jpeg, application/pdf"
//                     className="w-full text-sm text-gray-500
//             file:mr-4 file:py-2 file:px-4
//             file:rounded-md file:border-0
//             file:font-semibold file:bg-indigo-50 file:text-indigo-700
//             hover:file:bg-indigo-100"
//                 />
//                 {data.cancelledCheque && <p className="text-sm text-gray-600 mt-2">Selected: {data.cancelledCheque.name}</p>}
//             </div>
//         </FormSection>
//         <div className="mt-10">
//             <FormButton type="submit" isLoading={isLoading}>Save & Continue to Step 4</FormButton>
//         </div>
//     </form>
// );

// --- Step 4: Documents ---
const Step4Form = ({ docs, handleAddDocument, handleDocChange, removeDoc, onSubmit, isLoading }) => (
    <form onSubmit={onSubmit}>
        <FormTitle
            title="Step 4: Business Documents"
            subtitle="Upload required documents for verification."
        />
        <div className="space-y-6">
            {docs.map((doc, index) => (
                <div key={doc.id} className="p-4 border rounded-lg shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="md:col-span-2">
                            <FormSelect
                                id={`docType-${index}`} label="Document Type" name="docType"
                                value={doc.docType} onChange={(e) => handleDocChange(index, e)}
                            >
                                {DOC_TYPES.map((type) => (<option key={type} value={type}>{type}</option>))}
                            </FormSelect>
                        </div>
                        <div className="md:col-span-3">
                            <label htmlFor={`file-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                                Upload File <span className="text-red-500">*</span>
                            </label>
                            <input
                                id={`file-${index}`} name="file" type="file"
                                onChange={(e) => handleDocChange(index, e)} required
                                accept="image/png, image/jpeg, application/pdf"
                                className="w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:font-semibold file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="button" onClick={() => removeDoc(doc.id)}
                                className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 h-11 w-full"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                        {doc.file && <p className="text-sm text-gray-600 md:col-span-6">Selected: {doc.file.name}</p>}
                    </div>
                </div>
            ))}
            <button
                type="button"
                onClick={handleAddDocument}
                className="w-full font-semibold py-3 px-6 rounded-lg shadow-sm border-2 border-dashed border-indigo-400 text-indigo-600 hover:bg-indigo-50 transition"
            >
                + Add Another Document
            </button>
        </div>
        <div className="mt-10">
            <FormButton type="submit" isLoading={isLoading}>Save & Continue to Step 5</FormButton>
        </div>
    </form>
);

// --- Step 5: Store ---
const Step5Form = ({ data, handleChange, handleAddressChange, handleStorePhotosChange, removeStorePhoto, onSubmit, isLoading }) => (
    <form onSubmit={onSubmit}>
        <FormTitle
            title="Step 5: Store Details"
            subtitle="Finally, tell us about your store."
        />

        <FormSection title="Store Information">
            <div className="md:col-span-2">
                <FormInput
                    id="storeName" label="Store Name" name="storeName"
                    value={data.storeName} onChange={handleChange} required
                />
            </div>
            <FormSelect
                id="storeType" label="Store Type" name="storeType"
                value={data.storeType} onChange={handleChange}
            >
                {STORE_TYPES.map((type) => (<option key={type} value={type}>{type}</option>))}
            </FormSelect>
            <FormInput
                id="storeContactNumber" label="Store Contact Number" name="storeContactNumber"
                value={data.storeContactNumber} onChange={handleChange} required
            />
            <div className="md:col-span-2">
                <FormInput
                    id="fssaiLicenceNumber" label="FSSAI Licence Number (if applicable)" name="fssaiLicenceNumber"
                    value={data.fssaiLicenceNumber} onChange={handleChange}
                />
            </div>
        </FormSection>

        <FormSection title="Store Timings" cols={2}>
            <FormInput
                id="open" label="Opening Time" name="open" type="time"
                value={data.storeTimings.open}
                onChange={(e) => setFormData(prev => ({ ...prev, storeTimings: { ...prev.storeTimings, open: e.target.value } }))}
            />
            <FormInput
                id="close" label="Closing Time" name="close" type="time"
                value={data.storeTimings.close}
                onChange={(e) => setFormData(prev => ({ ...prev, storeTimings: { ...prev.storeTimings, close: e.target.value } }))}
            />
        </FormSection>

        <FormSection title="Store Address">
            <div className="md:col-span-3">
                <FormInput
                    id="store_addressLine1" label="Address Line 1" name="addressLine1"
                    value={data.storeAddress.addressLine1}
                    onChange={(e) => handleAddressChange(e, 'storeAddress')} required
                />
            </div>
            <FormInput
                id="store_city" label="City" name="city"
                value={data.storeAddress.city}
                onChange={(e) => handleAddressChange(e, 'storeAddress')} required
            />
            <FormInput
                id="store_state" label="State" name="state"
                value={data.storeAddress.state}
                onChange={(e) => handleAddressChange(e, 'storeAddress')} required
            />
            <FormInput
                id="store_pincode" label="Pincode" name="pincode"
                value={data.storeAddress.pincode}
                onChange={(e) => handleAddressChange(e, 'storeAddress')} required
            />
        </FormSection>

        <FormSection title="Operations">
            <div className="md:col-span-3">
                <FormInput
                    id="coveredDeliveryAreas" label="Delivery Pincodes (comma-separated)" name="coveredDeliveryAreas"
                    value={data.coveredDeliveryAreas} onChange={handleChange}
                    placeholder="e.g. 400001, 400002, 400028"
                />
            </div>
            <div className="md:col-span-3">
                <label htmlFor="storePhotos" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Store Photos (Optional)
                </label>
                <input
                    id="storePhotos" name="storePhotos" type="file"
                    onChange={handleStorePhotosChange}
                    accept="image/png, image/jpeg"
                    multiple
                    className="w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:font-semibold file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                    {data.storePhotos.map((photo, index) => (
                        <div key={index} className="relative p-1 bg-gray-100 rounded">
                            <span className="text-xs">{photo.name}</span>
                            <button
                                type="button"
                                onClick={() => removeStorePhoto(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs font-bold"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </FormSection>

        <div className="mt-10">
            <FormButton type="submit" isLoading={isLoading}>Finish Setup</FormButton>
        </div>
    </form>
);

// --- Step 7: Success ---
const SuccessPage = () => {
    const handleDashboard = () => {
        navigate('/')
    }

    return (
        <div className="text-center py-10">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mt-6">Setup Complete!</h2>
            <p className="text-lg text-gray-600 mt-3">
                Your application has been submitted for approval. We will notify you
                via email once your account is active.
            </p>
            <div className="mt-8">
                <FormButton onClick={() => handleDashboard()} variant="secondary">Go to Dashboard</FormButton>
            </div>
        </div>
    )
};