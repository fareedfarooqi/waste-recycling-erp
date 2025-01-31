'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/config/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import Image from "next/image";
import { useParams } from 'next/navigation';
// import InvoiceStatus from '@/components/InvoiceStatus';
import PickupInfo from '@/components/PickupInfo';
import BinInfo from '@/components/BinInfo';
import CustomerSignature from '@/components/CustomerSignature';

interface Product {
    name: string;
    quantity: number;
}

interface Pickup {
    id: string;
    customer_id: string;
    pickup_location: string;
    pickup_date: string;
    empty_bins_delivered: number;
    filled_bins_collected: number;
    products_collected: Product[];
    status: string;
    signature: string;
}

export default function PickupDetailsPage() {
    const params = useParams();
    const pickupId = params.id as string;

    const [pickup, setPickup] = useState<Pickup | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPickupDetails = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('pickups')
                .select(
                    `
          id,
          customer_id,
          pickup_location,
          pickup_date,
          empty_bins_delivered,
          filled_bins_collected,
          products_collected,
          status,
          signature
        `
                )
                .eq('id', pickupId)
                .single();

            if (error) {
                console.error('Supabase Error:', error);
                setError(`Error fetching pickup: ${error.message}`);
                return;
            }

            if (!data) {
                setError('Pickup not found');
                return;
            }

            console.log('Fetched Data:', data);
            setPickup(data);
        } catch (err) {
            console.error('Unexpected error:', err);
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (pickupId) {
            fetchPickupDetails();
        }
    }, [pickupId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Card className="bg-red-50">
                    <CardContent className="p-6">
                        <h2 className="text-xl font-semibold text-red-700 mb-2">
                            Error
                        </h2>
                        <p className="text-red-600">{error}</p>
                        <Button className="mt-4" onClick={fetchPickupDetails}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!pickup) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-gray-600">
                            No pickup details found.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        Pickup Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {/* Pickup Information */}
                        <PickupInfo pickup={pickup} />

                        {/* Products Collected */}
                        <div>
                            <h3 className="text-xl font-semibold mb-4">
                                Products Collected
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Product Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Quantity (kg)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {pickup.products_collected?.map(
                                            (product, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {product.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {product.quantity}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Bin Information */}
                        <BinInfo
                            emptyBinsDelivered={pickup.empty_bins_delivered}
                            filledBinsCollected={pickup.filled_bins_collected}
                        />

                        {/* Invoice Status */}
                        <div>
                            <h3 className="text-xl font-semibold mb-4">
                                Invoice Status
                            </h3>
                            <Badge
                                className={`px-4 py-2 rounded-full ${
                                    pickup.status?.toLowerCase() === 'paid'
                                        ? 'bg-green-100 text-green-800'
                                        : pickup.status?.toLowerCase() ===
                                            'pending'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : pickup.status?.toLowerCase() ===
                                              'overdue'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {pickup.status}
                            </Badge>
                        </div>

                        {/* Customer Signature */}
                        <CustomerSignature signature={pickup.signature} />

                        {/* Action Buttons */}
                        <div className="flex space-x-4">
                            <Button
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                Back
                            </Button>
                            <Button
                                onClick={() =>
                                    alert('Create Inbound Button clicked')
                                }
                            >
                                Create Inbound
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
