'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/config/supabaseClient';
import ImageModal from '@/components/ImageModal';
import DateFormatter from './DateFormatter';

interface ProductAllocation {
    productId: string;
    quantity: number;
    productName: string;
}

type OutboundContainerItem = {
    id: string;
    status: 'new' | 'packing' | 'sent' | 'invoiced';
    products_allocated: ProductAllocation[] | null;
    container_photo: string;
    created_at: string;
    updated_at: string;
};

interface Props {
    id: string;
}

const ContainerDetails: React.FC<Props> = ({ id }) => {
    const [containerInfo, setContainerInfo] =
        useState<OutboundContainerItem | null>(null);
    const [loadingContainer, setLoadingContainer] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const fetchContainer = async (idParam: string) => {
        try {
            setLoadingContainer(true);
            const { data, error } = await supabase
                .from('containers')
                .select('*')
                .eq('id', idParam)
                .single();

            if (error) throw error;

            setContainerInfo(data as OutboundContainerItem);
            setLoadingContainer(false);
        } catch (err) {
            console.error('Error fetching container:', err);
            setError('Failed to fetch container details.');
            setLoadingContainer(false);
        }
    };

    useEffect(() => {
        fetchContainer(id);
    }, [id]);

    if (loadingContainer) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
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
                    Loading container details...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <p className="text-lg font-bold text-red-500">Error: {error}</p>
            </div>
        );
    }

    if (!containerInfo) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <p className="text-lg font-medium text-gray-600">
                    No container found.
                </p>
            </div>
        );
    }

    const statusColors = {
        new: 'bg-[#ffc8ce]',
        packing: 'bg-[#feeb9c]',
        sent: 'bg-[#c6efcd]',
        invoiced: 'bg-[#bbdefb]',
    };

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-3xl font-bold text-green-700 mb-2">
                        Container Details
                    </h3>
                    <span
                        className={`${statusColors[containerInfo.status]} text-gray-700 px-3 py-1 rounded-full text-sm font-semibold`}
                    >
                        {containerInfo.status.charAt(0).toUpperCase() +
                            containerInfo.status.slice(1)}
                    </span>
                </div>
                {containerInfo.container_photo && (
                    <div className="px-4 py-5 sm:px-6">
                        <img
                            src={
                                containerInfo.container_photo ||
                                '/placeholder.svg'
                            }
                            alt="Container"
                            className="w-full h-64 object-cover rounded-lg shadow-md cursor-pointer"
                            onClick={() => setIsImageModalOpen(true)}
                        />
                    </div>
                )}
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                ID
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {containerInfo.id}
                            </dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Status
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {containerInfo.status.charAt(0).toUpperCase() +
                                    containerInfo.status.slice(1)}
                            </dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Created At
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {
                                    <DateFormatter
                                        date={containerInfo.created_at}
                                    />
                                }
                            </dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Updated At
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {
                                    <DateFormatter
                                        date={containerInfo.updated_at}
                                    />
                                }
                            </dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Allocated Products
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {Array.isArray(
                                    containerInfo.products_allocated
                                ) &&
                                containerInfo.products_allocated.length > 0 ? (
                                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                                        {containerInfo.products_allocated.map(
                                            (product, index) => (
                                                <li
                                                    key={index}
                                                    className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                                                >
                                                    <div className="w-0 flex-1 flex items-center">
                                                        <span className="ml-2 flex-1 w-0 truncate">
                                                            {
                                                                product.productName
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="ml-4 flex-shrink-0">
                                                        <span className="font-medium">
                                                            Quantity:{' '}
                                                            {product.quantity}
                                                        </span>
                                                    </div>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                ) : (
                                    <p>No products allocated</p>
                                )}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
            <div className="mt-8 flex justify-center">
                <button
                    onClick={() => window.history.back()}
                    className="px-6 py-3 bg-green-600 text-white font-medium text-lg rounded-lg shadow hover:bg-green-700 transition"
                >
                    Back
                </button>
            </div>
            {isImageModalOpen && containerInfo.container_photo && (
                <ImageModal
                    imageUrl={containerInfo.container_photo}
                    alt="Container"
                    onClose={() => setIsImageModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ContainerDetails;
