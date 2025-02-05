'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/config/supabaseClient';

import { useRouter } from 'next/navigation'; // Import useRouter
import { FaEye } from 'react-icons/fa'; // Import the eye icon
import DateFormatter from './DateFormatter';
import Link from 'next/link';
import { IoMdClose } from 'react-icons/io';

type ProductDetail = {
    id: string;
    product_name: string;
    product_description: string;
    quantity: number;
};

type Bin = {
    bin_type: string;
    capacity: number;
    current_fill_level: number;
};

type PickupLocation = {
    location_name: string;
    address: string;
    scheduled_time: string;
    bins: Bin[];
};

type DriverDetails = {
    name: string;
    contact_details: {
        email: string;
        phone: string;
    };
};

type Pickup = {
    id: string;
    driver: DriverDetails;
    pickup_date: string;
    locations: PickupLocation[];
    status: string;
};

type PickupModalProps = {
    isOpen: boolean;
    pickup: Partial<Pickup>;
    onClose: () => void;
};

const PickupViewModal: React.FC<PickupModalProps> = ({
    isOpen,
    pickup,
    onClose,
}) => {
    const router = useRouter();
    const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);

    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!isOpen || !pickup.id) return;

            console.log('Fetching product details for pickup ID:', pickup.id);

            try {
                const { data, error } = await supabase
                    .from('pickups')
                    .select('products_collected')
                    .eq('id', pickup.id)
                    .single();

                if (error) throw error;

                console.log(
                    'Raw products_collected data:',
                    data?.products_collected
                );

                // Ensure products_collected is properly handled
                const productsCollected: ProductDetail[] = Array.isArray(
                    data?.products_collected
                )
                    ? data.products_collected
                    : JSON.parse(data?.products_collected || '[]');
                //                 let productsCollected: ProductDetail[] = [];

                // if (Array.isArray(data?.products_collected)) {
                //   productsCollected = data.products_collected;
                // } else if (typeof data?.products_collected === 'string') {
                //   try {
                //     productsCollected = JSON.parse(data.products_collected);
                //   } catch (error) {
                //     console.error('Error parsing products_collected:', error);
                //     productsCollected = [];
                //   }
                // }

                if (!productsCollected || productsCollected.length === 0) {
                    console.error('No products collected:', productsCollected);
                    setProductDetails([]);
                    return;
                }

                // Map the collected products to the expected structure
                const processedProducts: ProductDetail[] =
                    productsCollected.map((product) => ({
                        id: product.id || '', // Defaulting to an empty string if id is missing
                        product_name: product.product_name,
                        product_description: product.product_description || '', // Default if missing
                        quantity: product.quantity,
                    }));

                console.log('Processed products:', processedProducts);
                setProductDetails(processedProducts);
            } catch (error) {
                console.error('Error fetching product details:', error);
            }
        };

        fetchProductDetails();
    }, [isOpen, pickup.id]);

    const handleViewDetails = () => {
        // Navigate to the pickup details page with the pickup ID
        router.push(`/pickup/details-screen`);
        onClose(); // Close the modal
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-gray-700 bg-opacity-50 z-50 flex justify-center items-center"
            onClick={onClose}
        >
            <div
                className="bg-white w-[90%] max-w-xl rounded-md p-6 font-sans shadow-lg relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-3xl font-bold text-center mb-4">
                    Pickup Details
                </h3>
                <div>
                    {/* <p>
                        <strong>Pickup Date: </strong>
                        {pickup.pickup_date
                            ? new Intl.DateTimeFormat('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true,
                              }).format(new Date(pickup.pickup_date))
                            : 'N/A'}
                    </p> */}
                    <p>
                        <strong>Pickup Date:</strong>{' '}
                        {pickup.pickup_date ? (
                            <DateFormatter date={pickup.pickup_date} />
                        ) : (
                            'N/A'
                        )}
                    </p>
                    <p>
                        <strong>Status: </strong>
                        {pickup.status || 'N/A'}
                    </p>

                    {/* Driver Details Section */}
                    <div className="mt-4">
                        <h4 className="font-bold mb-2">Driver Details</h4>
                        <p>
                            <strong>Name: </strong>
                            {pickup.driver?.name || 'N/A'}
                        </p>
                        <p>
                            <strong>Phone: </strong>
                            {pickup.driver?.contact_details?.phone || 'N/A'}
                        </p>
                        <p>
                            <strong>Email: </strong>
                            {pickup.driver?.contact_details?.email || 'N/A'}
                        </p>
                    </div>

                    {/* Products Collected Section */}
                    <div className="mt-4 p-4 rounded-md">
                        <h4 className="font-bold mb-2">Products Collected</h4>
                        {productDetails.length > 0 ? (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-green-600">
                                        <th className="border p-2 text-left text-white">
                                            Product Name
                                        </th>
                                        <th className="border p-2 text-right text-white">
                                            Quantity
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productDetails.map((product, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-100"
                                        >
                                            <td className="border p-2">
                                                {product.product_name}
                                            </td>
                                            <td className="border p-2 text-right">
                                                {product.quantity}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No products collected in this pickup.</p>
                        )}
                    </div>

                    {/* Locations Section */}
                    <div className="mt-4">
                        <h4 className="font-bold mb-2">Pickup Locations</h4>
                        {pickup.locations && pickup.locations.length > 0 ? (
                            <ul className="space-y-4">
                                {pickup.locations.map((location, index) => (
                                    <li key={index} className="">
                                        <p>
                                            <strong>Location Name:</strong>{' '}
                                            {location.location_name || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>Address:</strong>{' '}
                                            {location.address || 'N/A'}
                                        </p>
                                        {/* <p><strong>Scheduled Time:</strong> {location.scheduled_time || 'N/A'}</p> */}
                                        {/* <p>
    <strong>Scheduled Time:</strong>{' '}
    {location.scheduled_time ? (
        <DateFormatter date={location.scheduled_time} />
    ) : (
        'N/A'
    )}
</p> */}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No locations available.</p>
                        )}
                    </div>
                </div>

                {/* <button
                    className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={onClose}
                >
                    Close
                </button> */}
                <div className="flex justify-between mt-3 space-x-4">
                    <button
                        className="mt-6 px-8 py-3  bg-red-500 text-white rounded font-bold hover:bg-red-600 focus:ring-red-300"
                        onClick={onClose}
                    >
                        Close
                    </button>
                    {/* <button
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                        onClick={handleViewDetails}
                    >
                        <FaEye className="mr-2" /> View Details
                    </button> */}
                    <Link href={`/pickup/details-screen?id=${pickup.id}`}>
                        <button className="mt-6 px-8 py-3 bg-green-600 text-white rounded hover:bg-green-500 focus:ring-green-500 flex items-center">
                            <FaEye className="mr-2" /> View Details
                        </button>
                    </Link>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-red-700"
                        aria-label="Close"
                    >
                        <IoMdClose size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PickupViewModal;
