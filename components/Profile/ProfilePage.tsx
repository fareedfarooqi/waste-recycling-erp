'use client';

import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX } from 'react-icons/fi';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export type Profile = {
    user_id: string;
    company_id: string | null;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string | null;
    role: string;
    profile_picture: string | null;
    profile_complete: boolean;
    updated_at: string | null;
    created_at: string | null;
};

function formatRole(role: string) {
    return role
        .split('-')
        .map(
            (segment) =>
                segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase()
        )
        .join(' ');
}

export default function ProfileModal(): JSX.Element {
    const supabase = createClientComponentClient();
    const router = useRouter();

    const { authUserId, loading, refreshProfilePicture } = useAuth();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [preview, setPreview] = useState('');
    const [removeOldFile, setRemoveOldFile] = useState(false);

    useEffect(() => {
        if (!authUserId) return;

        async function fetchUserProfile() {
            const { data, error } = await supabase
                .from('company_users')
                .select('*')
                .eq('user_id', authUserId)
                .single();

            if (error) {
                console.error('Error fetching user profile:', error.message);
                return;
            }

            if (data) {
                setProfile(data);
                setFirstName(data.first_name ?? '');
                setLastName(data.last_name ?? '');
                setPhoneNumber(data.phone_number ?? '');

                if (data.profile_picture) {
                    const { data: signedUrlData, error: signedUrlError } =
                        await supabase.storage
                            .from('profile-pictures')
                            .createSignedUrl(data.profile_picture, 3600); // Last 1 hour.

                    if (signedUrlError) {
                        console.error(
                            'Error creating signed URL:',
                            signedUrlError.message
                        );
                    } else if (signedUrlData?.signedUrl) {
                        setPreview(signedUrlData.signedUrl);
                    }
                }
            }
        }

        fetchUserProfile();
    }, [authUserId, supabase]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                setProfilePic(file);

                const reader = new FileReader();
                reader.onload = () => setPreview(reader.result as string);
                reader.readAsDataURL(file);

                setRemoveOldFile(true);
            }
        },
        accept: { 'image/*': [] },
        multiple: false,
    });

    const handleRemoveImage = () => {
        setProfilePic(null);
        setPreview('');
        setRemoveOldFile(true);
    };

    async function handleSaveChanges(e: React.FormEvent) {
        e.preventDefault();
        if (!profile) return;

        let profilePicturePath = profile.profile_picture;
        const oldPath = profile.profile_picture;

        if (removeOldFile && oldPath) {
            const { error: removeError } = await supabase.storage
                .from('profile-pictures')
                .remove([oldPath]);
            if (removeError) {
                console.error('Error removing old file:', removeError.message);
            }
            profilePicturePath = null;
        }

        if (profilePic) {
            const uploadPath = `${profile.user_id}/${profilePic.name}`;
            const { data: uploadData, error: uploadError } =
                await supabase.storage
                    .from('profile-pictures')
                    .upload(uploadPath, profilePic);

            if (uploadError) {
                console.error(
                    'Error uploading new profile picture:',
                    uploadError.message
                );
                return;
            }
            profilePicturePath = uploadData?.path || null;
        }

        const { error: updateError } = await supabase
            .from('company_users')
            .update({
                first_name: firstName,
                last_name: lastName,
                phone_number: phoneNumber,
                profile_picture: profilePicturePath,
            })
            .eq('user_id', profile.user_id);

        if (updateError) {
            console.error('Error updating user:', updateError.message);
            return;
        }

        await refreshProfilePicture();

        router.push('/customers');
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen w-screen">
                <svg
                    className="animate-spin h-8 w-8 text-green-600 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <p className="text-lg font-medium text-gray-600">
                    Loading your profile...
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex justify-center items-center px-6">
            <form
                onSubmit={handleSaveChanges}
                className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-8"
            >
                <h1 className="text-3xl font-semibold text-gray-900 text-center mb-6">
                    Edit Profile
                </h1>

                {/* Profile Picture Uploader */}
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
                        Upload a profile picture to personalise your account.
                    </p>
                </div>

                {/* Profile Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* First Name */}
                    <div>
                        <label className="text-gray-700 text-sm font-medium">
                            First Name
                        </label>
                        <input
                            type="text"
                            className="w-full p-3 mt-1 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter your first name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="text-gray-700 text-sm font-medium">
                            Last Name
                        </label>
                        <input
                            type="text"
                            className="w-full p-3 mt-1 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter your last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>

                    {/* Email (read-only) */}
                    <div className="md:col-span-2">
                        <label className="text-gray-700 text-sm font-medium">
                            Email
                        </label>
                        <input
                            type="email"
                            disabled
                            className="w-full p-3 mt-1 border border-gray-300 rounded-lg text-gray-900 cursor-not-allowed bg-gray-100 focus:outline-none"
                            placeholder="Email Address"
                            value={profile?.email || ''}
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            This email was used to create your account and
                            cannot be changed.
                        </p>
                    </div>

                    {/* Phone Number */}
                    <div className="md:col-span-2">
                        <label className="text-gray-700 text-sm font-medium">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            className="w-full p-3 mt-1 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter your phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>

                    {/* Role (read-only) */}
                    <div className="md:col-span-2">
                        <label className="text-gray-700 text-sm font-medium">
                            Role
                        </label>
                        <input
                            type="text"
                            disabled
                            className="w-full p-3 mt-1 border border-gray-300 rounded-lg text-gray-900 cursor-not-allowed bg-gray-100 focus:outline-none"
                            placeholder="Role"
                            value={
                                profile?.role ? formatRole(profile.role) : ''
                            }
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            This role was assigned by your admin.
                        </p>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition shadow-md"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
