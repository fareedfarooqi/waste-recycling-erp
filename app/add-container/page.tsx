'use client';

import React, { useState, useEffect } from 'react';
// import { supabase } from '@/supabase/Client'; // Import Supabase client
import { createClient } from '@/utils/supabase/client';
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
    productName: string; // Add productName to the product allocation type
}

interface FormValues {
    status: string;
    productsAllocated: ProductAllocation[];
    photos: File[];
}

export default function AddContainerPage() {
    const { isSidebarOpen } = useSidebar();

    const [formValues, setFormValues] = useState<FormValues>({
        status: 'new',
        productsAllocated: [],
        photos: [],
    });

    // Fetch product name based on entered productId
    const fetchProductName = async (productId: string) => {
        if (!productId) return;

        const supabase = createClient();
        const { data, error } = await supabase
            .from('Products')
            .select('product_name')
            .eq('id', productId)
            .single(); // Get a single product based on ID

        if (error) {
            console.error('Error fetching product:', error.message);
            return;
        }

        if (data) {
            // Update the productName in the corresponding product allocation
            setFormValues((prev) => {
                const updatedProducts = [...prev.productsAllocated];
                updatedProducts.forEach((product, index) => {
                    if (product.productId === productId) {
                        updatedProducts[index] = {
                            ...product,
                            productName: data.product_name,
                        };
                    }
                });
                return { ...prev, productsAllocated: updatedProducts };
            });
        }
    };

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
                photos: [...prev.photos, ...Array.from(files)],
            }));
        }
    };

    const handleRemovePhoto = (index: number) => {
        setFormValues((prev) => {
            const updatedPhotos = [...prev.photos];
            updatedPhotos.splice(index, 1);
            return { ...prev, photos: updatedPhotos };
        });
    };

    const handleRemoveAllPhotos = () => {
        setFormValues((prev) => ({ ...prev, photos: [] }));
    };

    const handleAddProduct = () => {
        setFormValues((prev) => ({
            ...prev,
            productsAllocated: [
                ...prev.productsAllocated,
                { productId: '', quantity: 0, productName: '' },
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

            // If the productId is updated, fetch the product name
            if (field === 'productId') {
                fetchProductName(value.toString());
            }

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
    };

    return (
        <div className="min-h-screen bg-green-50 text-gray-800 flex">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}

            <div className="flex-1 flex flex-col">
                <Navbar />
                <div className="flex-grow bg-green-50 p-12">
                    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-green-700 flex items-center">
                                <FaPlus className="mr-3 text-green-600" />
                                Add Container
                            </h1>
                            <p className="text-lg font-light text-green-600">
                                Create a new container
                            </p>
                        </div>

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
                                                label="Product Name"
                                                type="text"
                                                value={product.productName}
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
                                    accept="image/*"
                                    onChange={(e) =>
                                        handlePhotoUpload(e.target.files)
                                    }
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                />
                            </div>

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

                            <div className="mt-4">
                                <Button
                                    label="Delete All Photos"
                                    variant="secondary"
                                    onClick={handleRemoveAllPhotos}
                                    disabled={formValues.photos.length === 0}
                                />
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
