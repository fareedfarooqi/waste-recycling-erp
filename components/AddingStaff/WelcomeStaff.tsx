'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiArrowRight } from 'react-icons/fi';

export default function WelcomeStaff(): JSX.Element {
    const router = useRouter();
    const searchParams = useSearchParams();

    const token = searchParams?.get('token');

    const handleNext = () => {
        router.push(`/staff/setup-password?token=${token}`);
    };

    return (
        <div className="w-full max-w-2xl rounded-xl border border-gray-100 bg-white p-8 shadow-2xl md:p-12">
            <h1 className="mb-4 text-center text-4xl font-extrabold text-green-700 md:mb-6 md:text-5xl">
                Welcome Aboard!
            </h1>
            <p className="mx-auto mb-8 max-w-md text-center text-base leading-relaxed text-gray-600 md:mb-10 md:text-lg">
                We’re excited to have you join our mission to revolutionise
                waste management. Our platform is built with the tools you need
                to excel in your role.
            </p>
            <p className="mx-auto mb-8 max-w-md text-center text-base leading-relaxed text-gray-600 md:mb-12 md:text-lg">
                In just a few quick steps, you’ll be able to set up your account
                and start exploring everything we have to offer. Ready to get
                started?
            </p>
            <div className="flex justify-center">
                <button
                    onClick={handleNext}
                    className="inline-flex items-center justify-center rounded-md bg-green-600 px-6 py-3 text-base font-semibold text-white shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                    Set Up Your Password
                    <FiArrowRight className="ml-2 h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
