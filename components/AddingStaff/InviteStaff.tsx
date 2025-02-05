'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Invite = {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
};

export default function InviteStaff(): JSX.Element {
    const router = useRouter();
    const [invites, setInvites] = useState<Invite[]>([
        { firstName: '', lastName: '', email: '', role: '' },
    ]);

    const [companyName, setCompanyName] = useState('Your Company');

    useEffect(() => {
        const storedCompany = localStorage.getItem('company_name');
        if (storedCompany) {
            setCompanyName(storedCompany);
        }
    }, []);

    const handleInviteChange = (
        index: number,
        field: keyof Invite,
        value: string
    ) => {
        const newInvites = [...invites];
        newInvites[index][field] = value;
        setInvites(newInvites);
    };

    const handleAddInvite = () => {
        setInvites([
            ...invites,
            { firstName: '', lastName: '', email: '', role: '' },
        ]);
    };

    const handleRemoveInvite = (index: number) => {
        if (invites.length === 1) return;
        setInvites(invites.filter((_, i) => i !== index));
    };

    const handleSkip = () => {
        router.push('/customers');
    };

    const handleSendInvites = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Sending invites:', invites);
        const companyId = localStorage.getItem('company_id');

        try {
            const response = await fetch('/api/send-invite', {
                method: 'POST',
                body: JSON.stringify({ invites, companyName, companyId }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log(data);

            if (data.message) {
                console.log(data.message);
            } else if (data.error) {
                console.error(data.error);
            }

            router.push('/customers');
        } catch (error) {
            console.error('Error sending invites:', error);
        }
    };

    return (
        <div className="w-full max-w-6xl rounded-xl bg-white p-10 shadow-2xl md:p-14">
            <h1 className="mb-3 text-center text-4xl font-extrabold text-green-700 md:mb-5 md:text-5xl">
                Invite Your Team
            </h1>
            <p className="mb-8 text-center text-xl text-gray-600 md:mb-10">
                Enter team member details to send secure invitation links.
            </p>

            <form onSubmit={handleSendInvites} className="space-y-6">
                <div className="max-h-80 space-y-4 overflow-y-auto">
                    {invites.map((invite, index) => (
                        <div
                            key={index}
                            className="relative grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 shadow-sm md:grid-cols-4"
                        >
                            <div className="flex flex-col">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="John"
                                    value={invite.firstName}
                                    onChange={(e) =>
                                        handleInviteChange(
                                            index,
                                            'firstName',
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Doe"
                                    value={invite.lastName}
                                    onChange={(e) =>
                                        handleInviteChange(
                                            index,
                                            'lastName',
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                    Email{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="email@example.com"
                                    value={invite.email}
                                    onChange={(e) =>
                                        handleInviteChange(
                                            index,
                                            'email',
                                            e.target.value
                                        )
                                    }
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={invite.role}
                                    onChange={(e) =>
                                        handleInviteChange(
                                            index,
                                            'role',
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                >
                                    <option value="">Select role</option>
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="driver">Driver</option>
                                    <option value="warehouse">
                                        Warehouse Staff
                                    </option>
                                </select>
                            </div>

                            {invites.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveInvite(index)}
                                    className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white shadow hover:bg-red-700 focus:outline-none"
                                    aria-label="Remove invite"
                                >
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-start">
                    <button
                        type="button"
                        onClick={handleAddInvite}
                        className="flex items-center space-x-2 rounded-lg border border-green-600 px-4 py-2 text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        <span>Add Team Member</span>
                    </button>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={handleSkip}
                        className="rounded-lg border border-gray-300 px-6 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200"
                    >
                        Skip
                    </button>
                    <button
                        type="submit"
                        className="rounded-lg bg-green-600 px-6 py-3 text-lg font-semibold text-white shadow hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300"
                    >
                        Send Invites
                    </button>
                </div>
            </form>
        </div>
    );
}
