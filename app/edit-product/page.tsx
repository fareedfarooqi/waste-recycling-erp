'use client';

import React, { useState, useEffect } from 'react';
import SidebarSmall from '@/components/SidebarSmall';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/context/SidebarContext';
import Navbar from '@/components/Navbar';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import { FaPencilAlt } from 'react-icons/fa';
import { createClient } from '@/utils/supabase/client';

export default function EditProductPage() {
    const { isSidebarOpen } = useSidebar();

    const [formValues, setFormValues] = useState({
        product_name: '',
        quantity: '',
        product_description: '',
        reserved_location: '',
    });

    const [initialValues, setInitialValues] = useState({
        product_name: '',
        quantity: '',
        product_description: '',
        reserved_location: '',
    });

    const productId = '523e4567-e89b-12d3-a456-426614174004'; // Replace with dynamic product ID

    // Fetch product data from Supabase by product id
    useEffect(() => {
        const fetchProduct = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single(); // Fetch a single record

            if (data) {
                setFormValues({
                    product_name: data.product_name,
                    quantity: data.quantity,
                    product_description: data.product_description,
                    reserved_location: data.reserved_location,
                });
                setInitialValues({
                    product_name: data.product_name,
                    quantity: data.quantity,
                    product_description: data.product_description,
                    reserved_location: data.reserved_location,
                });
            }

            if (error) {
                console.error('Error fetching product:', error);
            }
        };

        fetchProduct();
    }, [productId]);

    const isFormValid = () =>
        formValues.product_name.trim() !== '' &&
        formValues.quantity !== '' &&
        !isNaN(Number(formValues.quantity));

    const handleInputChange = (field: string, value: string) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        // Check if the form values have changed compared to initial values
        if (JSON.stringify(formValues) !== JSON.stringify(initialValues)) {
            console.log('Saving product:', formValues);
            const supabase = createClient();
            const { error } = await supabase
                .from('products')
                .update({
                    product_name: formValues.product_name,
                    quantity: formValues.quantity,
                    product_description: formValues.product_description,
                    reserved_location: formValues.reserved_location,
                })
                .eq('id', productId); // Update the product by ID

            if (error) {
                console.error('Error saving product:', error);
            } else {
                console.log('Product saved successfully');
            }
        } else {
            console.log('No changes made');
        }
    };

    return (
        <div className="min-h-screen bg-green-50 text-gray-800 flex">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Navbar */}
                <Navbar />

                {/* Edit Product Form */}
                <div className="flex-grow bg-green-50 p-12">
                    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-green-700 flex items-center">
                                <FaPencilAlt className="mr-3 text-green-600" />
                                Edit Product
                            </h1>
                            <p className="text-lg font-light text-green-600">
                                Edit existing products
                            </p>
                        </div>

                        {/* Form */}
                        <form>
                            <FormField
                                label="Name"
                                type="text"
                                placeholder="Enter product name"
                                required
                                value={formValues.product_name}
                                onChange={(e) =>
                                    handleInputChange(
                                        'product_name',
                                        e.target.value
                                    )
                                }
                            />
                            <FormField
                                label="Quantity"
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
                                value={formValues.product_description || ''}
                                onChange={(e) =>
                                    handleInputChange(
                                        'product_description',
                                        e.target.value
                                    )
                                }
                            />

                            <FormField
                                label="Reserved Location"
                                type="text"
                                placeholder="Enter reserved location"
                                value={formValues.reserved_location || ''}
                                onChange={(e) =>
                                    handleInputChange(
                                        'reserved_location',
                                        e.target.value
                                    )
                                }
                            />
                            <div className="flex justify-between mt-8">
                                <Button
                                    label="Cancel"
                                    variant="secondary"
                                    onClick={() =>
                                        console.log('Cancel clicked')
                                    }
                                />
                                <Button
                                    label="Save Product"
                                    variant="primary"
                                    onClick={handleSave}
                                    disabled={
                                        !isFormValid() ||
                                        JSON.stringify(formValues) ===
                                            JSON.stringify(initialValues)
                                    }
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
