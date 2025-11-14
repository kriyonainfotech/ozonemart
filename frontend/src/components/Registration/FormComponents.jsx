import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// --- Form Components (Input, Select, Button) ---

export const FormInput = ({ id, label, type, ...props }) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";

    return (
        <div className="relative">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>

            <div className="relative">
                <input
                    id={id}
                    type={isPassword && showPassword ? "text" : type}
                    {...props}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
        </div>
    );
};

export const FormSelect = ({ id, label, children, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <select
            id={id}
            {...props}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            {children}
        </select>
    </div>
);

export const FormButton = ({ children, ...props }) => (
    <button
        {...props}
        className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
    >
        {children}
    </button>
);

export const FormSection = ({ children }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{children}</div>
);

export const FormTitle = ({ title, subtitle }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-500 mt-1">{subtitle}</p>
    </div>
);

export const ElegantInput = ({ id, label, name, type = 'text', value, onChange, required = false, placeholder = '', disabled = false, className = '' }) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";

    return (
        <div className="relative">
            <label
                htmlFor={id}
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>

            <div className="relative">
                <input
                    id={id}
                    name={name}
                    type={isPassword && showPassword ? "text" : type}
                    value={value}
                    onChange={onChange}
                    required={required}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[0.5] focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out pr-10 ${className} ${disabled ? "bg-gray-100" : ""
                        }`}
                />

                {/* 👁️ Toggle Eye Icon */}
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOff size={20} strokeWidth={1.75} />
                        ) : (
                            <Eye size={20} strokeWidth={1.75} />
                        )}
                    </button>
                )}
            </div>
        </div>
    );

}

export const ElegantButton = ({
    type = 'submit',
    children,
    onClick,
    variant = 'primary',
    disabled = false,
    isLoading = false
}) => {
    const baseStyle =
        "min-w-[140px] font-bold py-2 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out flex items-center justify-center";

    const styles = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    };

    const disabledStyle = 'bg-gray-400 cursor-not-allowed';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`${baseStyle} ${disabled || isLoading ? disabledStyle : styles[variant]}`}
        >
            {isLoading ? (
                <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            ) : (
                children
            )}
        </button>
    );
};

