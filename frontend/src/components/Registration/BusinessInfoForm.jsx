import React from 'react';
import { FormInput, FormSelect, FormSection } from './FormComponents.jsx';

// --- Constants ---
const BUSINESS_TYPES = [
    'Proprietorship',
    'Private Ltd',
    'LLP',
    'Partnership',
    'Individual',
];

/**
 * Reusable component for Step 2: Business Information.
 * This is a "dumb" component that just takes data and handlers as props.
 * It does NOT include the <form> tag or submit button.
 */
const BusinessInfoForm = ({ data, handleChange, handleAddressChange }) => (
    <div className="space-y-8">
        <FormSection>
            <div className="md:col-span-2">
                <FormInput
                    id="businessName"
                    label="Business Name"
                    name="businessName"
                    value={data.businessName}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="md:col-span-1">
                <FormSelect
                    id="businessType"
                    label="Business Type"
                    name="businessType"
                    value={data.businessType}
                    onChange={handleChange}
                    required
                >
                    {BUSINESS_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </FormSelect>
            </div>
            <div className="md:col-span-3">
                <FormInput
                    id="legalName"
                    label="Legal Name of Business"
                    name="legalName"
                    value={data.legalName}
                    onChange={handleChange}
                    required
                />
            </div>
            <FormInput
                id="gstNumber"
                label="GST Number"
                name="gstNumber"
                value={data.gstNumber}
                onChange={handleChange}
                required
            />
            <FormInput
                id="panNumber"
                label="PAN Number"
                name="panNumber"
                value={data.panNumber}
                onChange={handleChange}
                required
            />
        </FormSection>

        <h3 className="text-lg font-medium text-gray-900 border-t pt-6">Business Address</h3>
        <FormSection>
            <div className="md:col-span-3">
                <FormInput
                    id="ba_addressLine1"
                    label="Address Line 1"
                    name="addressLine1"
                    value={data.businessAddress.addressLine1}
                    onChange={(e) => handleAddressChange(e, 'businessAddress')}
                    required
                />
            </div>
            <FormInput
                id="ba_city"
                label="City"
                name="city"
                value={data.businessAddress.city}
                onChange={(e) => handleAddressChange(e, 'businessAddress')}
                required
            />
            <FormInput
                id="ba_state"
                label="State"
                name="state"
                value={data.businessAddress.state}
                onChange={(e) => handleAddressChange(e, 'businessAddress')}
                required
            />
            <FormInput
                id="ba_pincode"
                label="Pincode"
                name="pincode"
                value={data.businessAddress.pincode}
                onChange={(e) => handleAddressChange(e, 'businessAddress')}
                required
            />
        </FormSection>

        <h3 className="text-lg font-medium text-gray-900 border-t pt-6">Business Contact</h3>
        <FormSection>
            <FormInput
                id="businessContact"
                label="Business Contact Number"
                name="businessContact"
                value={data.businessContact}
                onChange={handleChange}
                required
            />
            <FormInput
                id="businessEmail"
                label="Business Email"
                name="businessEmail"
                type="email"
                value={data.businessEmail}
                onChange={handleChange}
                required
            />
        </FormSection>
    </div>
);

export default BusinessInfoForm;