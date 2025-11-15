import React from 'react'

const Step3Form = ({ data, handleChange, handleFileChange, onSubmit, isLoading }) => {
    return (
        <>
            <form onSubmit={onSubmit}>
                <FormTitle
                    title="Step 3: Bank Details"
                    subtitle="Where we'll send your payments."
                />
                <FormSection>
                    <div className="md:col-span-2">
                        <FormInput
                            id="accountHolderName" label="Account Holder Name" name="accountHolderName"
                            value={data.accountHolderName} onChange={handleChange} required
                        />
                    </div>
                    <FormInput
                        id="bankName" label="Bank Name" name="bankName"
                        value={data.bankName} onChange={handleChange} required
                    />
                    <FormInput
                        id="branchName" label="Branch Name" name="branchName"
                        value={data.branchName} onChange={handleChange} required
                    />
                    <FormInput
                        id="accountNumber" label="Account Number" name="accountNumber"
                        value={data.accountNumber} onChange={handleChange} required
                    />
                    <FormInput
                        id="ifscCode" label="IFSC Code" name="ifscCode"
                        value={data.ifscCode} onChange={handleChange} required
                    />
                    <div className="md:col-span-3">
                        <label htmlFor="cancelledCheque" className="block text-sm font-medium text-gray-700 mb-1">
                            Upload Cancelled Cheque <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="cancelledCheque" name="cancelledCheque" type="file"
                            onChange={handleFileChange} required
                            accept="image/png, image/jpeg, application/pdf"
                            className="w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:font-semibold file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100"
                        />
                        {data.cancelledCheque && <p className="text-sm text-gray-600 mt-2">Selected: {data.cancelledCheque.name}</p>}
                    </div>
                </FormSection>
                <div className="mt-10">
                    <FormButton type="submit" isLoading={isLoading}>Save & Continue to Step 4</FormButton>
                </div>
            </form>
        </>
    )
}

export default Step3Form
