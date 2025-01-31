'use client';

import { supabase } from '@/config/supabaseClient';
import BinInfo from '@/components/BinInfo';
import CustomerSignature from '@/components/CustomerSignature';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
// import Image from 'next/image';

import SidebarSmall from '@/components/SidebarSmall';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/context/SidebarContext';

interface Location {
    address: string;
    location_name: string;
    initial_empty_bins: number;
    default_product_types: string[];
}

interface PickupData {
    id: number;
    pickup_location: Location;
    pickup_date: string;
    empty_bins_delivered: number;
    filled_bins_collected: number;
    products_collected: Product[];
    status: string;
    signature: string | null;
    customer: { company_name: string } | null;
    driver: { name: string } | null;
}

interface Product {
    product_name: string;
    quantity: number;
}

export default function PickupDetailsPage() {
    const searchParams = useSearchParams();
    const pickupId = searchParams.get('id');

    const [pickup, setPickup] = useState<PickupData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { isSidebarOpen } = useSidebar();

    useEffect(() => {
        const fetchPickupDetails = async () => {
            if (!pickupId) {
                setError('Pickup ID is required');
                setIsLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('pickups')
                    .select(
                        `
            id, 
            pickup_location,
            pickup_date,
            empty_bins_delivered,
            filled_bins_collected,
            products_collected,
            status,
            signature,
            customer:customer_id(company_name),
            driver:driver_id(name)
          `
                    )
                    .eq('id', pickupId)
                    .single();

                if (error) throw error;

                const processedProducts = data.products_collected.map(
                    (product: Product) => ({
                        product_name:
                            product.product_name || 'Product Name Missing',
                        quantity: product.quantity || 0,
                    })
                );

                const customer = Array.isArray(data.customer)
                    ? data.customer[0]
                    : data.customer;
                const driver = Array.isArray(data.driver)
                    ? data.driver[0]
                    : data.driver;

                if (data) {
                    setPickup({
                        ...data,
                        products_collected: processedProducts,
                        customer: customer
                            ? { company_name: customer.company_name }
                            : null,
                        driver: driver ? { name: driver.name } : null,
                    });
                } else {
                    setError('Pickup not found');
                }
            } catch (err: unknown) {
                if (err instanceof Error) {
                    console.error('Error fetching pickup:', err.message);
                } else {
                    console.error('An unexpected error occurred');
                }
                setError('Failed to load pickup details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPickupDetails();
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
                <p className="text-red-600">Error: {error}</p>
                <Link href="/pickup">
                    <Button variant="outline" className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </Link>
            </div>
        );
    }

    if (!pickup) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <p>No pickup data found</p>
                <Link href="/pickup">
                    <Button variant="outline" className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </Link>
            </div>
        );
    }

    const locationDisplay = pickup.pickup_location.location_name
        ? `${pickup.pickup_location.location_name} - ${pickup.pickup_location.address}`
        : pickup.pickup_location.address;

    return (
        <div className="flex gap-2">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}
            <div className="flex-grow">
                <div className="flex justify-between items-center">
                    <Link href="/pickup">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    </Link>
                    <Button className="bg-green-500 text-white hover:bg-green-600">
                        <FileText className="mr-2 h-4 w-4" /> Create Inbound
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Pickup Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <strong>Pickup ID:</strong> {pickup.id}
                            </div>
                            <div>
                                <strong>Customer Name:</strong>{' '}
                                {pickup.customer?.company_name ?? 'N/A'}
                            </div>
                            <div>
                                <strong>Pickup Location:</strong>{' '}
                                {locationDisplay}
                            </div>
                            <div>
                                <strong>Date & Time:</strong>{' '}
                                {new Date(pickup.pickup_date).toLocaleString()}
                            </div>
                            <div>
                                <strong>Status:</strong> {pickup.status}
                            </div>
                            <div>
                                <strong>Driver:</strong>{' '}
                                {pickup.driver?.name || 'N/A'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <BinInfo
                    emptyBinsDelivered={pickup.empty_bins_delivered}
                    filledBinsCollected={pickup.filled_bins_collected}
                />
                <CustomerSignature signature={pickup.signature} />
            </div>
        </div>
    );
}
