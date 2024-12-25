'use client';

import React from 'react';
import {
    FaSearch,
    FaPlus,
    FaCog,
    FaQuestion,
    FaBox,
    FaCalendarAlt,
    FaUsers,
} from 'react-icons/fa';
import SidebarSmall from '@/components/SidebarSmall';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/context/SidebarContext';

export default function AddProductPage() {
    const { isSidebarOpen } = useSidebar();
    return (
        <div className="min-h-screen bg-green-50 text-gray-800 flex">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}

            {/* Main Content Area (Top Right with Search and Profile, Bottom Right with Add Product) */}
            <div className="flex-1 p-12 flex flex-col">
                {/* Top Bar (Search and Profile) */}
                <div className="flex justify-between items-center mb-12">
                    {/* Search Bar */}
                    <div className="flex items-center bg-white border border-gray-300 rounded-lg p-4 w-1/2">
                        <FaSearch className="text-gray-400 mr-3" />
                        <input
                            type="text"
                            className="w-full bg-transparent text-gray-800 focus:outline-none"
                            placeholder="Search anything here"
                        />
                    </div>
                </div>

                {/* Add Product Form (Bottom Right) */}
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
                            {/* Name Field */}
                            <div className="mb-8">
                                <label className="block text-lg font-medium text-gray-700">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter product name"
                                    required
                                />
                            </div>

                            {/* Quantity Field */}
                            <div className="mb-8">
                                <label className="block text-lg font-medium text-gray-700">
                                    Quantity{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    className="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter quantity"
                                    min="1"
                                    required
                                />
                            </div>

                            {/* Description Field */}
                            <div className="mb-8">
                                <label className="block text-lg font-medium text-gray-700">
                                    Description{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    rows={5}
                                    placeholder="Enter product description"
                                    required
                                />
                            </div>

                            {/* Reserved Location Field */}
                            <div className="mb-8">
                                <label className="block text-lg font-medium text-gray-700">
                                    Reserved Location
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter reserved location"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-between mt-8">
                                <button
                                    type="button"
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 p-4 rounded-lg w-36 transform transition-all duration-200 hover:scale-105 active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg w-36 transform transition-all duration-200 hover:scale-105 active:scale-95"
                                >
                                    Save Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
