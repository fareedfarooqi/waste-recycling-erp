'use client';
import { supabase } from '@/config/supabaseClient';
import BinInfo from '@/components/BinInfo';
import CustomerSignature from '@/components/CustomerSignature';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
    ArrowLeft,
    FileText,
    Truck,
    Calendar,
    UserCircle,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SidebarSmall from '@/components/Sidebar/SidebarSmall';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useSidebar } from '@/components/Sidebar/SidebarContext';

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
    invoice_status: string | null;
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
            invoice_status, 
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

    const handleCreateInbound = async () => {
        if (!pickup) return;

        try {
            // Step 1: Get product UUIDs for the collected products
            const productIds = await Promise.all(
                pickup.products_collected.map(async (product) => {
                    const { data: productData, error: productError } =
                        await supabase
                            .from('products')
                            .select('id') // Assuming 'id' is the UUID for the product
                            .eq('name', product.product_name) // Match product name
                            .single(); // Ensure a single result is returned

                    if (productError) {
                        throw new Error(
                            `Error fetching product ID for ${product.product_name}: ${productError.message}`
                        );
                    }

                    return productData ? productData.id : null; // Return UUID or null if not found
                })
            );

            // Filter out any products that don't have a valid product ID
            const inboundProductLogs = productIds
                .filter((id) => id !== null)
                .map((productId, index) => ({
                    product_id: productId, // Use the fetched UUID here
                    provider_id: pickup.customer?.company_name || null,
                    quantity_received:
                        pickup.products_collected[index].quantity,
                    invoice_required: true,
                    created_at: new Date(),
                }));

            if (inboundProductLogs.length === 0) {
                throw new Error('No valid products found for inbound process.');
            }

            // Insert the inbound product logs
            const { error: inboundError } = await supabase
                .from('inbound_product_logging')
                .insert(inboundProductLogs);

            if (inboundError) throw inboundError;

            // Step 2: Update the Pickup record
            const { error: pickupError } = await supabase
                .from('pickups')
                .update({
                    status: 'completed',
                    invoice_status: 'invoiced',
                })
                .eq('id', pickup.id);

            if (pickupError) throw pickupError;

            // Optionally, show a success message or toast
            window.location.reload();
        } catch (err: unknown) {
            // Log the full error object
            console.error(
                'Unexpected error during inbound process:',
                JSON.stringify(err, null, 2)
            );

            if (err && typeof err === 'object') {
                const errorDetails = err as {
                    message?: string;
                    details?: string;
                };
                if (errorDetails.message) {
                    console.error('Error message:', errorDetails.message);
                }
                if (errorDetails.details) {
                    console.error('Error details:', errorDetails.details);
                }
            } else {
                console.error(
                    'Error is not an object or has no message property'
                );
            }
        }
    };

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
                    <Button variant="outline" className="mt-4 gray-200">
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
        <div className="flex gap-2 bg-green-100">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}
            <div className="flex-grow">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex w-full">
                        <Link href="/pickup">
                            <Button
                                onClick={() => window.history.back()}
                                className="flex items-center px-5 py-3 bg-white text-gray-700 rounded-r-lg text-base font-medium shadow-md hover:bg-gray-300 transition -ml-4"
                            >
                                <ArrowLeft className="mr-2" />
                                Back
                            </Button>
                        </Link>
                    </div>
                    <div className="flex justify-end w-full">
                        <Button
                            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-l-lg text-base font-semibold shadow-md hover:bg-green-700 transition -mr-3"
                            onClick={handleCreateInbound}
                        >
                            <FileText className="h-5 w-5" />
                            Invoice
                        </Button>
                    </div>
                </div>

                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle>
                            <Truck className="mr-2 h-6 w-6 inline-block align-middle" />{' '}
                            Pickup Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <strong>Pickup ID:</strong> {pickup.id}
                            </div>
                            <div>
                                <strong>Customer Name:</strong>{' '}
                                <UserCircle className="mr-2 h-5 w-5 inline-block align-middle" />
                                {pickup.customer?.company_name ?? 'N/A'}
                            </div>
                            <div>
                                <strong>Pickup Location:</strong>{' '}
                                <span className="inline-flex items-center">
                                    <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
                                    {locationDisplay}
                                </span>
                            </div>
                            <div>
                                <strong>Date & Time:</strong>{' '}
                                <Calendar className="mr-2 h-5 w-5 inline-block align-middle" />
                                {new Date(pickup.pickup_date).toLocaleString()}
                            </div>
                            <div>
                                <strong>Status:</strong>{' '}
                                {pickup.status === 'completed' ? (
                                    <CheckCircle className="mr-2 h-5 w-5 inline-block align-middle text-green-500" />
                                ) : (
                                    <XCircle className="mr-2 h-5 w-5 inline-block align-middle text-red-500" />
                                )}
                                {pickup.status}
                            </div>
                            <div>
                                <strong>Driver:</strong>{' '}
                                <UserCircle className="mr-2 h-5 w-5 inline-block align-middle" />
                                {pickup.driver?.name || 'N/A'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <BinInfo
                    emptyBinsDelivered={pickup.empty_bins_delivered}
                    filledBinsCollected={pickup.filled_bins_collected}
                />

                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle>
                            <FileText className="mr-2 h-6 w-6 inline-block align-middle" />{' '}
                            Invoice Status (via Xero)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge
                            variant={
                                pickup.invoice_status === 'Paid'
                                    ? 'default'
                                    : pickup.invoice_status === 'Overdue'
                                      ? 'destructive'
                                      : 'secondary'
                            }
                            style={
                                pickup.invoice_status === 'Pending'
                                    ? {
                                          backgroundColor: '#feeb9c',
                                          borderColor: '#ff9800',
                                      }
                                    : {}
                            }
                        >
                            {pickup.invoice_status || 'Pending'}
                        </Badge>
                    </CardContent>
                </Card>

                <CustomerSignature signature={pickup.signature} />
            </div>
        </div>
    );
}
