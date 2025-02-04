'use client';

import React, { useState, useCallback } from 'react';
import { useSidebar } from '@/components/Sidebar/SidebarContext';
import Sidebar from '@/components/Sidebar/Sidebar';
import SidebarSmall from '@/components/Sidebar/SidebarSmall';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX } from 'react-icons/fi';

function ProfilePage(): JSX.Element {
    const { isSidebarOpen } = useSidebar();
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [preview, setPreview] = useState('');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setProfilePic(file);
            const reader = new FileReader();
            reader.onload = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    }, []);

    const handleRemoveImage = () => {
        setProfilePic(null);
        setPreview('');
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false,
    });

    return (
        <div className="flex bg-green-50 min-h-screen">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}

            <div className="flex-1 flex justify-center items-center px-6">
                <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-8">
                    <h1 className="text-3xl font-semibold text-gray-900 text-center mb-6">
                        Edit Profile
                    </h1>

                    <div className="flex flex-col items-center mb-8">
                        <div className="relative">
                            <div
                                {...getRootProps()}
                                className={`flex h-24 w-24 items-center justify-center rounded-full border-2 ${
                                    isDragActive
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-300 bg-gray-100'
                                } cursor-pointer transition-all duration-300 hover:shadow-lg`}
                            >
                                <input {...getInputProps()} />
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Profile preview"
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    <FiUpload className="h-8 w-8 text-gray-400" />
                                )}
                            </div>
                            {preview && (
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 focus:outline-none"
                                >
                                    <FiX className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <p className="mt-2 text-sm text-gray-500 text-center">
                            Upload a profile picture to personalize your
                            account.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-gray-700 text-sm font-medium">
                                First Name
                            </label>
                            <input
                                type="text"
                                className="w-full p-3 mt-1 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter your first name"
                            />
                        </div>

                        <div>
                            <label className="text-gray-700 text-sm font-medium">
                                Last Name
                            </label>
                            <input
                                type="text"
                                className="w-full p-3 mt-1 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter your last name"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-gray-700 text-sm font-medium">
                                Email
                            </label>
                            <input
                                type="email"
                                className="w-full p-3 mt-1 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-gray-700 text-sm font-medium">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                className="w-full p-3 mt-1 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter your phone number"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-gray-700 text-sm font-medium">
                                Role
                            </label>
                            <input
                                type="text"
                                className="w-full p-3 mt-1 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter your role"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition shadow-md">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
