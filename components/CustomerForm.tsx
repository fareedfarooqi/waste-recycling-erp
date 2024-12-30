'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/config/supabaseClient';

const CustomerForm: React.FC = () => {
    const router = useRouter();

    const [companyName, setCompanyName] = useState('');
    const [contactDetails, setContactDetails] = useState({
        email: '',
        phone: '',
        address: '',
    });
    const [locations, setLocations] = useState([
        { locationName: '', address: '', initialEmptyBins: '' },
    ]);
    const [defaultProductTypes, setDefaultProductTypes] = useState([
        { productName: '', description: '' },
    ]);

    // Add or Remove Locations and Product Types
    const handleAddLocation = () => {
        setLocations([
            ...locations,
            { locationName: '', address: '', initialEmptyBins: '' },
        ]);
    };

    const handleRemoveLocation = (index: number) => {
        setLocations(locations.filter((_, i) => i !== index));
    };

    const handleAddProductType = () => {
        setDefaultProductTypes([
            ...defaultProductTypes,
            { productName: '', description: '' },
        ]);
    };

    const handleRemoveProductType = (index: number) => {
        setDefaultProductTypes(
            defaultProductTypes.filter((_, i) => i !== index)
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Use this for future. This is how to serialise.
        const customerData = {
            company_name: companyName,
            contact_details: contactDetails,
            locations: locations.map((location) => ({
                location_name: location.locationName,
                address: location.address,
                initial_empty_bins:
                    parseInt(location.initialEmptyBins, 10) || 0,
            })),
            default_product_types: defaultProductTypes.map((product) => ({
                product_name: product.productName,
                description: product.description,
            })),
        };

        try {
            const { data, error } = await supabase
                .from('customers')
                .insert([customerData]);

            if (error) {
                console.error('Error inserting customer:', error.message);
                alert('Failed to add customer. Please try again.');
                return;
            }

            alert('Customer added successfully!');
            router.push('/customers');
        } catch (err) {
            console.error('Unexpected error:', err);
            alert('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <div className="flex justify-center items-start">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-8 -mt-2 overflow-auto max-h-[95vh]">
                <div className="text-center border-b pb-6 mb-6">
                    <h1 className="text-3xl font-bold text-green-600">
                        Add Customer
                    </h1>
                    <p className="text-gray-500">
                        Fill out the form to add a new customer
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <h2 className="text-lg font-bold text-gray-700 mb-4">
                            Company Information
                        </h2>
                        <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Company Name{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter company name"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-700 mb-4">
                            Contact Details
                        </h2>
                        <div className="bg-gray-50 p-6 rounded-lg shadow-inner grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Email{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={contactDetails.email}
                                    onChange={(e) =>
                                        setContactDetails({
                                            ...contactDetails,
                                            email: e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter email"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Phone{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={contactDetails.phone}
                                    onChange={(e) =>
                                        setContactDetails({
                                            ...contactDetails,
                                            phone: e.target.value,
                                        })
                                    }
                                    className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter phone number"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Address{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={contactDetails.address}
                                    onChange={(e) =>
                                        setContactDetails({
                                            ...contactDetails,
                                            address: e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter address"
                                    rows={3}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-700 mb-4">
                            Locations
                        </h2>
                        <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                            {locations.map((location, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-4"
                                >
                                    <input
                                        type="text"
                                        placeholder="Location Name"
                                        value={location.locationName}
                                        onChange={(e) =>
                                            setLocations(
                                                locations.map((loc, i) =>
                                                    i === index
                                                        ? {
                                                              ...loc,
                                                              locationName:
                                                                  e.target
                                                                      .value,
                                                          }
                                                        : loc
                                                )
                                            )
                                        }
                                        className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Location Address"
                                        value={location.address}
                                        onChange={(e) =>
                                            setLocations(
                                                locations.map((loc, i) =>
                                                    i === index
                                                        ? {
                                                              ...loc,
                                                              address:
                                                                  e.target
                                                                      .value,
                                                          }
                                                        : loc
                                                )
                                            )
                                        }
                                        className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Initial empty bins"
                                        value={location.initialEmptyBins}
                                        onChange={(e) =>
                                            setLocations(
                                                locations.map((loc, i) =>
                                                    i === index
                                                        ? {
                                                              ...loc,
                                                              initialEmptyBins:
                                                                  e.target
                                                                      .value,
                                                          }
                                                        : loc
                                                )
                                            )
                                        }
                                        className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRemoveLocation(index)
                                        }
                                        className={`${
                                            locations.length > 1
                                                ? 'block'
                                                : 'hidden'
                                        } bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:ring focus:ring-red-300`}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddLocation}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:ring focus:ring-blue-300"
                            >
                                Add Location
                            </button>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-700 mb-4">
                            Default Product Types
                        </h2>
                        <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                            {defaultProductTypes.map((product, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-4"
                                >
                                    <input
                                        type="text"
                                        placeholder="Product Name"
                                        value={product.productName}
                                        onChange={(e) =>
                                            setDefaultProductTypes(
                                                defaultProductTypes.map(
                                                    (prod, i) =>
                                                        i === index
                                                            ? {
                                                                  ...prod,
                                                                  productName:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : prod
                                                )
                                            )
                                        }
                                        className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                    <textarea
                                        placeholder="Description"
                                        value={product.description}
                                        onChange={(e) =>
                                            setDefaultProductTypes(
                                                defaultProductTypes.map(
                                                    (prod, i) =>
                                                        i === index
                                                            ? {
                                                                  ...prod,
                                                                  description:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : prod
                                                )
                                            )
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        rows={2}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRemoveProductType(index)
                                        }
                                        className={`${
                                            defaultProductTypes.length > 1
                                                ? 'block'
                                                : 'hidden'
                                        } bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:ring focus:ring-red-300`}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddProductType}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:ring focus:ring-blue-300"
                            >
                                Add Product Type
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 focus:ring focus:ring-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 focus:ring focus:ring-green-300"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerForm;
