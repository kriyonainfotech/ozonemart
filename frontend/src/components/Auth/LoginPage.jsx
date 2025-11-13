import React, { useState } from 'react';
// import { FormInput, FormButton, FormSection, FormTitle } from './FormComponents.jsx';

// --- Reusable Form Components ---
// (Moved here to fix the import error)

/**
 * @desc    A standardized styled <input> component
 */
export const FormInput = ({ id, label, name, type = 'text', value, onChange, required = false, placeholder = '', disabled = false, className = '' }) => (
    <div className="w-full">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-danger-500">*</span>}
        </label>
        <input
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${className} ${disabled ? 'bg-gray-100' : ''}`}
        />
    </div>
);

/**
 * @desc    A standardized styled <button> component
 */
export const FormButton = ({ type = 'submit', children, onClick, variant = 'primary', disabled = false }) => {
    const baseStyle = "w-full font-bold py-3 px-6 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out";

    const styles = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
        secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500',
        danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500',
    };

    const disabledStyle = 'bg-gray-400 cursor-not-allowed';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${disabled ? disabledStyle : styles[variant]}`}
        >
            {children}
        </button>
    );
};

/**
 * @desc    A standardized title component for forms
 */
export const FormTitle = ({ title, subtitle }) => (
    <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            {title}
        </h2>
        <p className="text-gray-600 mt-2">
            {subtitle}
        </p>
    </div>
);

/**
 * @desc    A layout wrapper for form sections
 */
export const FormSection = ({ children }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
        {children}
    </div>
);

/**
 * @desc    A dedicated login page component.
 * Handles UI for password login, OTP login request, and OTP verification.
 * @props   email             - The email value from the main app state
 * @props   setEmail          - Handler to update the email in the main app state
 * @props   onPasswordLogin   - Function to call for password login
 * @props   onOtpLoginRequest - Function to call to request an OTP
 * @props   onOtpLoginVerify  - Function to call to verify the OTP
 * @props   onToggleView      - Function to switch back to registration view
 */
const LoginPage = ({
    email,
    setEmail,
    onPasswordLogin,
    onOtpLoginRequest,
    onOtpLoginVerify,
    onToggleView,
}) => {
    // 'password' -> Show password field
    // 'otp-request' -> Show only email and "Send OTP" button
    // 'otp-verify' -> Show email, OTP field, and "Verify OTP" button
    const [loginMode, setLoginMode] = useState('password');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        onPasswordLogin(email, password);
    };

    const handleOtpRequest = async (e) => {
        e.preventDefault();
        const success = await onOtpLoginRequest(email);
        if (success) {
            setLoginMode('otp-verify'); // Move to OTP entry
        }
    };

    const handleOtpVerify = (e) => {
        e.preventDefault();
        onOtpLoginVerify(email, otp);
    };

    // Helper to switch mode and clear fields
    const toggleLoginMode = (mode) => {
        setLoginMode(mode);
        setPassword('');
        setOtp('');
    };

    return (
        <div>
            <FormTitle
                title="Login to Your Seller Account"
                subtitle="Welcome back, bhai."
            />

            {/* --- Login Mode Toggle Buttons --- */}
            <div className="flex mb-6 rounded-md shadow-sm">
                <button
                    type="button"
                    onClick={() => toggleLoginMode('password')}
                    className={`w-1/2 p-3 rounded-l-md font-medium focus:outline-none ${loginMode === 'password'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Login with Password
                </button>
                <button
                    type="button"
                    onClick={() => toggleLoginMode('otp-request')}
                    className={`w-1/2 p-3 rounded-r-md font-medium focus:outline-none ${loginMode !== 'password'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Login with OTP
                </button>
            </div>

            {/* --- Password Login Form --- */}
            {loginMode === 'password' && (
                <form onSubmit={handlePasswordSubmit}>
                    <FormSection>
                        <div className="md:col-span-3">
                            <FormInput
                                id="login_email"
                                label="Email Address"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.targe.value)}
                                required
                                placeholder="seller@bhaikidukan.com"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <FormInput
                                id="login_password"
                                label="Password"
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                    </FormSection>
                    <div className="mt-10">
                        <FormButton type="submit">Login</FormButton>
                    </div>
                </form>
            )}

            {/* --- OTP Request Form --- */}
            {loginMode === 'otp-request' && (
                <form onSubmit={handleOtpRequest}>
                    <FormSection>
                        <div className="md:col-span-3">
                            <FormInput
                                id="login_email_otp"
                                label="Email Address"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="seller@bhaikidukan.com"
                            />
                        </div>
                        <p className="text-sm text-gray-500 md:col-span-3">
                            We will send a 6-digit one-time password to your email.
                        </p>
                    </FormSection>
                    <div className="mt-10">
                        <FormButton type="submit">Send OTP</FormButton>
                    </div>
                </form>
            )}

            {/* --- OTP Verify Form --- */}
            {loginMode === 'otp-verify' && (
                <form onSubmit={handleOtpVerify}>
                    <FormSection>
                        <div className="md:col-span-3">
                            <FormInput
                                id="login_email_verify"
                                label="Email Address"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled
                                className="bg-gray-100"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <FormInput
                                id="login_otp"
                                label="Enter 6-Digit OTP"
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
                        <FormButton type="submit">Verify OTP & Login</FormButton>
                    </div>
                </form>
            )}

            {/* --- Toggle back to Register --- */}
            <div className="text-center mt-6">
                <button
                    type="button"
                    onClick={onToggleView}
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                    Need to create an account? Register
                </button>
            </div>
        </div>
    );
};

export default LoginPage;