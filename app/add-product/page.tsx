'use client';

import React, { useState } from 'react';
import SidebarSmall from '@/components/SidebarSmall';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/context/SidebarContext';
import Navbar from '@/components/Navbar';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import { supabase } from '@/config/supabaseClient';
import { FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation'; // Import the useRouter hook

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

    const isFormValid = () =>
        formValues.name.trim() !== '' && formValues.quantity.trim() !== '';

    const handleInputChange = (field: string, value: string) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleSaveProduct = async () => {
        setLoading(true);

        const { name, quantity, description, reservedLocation } = formValues;

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
            // Product exists, update it
            const existingProduct = existingProducts[0];

            const { error: updateError } = await supabase
                .from('products')
                .update({
                    quantity:
                        parseFloat(existingProduct.quantity) +
                        parseFloat(quantity),
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
                // alert('Product updated successfully!');
                // Navigate back to the inventory list page
                router.push('/inventory-list');
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
                // alert('Product added successfully!');
                // Navigate back to the inventory list page
                router.push('/inventory-list');
            }
        }

        setLoading(false);
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
                                Add Product
                            </h1>
                            <p className="text-lg font-light text-green-600">
                                Add new products
                            </p>
                        </div>
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
                                onChange={(e) =>
                                    handleInputChange(
                                        'quantity',
                                        e.target.value
                                    )
                                }
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
                                {/* "Cancel" button navigates back to the inventory list page */}
                                <Button
                                    label="Cancel"
                                    variant="secondary"
                                    onClick={() =>
                                        router.push('/inventory-list')
                                    }
                                />
                                <Button
                                    label="Save Product"
                                    variant="primary"
                                    onClick={handleSaveProduct}
                                    disabled={!isFormValid() || loading}
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
