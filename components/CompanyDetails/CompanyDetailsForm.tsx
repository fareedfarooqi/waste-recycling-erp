/* global google */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoadScript, Autocomplete, Libraries } from '@react-google-maps/api';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Company = {
    id: string;
    name: string;
    email: string;
    phone_number: string | null;
    created_at: string;
    updated_at: string;
};

const libraries: Libraries = ['places'];

export default function CompanyDetailsForm(): JSX.Element {
    const supabase = createClientComponentClient();

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    const [address, setAddress] = useState('');
    const [autocomplete, setAutocomplete] =
        useState<google.maps.places.Autocomplete | null>(null);
    const [isManual, setIsManual] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const router = useRouter();

    const handlePlaceSelect = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace?.();
            if (place?.formatted_address) {
                setAddress(place.formatted_address);
                setIsManual(false);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddress(e.target.value);
        setIsManual(true);
    };

    const handleSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const companyDetails = {
            name: companyName,
            email,
            phone_number: phoneNumber || null,
        };

        try {
            const { data, error } = await supabase
                .from('companies')
                .insert([companyDetails])
                .select('*')
                .single();

            if (error) {
                console.error(
                    'Error inserting company details:',
                    error.message
                );
            } else {
                const companyId = (data as Company).id;
                localStorage.setItem('company_id', companyId);
                localStorage.setItem('company_name', companyName);
                router.push('/staff/complete-profile');
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    };

    if (!isLoaded) return <p>Loading...</p>;

    return (
        <>
            <div className="w-full max-w-2xl rounded-xl bg-white p-10 shadow-2xl md:p-14">
                <h1 className="mb-3 text-center text-4xl font-extrabold text-green-700 md:mb-5 md:text-5xl">
                    Company Details
                </h1>
                <p className="mb-8 text-center text-xl text-gray-600 md:mb-10">
                    Please fill in your company details to get started.
                </p>
                <form
                    className="grid grid-cols-1 gap-y-6 gap-x-8 md:grid-cols-2"
                    onSubmit={handleSubmission}
                >
                    <div className="flex flex-col">
                        <label
                            htmlFor="companyName"
                            className="mb-2 text-lg font-semibold text-gray-700"
                        >
                            Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="companyName"
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Enter your company name"
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white px-5 py-4 text-lg leading-relaxed text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label
                            htmlFor="email"
                            className="mb-2 text-lg font-semibold text-gray-700"
                        >
                            Email Address{' '}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your company email"
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white px-5 py-4 text-lg leading-relaxed text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                    </div>
                    <div className="flex flex-col md:col-span-2">
                        <label
                            htmlFor="address"
                            className="mb-2 text-lg font-semibold text-gray-700"
                        >
                            Address <span className="text-red-500">*</span>
                        </label>
                        <Autocomplete
                            onLoad={(instance) => setAutocomplete(instance)}
                            onPlaceChanged={handlePlaceSelect}
                        >
                            <input
                                id="address"
                                type="text"
                                placeholder="Enter your company address"
                                value={address}
                                onChange={handleInputChange}
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white px-5 py-4 text-lg leading-relaxed text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                        </Autocomplete>
                        {isManual && (
                            <p className="mt-2 text-sm text-yellow-600">
                                Manually entered address. Ensure it&apos;s
                                valid.
                            </p>
                        )}
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
                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            className="mt-1 w-full rounded-lg bg-green-600 px-6 py-4 text-lg font-semibold text-white shadow hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300"
                        >
                            Submit Details
                        </button>
                    </div>
                </form>
            </div>

            {/* eslint-disable-next-line react/no-unknown-property */}
            <style jsx global>{`
                .pac-container {
                    z-index: 1000 !important;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .pac-item {
                    font-size: 1rem;
                    padding: 10px;
                    background-color: white;
                }
                .pac-item:hover {
                    background-color: #d1fae5;
                    color: #065f46;
                }
                .pac-matched {
                    font-weight: bold;
                    color: #16a34a;
                }
            `}</style>
        </>
    );
}
