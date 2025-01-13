'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/config/supabaseClient';
import { IoIosRemoveCircleOutline } from 'react-icons/io';

interface CustomerFormProps {
    onAdditionSuccess?: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onAdditionSuccess }) => {
    const router = useRouter();
    const [companyName, setCompanyName] = useState('');
    const [contactDetails, setContactDetails] = useState({
        email: '',
        phone: '',
        address: '',
    });
    const [locations, setLocations] = useState([
        {
            locationName: '',
            address: '',
            initialEmptyBins: '',
            defaultProductTypes: [{ productName: '', description: '' }],
        },
    ]);

    const handleAddLocation = () => {
        setLocations((prev) => [
            ...prev,
            {
                locationName: '',
                address: '',
                initialEmptyBins: '',
                defaultProductTypes: [{ productName: '', description: '' }],
            },
        ]);
    };

    const handleRemoveLocation = (index: number) => {
        if (locations.length > 1) {
            setLocations((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const handleAddProductType = (locIndex: number) => {
        setLocations((prev) => {
            const updated = [...prev];
            updated[locIndex] = {
                ...updated[locIndex],
                defaultProductTypes: [
                    ...updated[locIndex].defaultProductTypes,
                    { productName: '', description: '' },
                ],
            };
            return updated;
        });
    };

    const handleRemoveProductType = (
        locIndex: number,
        productIndex: number
    ) => {
        setLocations((prev) => {
            const updated = [...prev];
            if (updated[locIndex].defaultProductTypes.length > 1) {
                updated[locIndex].defaultProductTypes = updated[
                    locIndex
                ].defaultProductTypes.filter((_, i) => i !== productIndex);
            }
            return updated;
        });
    };

    const handleBinsChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) => {
        let val = parseInt(e.target.value || '0', 10);
        if (val < 0) val = 0;
        setLocations((prev) =>
            prev.map((loc, i) =>
                i === index ? { ...loc, initialEmptyBins: val.toString() } : loc
            )
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const customerData = {
            company_name: companyName,
            contact_details: contactDetails,
            locations: locations.map((loc) => ({
                location_name: loc.locationName,
                address: loc.address,
                initial_empty_bins: Math.max(
                    parseInt(loc.initialEmptyBins, 10) || 0,
                    0
                ),
                default_product_types: loc.defaultProductTypes.map((p) => ({
                    product_name: p.productName,
                    description: p.description,
                })),
            })),
        };
        try {
            const { error } = await supabase
                .from('customers')
                .insert([customerData]);
            if (error) {
                console.error(error.message);
                alert('Failed to add customer. Please try again.');
                return;
            }
            if (onAdditionSuccess) onAdditionSuccess();
            router.push('/customers?success=1');
        } catch (err) {
            console.error(err);
            alert('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <div className="flex justify-center items-start">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-8 overflow-auto max-h-[92vh]">
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
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
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
                                        setContactDetails((prev) => ({
                                            ...prev,
                                            email: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
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
                                        setContactDetails((prev) => ({
                                            ...prev,
                                            phone: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                                    placeholder="Enter phone number"
                                    required
                                />
                            </div>
                            <div className="col-span-full">
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Address{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={contactDetails.address}
                                    onChange={(e) =>
                                        setContactDetails((prev) => ({
                                            ...prev,
                                            address: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                                    rows={3}
                                    placeholder="Enter address"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-700 mb-4">
                            Locations
                        </h2>
                        <div className="bg-gray-50 p-6 rounded-lg shadow-inner space-y-6">
                            {locations.map((location, index) => (
                                <div
                                    key={index}
                                    className="p-4 border border-gray-300 rounded-lg shadow-sm bg-white"
                                >
                                    <h3 className="font-bold text-gray-700 mb-2">
                                        Location {index + 1}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                        <input
                                            type="text"
                                            placeholder="Location Name"
                                            value={location.locationName}
                                            onChange={(e) =>
                                                setLocations((prev) =>
                                                    prev.map((loc, i) =>
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
                                            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Address"
                                            value={location.address}
                                            onChange={(e) =>
                                                setLocations((prev) =>
                                                    prev.map((loc, i) =>
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
                                            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                                            required
                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Empty Bins"
                                            value={location.initialEmptyBins}
                                            onChange={(e) =>
                                                handleBinsChange(e, index)
                                            }
                                            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                                            required
                                        />
                                        {locations.length > 1 && (
                                            <button
                                                type="button"
                                                className="bg-red-500 text-white px-3 py-2 rounded-lg transition hover:bg-red-700"
                                                onClick={() =>
                                                    handleRemoveLocation(index)
                                                }
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <h4 className="font-medium text-gray-600 mb-2">
                                        Default Product Types
                                    </h4>
                                    {location.defaultProductTypes.map(
                                        (product, productIndex) => (
                                            <div
                                                key={productIndex}
                                                className="flex gap-4 items-center mb-2"
                                            >
                                                <input
                                                    type="text"
                                                    placeholder="Product Name"
                                                    value={product.productName}
                                                    onChange={(e) =>
                                                        setLocations((prev) =>
                                                            prev.map(
                                                                (
                                                                    loc,
                                                                    locIndex
                                                                ) =>
                                                                    locIndex ===
                                                                    index
                                                                        ? {
                                                                              ...loc,
                                                                              defaultProductTypes:
                                                                                  loc.defaultProductTypes.map(
                                                                                      (
                                                                                          p,
                                                                                          i
                                                                                      ) =>
                                                                                          i ===
                                                                                          productIndex
                                                                                              ? {
                                                                                                    ...p,
                                                                                                    productName:
                                                                                                        e
                                                                                                            .target
                                                                                                            .value,
                                                                                                }
                                                                                              : p
                                                                                  ),
                                                                          }
                                                                        : loc
                                                            )
                                                        )
                                                    }
                                                    className="border border-gray-300 rounded-lg px-4 py-3 w-1/3 focus:outline-none focus:ring-2 focus:ring-green-400"
                                                    required
                                                />
                                                <textarea
                                                    placeholder="Description"
                                                    value={product.description}
                                                    onChange={(e) =>
                                                        setLocations((prev) =>
                                                            prev.map(
                                                                (
                                                                    loc,
                                                                    locIndex
                                                                ) =>
                                                                    locIndex ===
                                                                    index
                                                                        ? {
                                                                              ...loc,
                                                                              defaultProductTypes:
                                                                                  loc.defaultProductTypes.map(
                                                                                      (
                                                                                          p,
                                                                                          i
                                                                                      ) =>
                                                                                          i ===
                                                                                          productIndex
                                                                                              ? {
                                                                                                    ...p,
                                                                                                    description:
                                                                                                        e
                                                                                                            .target
                                                                                                            .value,
                                                                                                }
                                                                                              : p
                                                                                  ),
                                                                          }
                                                                        : loc
                                                            )
                                                        )
                                                    }
                                                    className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                                                    rows={1}
                                                    required
                                                />
                                                {location.defaultProductTypes
                                                    .length > 1 && (
                                                    <IoIosRemoveCircleOutline
                                                        className="text-red-500 text-4xl cursor-pointer hover:text-red-700 transition duration-200"
                                                        onClick={() =>
                                                            handleRemoveProductType(
                                                                index,
                                                                productIndex
                                                            )
                                                        }
                                                    />
                                                )}
                                            </div>
                                        )
                                    )}
                                    <button
                                        type="button"
                                        className="bg-blue-500 text-white px-3 py-2 mt-2 rounded-lg transition hover:bg-blue-700"
                                        onClick={() =>
                                            handleAddProductType(index)
                                        }
                                    >
                                        Add Product Type
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="bg-green-500 text-white px-3 py-2 rounded-lg transition hover:bg-green-700"
                                onClick={handleAddLocation}
                            >
                                Add Location
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <button
                            className="bg-red-500 text-white px-6 py-3 rounded-lg transition hover:bg-red-700"
                            onClick={() => router.push('/customers')}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-6 py-3 rounded-lg transition hover:bg-green-700"
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
