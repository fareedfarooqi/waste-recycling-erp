'use client';

import React, { useState } from 'react';
import SidebarSmall from '@/components/SidebarSmall';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/context/SidebarContext';
import Navbar from '@/components/Navbar';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import { FaPlus } from 'react-icons/fa';

export default function AddProductPage() {
    const { isSidebarOpen } = useSidebar();

    const [formValues, setFormValues] = useState({
        name: '',
        quantity: '',
        description: '',
        reservedLocation: '',
    });

    const isFormValid = () =>
        formValues.name.trim() !== '' && formValues.quantity.trim() !== ''; // Make description optional

    const handleInputChange = (field: string, value: string) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen bg-green-50 text-gray-800 flex">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Navbar */}
                <Navbar />

                {/* Add Product Form */}
                <div className="flex-grow bg-green-50 p-12">
                    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-green-700 flex items-center">
                                <FaPlus className="mr-3 text-green-600" />
                                Add Product
                            </h1>
                            <p className="text-lg font-light text-green-600">
                                Add new products
                            </p>
                        </div>

                        {/* Form */}
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
                                value={formValues.description} // No required attribute here
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
                                        console.log('Cancel clicked')
                                    }
                                />
                                <Button
                                    label="Save Product"
                                    variant="primary"
                                    onClick={() => console.log('Save clicked')}
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
