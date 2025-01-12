'use client';

import React, { useState } from 'react';
import SidebarSmall from '@/components/Sidebar/SidebarSmall';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useSidebar } from '@/components/Sidebar/SidebarContext';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import { supabase } from '@/config/supabaseClient';
import { FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation'; // Import the useRouter hook
import { IoMdClose } from 'react-icons/io'; // For the dismiss button
import SuccessAnimation from '@/components/SuccessAnimation'; // Import the animation

export default function AddProductPage() {
    const { isSidebarOpen } = useSidebar();
    const router = useRouter(); // Initialize router for navigation

    const [formValues, setFormValues] = useState({
        name: '',
        quantity: '',
        description: '',
        reservedLocation: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); // Error state
    const [showSuccess, setShowSuccess] = useState(false); // Success animation state

    const isFormValid = () =>
        formValues.name.trim() !== '' && formValues.quantity.trim() !== '';

    const handleInputChange = (field: string, value: string) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));

        // Reset error if quantity is updated
        if (field === 'quantity' && parseFloat(value) <= 10000000) {
            setError(null);
        }
    };

    const handleSaveProduct = async () => {
        const { name, quantity, description, reservedLocation } = formValues;

        // Check if the entered quantity exceeds the limit
        if (parseFloat(quantity) > 10000000) {
            setError('Quantity exceeds the maximum limit');
            return;
        }

        setLoading(true);

        // Fetch existing product by name
        const { data: existingProducts, error: fetchError } = await supabase
            .from('products')
            .select('*')
            .eq('product_name', name);

        if (fetchError) {
            console.error('Error fetching product:', fetchError.message);
            setLoading(false);
            return;
        }

        if (existingProducts?.length > 0) {
            // Product exists, check if the total sum exceeds the limit
            const existingProduct = existingProducts[0];
            const totalQuantity =
                parseFloat(existingProduct.quantity) + parseFloat(quantity);

            if (totalQuantity > 10_000_000) {
                setError(
                    `Cannot update product "${name}" as the total quantity (${totalQuantity.toLocaleString()} kg) exceeds the maximum limit`
                );
                setLoading(false);
                return;
            }

            // Update the product
            const { error: updateError } = await supabase
                .from('products')
                .update({
                    quantity: totalQuantity,
                    product_description:
                        description || existingProduct.product_description,
                    reserved_location:
                        reservedLocation || existingProduct.reserved_location,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existingProduct.id);

            if (updateError) {
                console.error('Error updating product:', updateError.message);
            } else {
                // router.push('/inventory-list');
                setShowSuccess(true); // Show success animation
                setTimeout(() => {
                    setShowSuccess(false);
                    router.push('/inventory-list'); // Navigate back
                }, 700);
            }
        } else {
            // Product does not exist, insert a new one
            const { error: insertError } = await supabase
                .from('products')
                .insert([
                    {
                        product_name: name,
                        quantity,
                        product_description: description || null,
                        reserved_location: reservedLocation || null,
                    },
                ]);

            if (insertError) {
                console.error('Error adding new product:', insertError.message);
            } else {
                // router.push('/inventory-list');
                setShowSuccess(true); // Show success animation
                setTimeout(() => {
                    setShowSuccess(false);
                    router.push('/inventory-list'); // Navigate back
                }, 700);
            }
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-green-50 text-gray-800 flex">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}
            {showSuccess && <SuccessAnimation />}{' '}
            {/* Render success animation */}
            <div
                className="flex-1 flex flex-col justify-center"
                style={{ paddingTop: '4%' }}
            >
                <div className="flex-grow bg-green-50 p-12">
                    <div className="max-w-4xl w-full mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-green-700 flex items-center">
                                <FaPlus className="mr-3 text-green-600" />
                                Add Product
                            </h1>
                            <p className="text-lg font-light text-green-600">
                                Add new products
                            </p>
                        </div>
                        {error && (
                            <div className="mb-4 p-2 bg-red-100 border border-red-400 rounded flex justify-between items-center">
                                <p className="text-red-700 text-sm">{error}</p>
                                <button
                                    onClick={() => setError(null)}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    <IoMdClose size={16} />
                                </button>
                            </div>
                        )}
                        <form>
                            <FormField
                                label="Name"
                                type="text"
                                placeholder="Enter product name"
                                required
                                value={formValues.name}
                                onChange={(e) =>
                                    handleInputChange('name', e.target.value)
                                }
                            />
                            <FormField
                                label="Quantity (kg)"
                                type="number"
                                placeholder="Enter quantity"
                                required
                                value={formValues.quantity}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (!value || parseFloat(value) > 0) {
                                        handleInputChange('quantity', value);
                                    }
                                }}
                            />
                            <FormField
                                label="Description"
                                type="textarea"
                                placeholder="Enter product description"
                                value={formValues.description}
                                onChange={(e) =>
                                    handleInputChange(
                                        'description',
                                        e.target.value
                                    )
                                }
                            />
                            <FormField
                                label="Reserved Location"
                                type="text"
                                placeholder="Enter reserved location"
                                value={formValues.reservedLocation}
                                onChange={(e) =>
                                    handleInputChange(
                                        'reservedLocation',
                                        e.target.value
                                    )
                                }
                            />
                            <div className="flex justify-between mt-8">
                                <Button
                                    label="Cancel"
                                    variant="secondary"
                                    onClick={() =>
                                        router.push('/inventory-list')
                                    }
                                    className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-gray-100 text-black rounded hover:bg-gray-100 transition whitespace-nowrap min-w-[120px] min-h-[50px]"
                                />
                                <Button
                                    label="Save Product"
                                    variant="primary"
                                    onClick={handleSaveProduct}
                                    disabled={!isFormValid() || loading}
                                    className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-green-600 text-white rounded hover:bg-green-500 transition whitespace-nowrap min-w-[120px] min-h-[50px]"
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
