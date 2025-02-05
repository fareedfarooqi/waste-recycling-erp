'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiInfo, FiUpload, FiX } from 'react-icons/fi';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function CompleteProfile(): JSX.Element {
    const supabase = createClientComponentClient();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [preview, setPreview] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [companyId, setCompanyId] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                console.error('Error fetching user:', error.message);
                return;
            }
            if (!data?.user) {
                router.push('/sign-in');
                return;
            }
            setEmail(data.user.email ?? '');
        })();
    }, [router]);

    useEffect(() => {
        const storedCompanyId = localStorage.getItem('company_id');
        if (storedCompanyId) {
            setCompanyId(storedCompanyId);
        }
    }, []);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setProfilePic(file);
            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result as string);
            };
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

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error('User not authenticated');
            setIsLoading(false);
            return;
        }

        let profilePicturePath: string | null = null;
        if (profilePic) {
            const { data: uploadData, error: uploadError } =
                await supabase.storage
                    .from('profile-pictures')
                    .upload(`${user.id}/${profilePic.name}`, profilePic, {
                        upsert: true,
                    });
            if (uploadError) {
                console.error(
                    'Error uploading profile picture:',
                    uploadError.message
                );
                setIsLoading(false);
                return;
            }
            profilePicturePath = uploadData?.path || null;
        }

        const { error: dbError } = await supabase.from('company_users').insert({
            user_id: user.id,
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone_number: phoneNumber,
            role,
            profile_picture: profilePicturePath,
            profile_complete: !!profilePic,
            company_id: companyId,
        });

        if (dbError) {
            console.error(
                'Error inserting company_users record:',
                dbError.message
            );
            setIsLoading(false);
            return;
        }

        router.push('/staff/invite');
        setIsLoading(false);
    }

    return (
        <div className="w-full max-w-3xl rounded-xl bg-white p-10 shadow-2xl md:p-14">
            <h1 className="mb-3 text-center text-4xl font-extrabold text-green-700 md:mb-5 md:text-5xl">
                Complete Your Profile
            </h1>
            <p className="mb-8 text-center text-xl text-gray-600 md:mb-10">
                Fill in your details to get started.
            </p>
            <form
                className="grid grid-cols-1 gap-y-6 gap-x-8 md:grid-cols-2"
                onSubmit={handleSubmit}
            >
                <div className="md:col-span-2 flex flex-col items-center">
                    <label
                        htmlFor="profilePicture"
                        className="mb-2 text-lg font-semibold text-gray-700"
                    >
                        Profile Picture{' '}
                        <span className="text-gray-500">(Optional)</span>
                    </label>
                    <div className="relative">
                        <div
                            {...getRootProps()}
                            className={`relative flex h-32 w-32 items-center justify-center rounded-full border-2 ${
                                isDragActive
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-300 bg-gray-100'
                            } cursor-pointer transition-all duration-300 hover:shadow-lg`}
                        >
                            <input {...getInputProps()} id="profilePicture" />
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Profile preview"
                                    className="h-full w-full rounded-full object-cover"
                                />
                            ) : (
                                <FiUpload className="h-10 w-10 text-gray-400" />
                            )}
                        </div>
                        {preview && (
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 focus:outline-none"
                            >
                                <FiX className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <p className="mt-3 text-center text-sm text-gray-500">
                        Upload a profile picture to personalise your account.
                    </p>
                </div>

                <div className="flex flex-col">
                    <label
                        htmlFor="firstName"
                        className="mb-2 text-lg font-semibold text-gray-700"
                    >
                        First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter your first name"
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white px-5 py-4 text-lg leading-relaxed text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                </div>

                <div className="flex flex-col">
                    <label
                        htmlFor="lastName"
                        className="mb-2 text-lg font-semibold text-gray-700"
                    >
                        Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter your last name"
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white px-5 py-4 text-lg leading-relaxed text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                </div>

                <div className="flex flex-col">
                    <label
                        htmlFor="email"
                        className="mb-2 text-lg font-semibold text-gray-700"
                    >
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-5 py-4 text-lg leading-relaxed text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        This email was used to create your account.
                    </p>
                </div>

                <div className="flex flex-col">
                    <label
                        htmlFor="phoneNumber"
                        className="mb-2 text-lg font-semibold text-gray-700"
                    >
                        Phone Number{' '}
                        <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter your phone number"
                        className="w-full rounded-lg border border-gray-300 bg-white px-5 py-4 text-lg leading-relaxed text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                </div>

                <div className="flex flex-col md:col-span-2">
                    <label
                        htmlFor="role"
                        className="mb-2 text-lg font-semibold text-gray-700"
                    >
                        Role <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center">
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                            className="flex-1 rounded-lg border border-gray-300 bg-white px-5 py-4 text-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        >
                            <option value="">Select a role</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="driver">Driver</option>
                            <option value="warehouse-staff">
                                Warehouse Staff
                            </option>
                        </select>
                        <div
                            className="relative ml-3 cursor-pointer"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                        >
                            <FiInfo className="h-6 w-6 text-green-600" />
                            {showTooltip && (
                                <div className="absolute right-full top-1/2 mr-2 w-64 -translate-y-1/2 rounded-md bg-green-700 p-2 text-xs text-white shadow-lg">
                                    <p className="mb-1 font-bold">
                                        Role Descriptions:
                                    </p>
                                    <ul className="list-disc pl-4">
                                        <li>
                                            <strong>Admin:</strong> Full control
                                        </li>
                                        <li>
                                            <strong>Manager:</strong> Limited
                                            control
                                        </li>
                                        <li>
                                            <strong>Driver:</strong> Driver
                                            interface only
                                        </li>
                                        <li>
                                            <strong>Warehouse Staff:</strong>{' '}
                                            Warehouse interface only
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-1 w-full rounded-lg bg-green-600 px-6 py-4 text-lg font-semibold text-white shadow hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50"
                    >
                        {isLoading ? 'Submitting...' : 'Submit Details'}
                    </button>
                </div>
            </form>
        </div>
    );
}
