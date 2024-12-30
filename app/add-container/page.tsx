'use client';

import React, { useState } from 'react';
import SidebarSmall from '@/components/SidebarSmall';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/context/SidebarContext';
import Navbar from '@/components/Navbar';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import { FaPlus, FaTimes } from 'react-icons/fa';

interface ProductAllocation {
    productId: string;
    quantity: number;
}

interface FormValues {
    status: string;
    productsAllocated: ProductAllocation[];
    photos: File[];
}

export default function AddContainerPage() {
    const { isSidebarOpen } = useSidebar();

    const [formValues, setFormValues] = useState<FormValues>({
        status: 'new', // Default to "new" status
        productsAllocated: [],
        photos: [],
    });

    const handleInputChange = (
        field: string,
        value: string | boolean | number
    ) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    const handlePhotoUpload = (files: FileList | null) => {
        if (files) {
            setFormValues((prev) => ({
                ...prev,
                photos: [
                    ...prev.photos, // Preserve already uploaded files
                    ...Array.from(files), // Convert FileList to an array and add new files
                ],
            }));
        }
    };

    const handleRemovePhoto = (index: number) => {
        setFormValues((prev) => {
            const updatedPhotos = [...prev.photos];
            updatedPhotos.splice(index, 1); // Remove file by index
            return { ...prev, photos: updatedPhotos };
        });
    };

    const handleAddProduct = () => {
        setFormValues((prev) => ({
            ...prev,
            productsAllocated: [
                ...prev.productsAllocated,
                { productId: '', quantity: 0 },
            ],
        }));
    };

    const handleProductChange = (
        index: number,
        field: 'productId' | 'quantity',
        value: string | number
    ) => {
        setFormValues((prev) => {
            const updatedProducts = [...prev.productsAllocated];
            updatedProducts[index] = {
                ...updatedProducts[index],
                [field]: value,
            };
            return { ...prev, productsAllocated: updatedProducts };
        });
    };

    const handleRemoveProduct = (index: number) => {
        setFormValues((prev) => {
            const updatedProducts = [...prev.productsAllocated];
            updatedProducts.splice(index, 1);
            return { ...prev, productsAllocated: updatedProducts };
        });
    };

    const isFormValid = () => formValues.status.trim() !== '';

    const handleSubmit = () => {
        console.log('Container Data:', formValues);
        // Add logic to save container data to Supabase
    };

    return (
        <div className="min-h-screen bg-green-50 text-gray-800 flex">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Navbar */}
                <Navbar />

                {/* Add Container Form */}
                <div className="flex-grow bg-green-50 p-12">
                    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-green-700 flex items-center">
                                <FaPlus className="mr-3 text-green-600" />
                                Add Container
                            </h1>
                            <p className="text-lg font-light text-green-600">
                                Create a new container
                            </p>
                        </div>

                        {/* Form */}
                        <form>
                            {/* Status Dropdown */}
                            <FormField label="Status" type="dropdown" required>
                                <select
                                    value={formValues.status}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'status',
                                            e.target.value
                                        )
                                    }
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                >
                                    <option value="new">New</option>
                                    <option value="packing">Packing</option>
                                    <option value="sent">Sent</option>
                                    <option value="invoiced">Invoiced</option>
                                </select>
                            </FormField>

                            {/* Products Allocated */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Allocation
                                </label>
                                {formValues.productsAllocated.map(
                                    (product, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-4 mb-4"
                                        >
                                            <FormField
                                                label="Product ID"
                                                type="text"
                                                placeholder="Enter Product ID"
                                                required
                                                value={product.productId}
                                                onChange={(e) =>
                                                    handleProductChange(
                                                        index,
                                                        'productId',
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <FormField
                                                label="Quantity (kg)"
                                                type="number"
                                                placeholder="Enter Quantity"
                                                required
                                                value={product.quantity}
                                                onChange={(e) =>
                                                    handleProductChange(
                                                        index,
                                                        'quantity',
                                                        parseInt(
                                                            e.target.value ||
                                                                '0',
                                                            10
                                                        )
                                                    )
                                                }
                                            />
                                            <Button
                                                label="Remove"
                                                variant="secondary"
                                                onClick={() =>
                                                    handleRemoveProduct(index)
                                                }
                                            />
                                        </div>
                                    )
                                )}
                                <Button
                                    label="Add Product"
                                    variant="secondary"
                                    onClick={handleAddProduct}
                                />
                            </div>

                            {/* Photo Upload */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Photos
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*" // Restrict file types to images only
                                    onChange={(e) =>
                                        handlePhotoUpload(e.target.files)
                                    }
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                />
                            </div>

                            {/* Display uploaded photos */}
                            <div className="mt-4">
                                {formValues.photos.length > 0 && (
                                    <div>
                                        {formValues.photos.map(
                                            (file, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <span>{file.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemovePhoto(
                                                                index
                                                            )
                                                        }
                                                        className="text-red-500"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                                {formValues.photos.length === 0 && (
                                    <p>No files chosen</p>
                                )}
                            </div>

                            <div className="flex justify-between mt-8">
                                <Button
                                    label="Cancel"
                                    variant="secondary"
                                    onClick={() =>
                                        console.log('Cancel clicked')
                                    }
                                />
                                <Button
                                    label="Save Container"
                                    variant="primary"
                                    onClick={handleSubmit}
                                    disabled={!isFormValid()}
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
