'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ContactDetailsBox from './ContactDetailsBox';
import PickupLocationsGrid from './PickupLocationsGrid';
import InboundProductsTable from './InboundProductsTable';
import PickupsTable from './PickupsTable';

type ProductType = {
    product_name: string;
    description: string;
};

type Location = {
    location_name: string;
    address: string;
    initial_empty_bins: string;
    default_product_types: ProductType[];
};

type ContactDetails = {
    email: string;
    phone: string;
    address: string;
};

type CustomerInfo = {
    id: string;
    company_name: string;
    slug: string;
    contact_details: ContactDetails;
    locations: Location[];
};

type Pickup = {
    id: string;
    pickup_location: string;
    pickup_date: string;
    empty_bins_delivered: number;
    filled_bins_collected: number;
};

type InboundProduct = {
    product_name: string;
    quantity_received: number;
    date_received: string;
    pickup_docket_id: string | null;
};

interface SupabasePickupRow {
    id: string;
    pickup_location: {
        location_name: string;
    };
    pickup_date: string;
    empty_bins_delivered: number;
    filled_bins_collected: number;
}

interface SupabaseInboundRow {
    product_id: string;
    quantity_received: number;
    created_at: string;
    provider_id: string;
    pickup_id: string | null;
}

interface SupabaseProductRow {
    id: string;
    product_name: string;
}

interface Props {
    slug: string;
}

const CustomerDetails: React.FC<Props> = ({ slug }) => {
    const supabase = createClientComponentClient();
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [pickups, setPickups] = useState<Pickup[]>([]);
    const [inboundProducts, setInboundProducts] = useState<InboundProduct[]>(
        []
    );
    const [loadingCustomer, setLoadingCustomer] = useState(true);
    const [loadingPickups, setLoadingPickups] = useState(true);
    const [loadingInboundProducts, setLoadingInboundProducts] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchCustomer = async (slugParam: string) => {
        try {
            setLoadingCustomer(true);
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('slug', slugParam)
                .single();

            if (error) throw error;

            setCustomerInfo(data as CustomerInfo);
            setLoadingCustomer(false);

            if (data?.id) {
                fetchPickups(data.id);
                fetchInboundProducts(data.id);
            }
        } catch (err) {
            console.error('Error fetching customer:', err);
            setError('Failed to fetch customer details.');
            setLoadingCustomer(false);
        }
    };

    const fetchPickups = async (customerId: string) => {
        try {
            setLoadingPickups(true);
            const { data, error } = await supabase
                .from('pickups')
                .select(
                    `
          id,
          pickup_location,
          pickup_date,
          empty_bins_delivered,
          filled_bins_collected
        `
                )
                .eq('customer_id', customerId);

            if (error) throw error;

            const rows = (data || []) as SupabasePickupRow[];

            const transformed = rows.map((row) => ({
                id: row.id,
                pickup_location: row.pickup_location.location_name,
                pickup_date: row.pickup_date,
                empty_bins_delivered: row.empty_bins_delivered,
                filled_bins_collected: row.filled_bins_collected,
            }));

            setPickups(transformed);
        } catch (err) {
            console.error('Error fetching pickups:', err);
            setError('Failed to fetch pickups.');
        } finally {
            setLoadingPickups(false);
        }
    };

    const fetchInboundProducts = async (customerId: string) => {
        try {
            setLoadingInboundProducts(true);

            const { data: inboundData, error: inboundError } = await supabase
                .from('inbound_product_logging')
                .select(
                    'product_id, quantity_received, created_at, provider_id, pickup_id'
                )
                .eq('provider_id', customerId);

            if (inboundError) throw inboundError;

            const { data: productData, error: productError } = await supabase
                .from('products')
                .select('id, product_name');

            if (productError) throw productError;

            const { data: pickupData, error: pickupError } = await supabase
                .from('pickups')
                .select('id');

            if (pickupError) throw pickupError;

            const inboundRows = (inboundData || []) as SupabaseInboundRow[];
            const products = (productData || []) as SupabaseProductRow[];
            const pickupsRaw = (pickupData || []) as { id: string }[];

            const transformed = inboundRows.map((inbound) => {
                const productMatch = products.find(
                    (p) => p.id === inbound.product_id
                );
                const pickupMatch = pickupsRaw.find(
                    (pk) => pk.id === inbound.pickup_id
                );

                return {
                    product_name:
                        productMatch?.product_name || 'Unknown Product',
                    quantity_received: inbound.quantity_received,
                    date_received: inbound.created_at,
                    pickup_docket_id: pickupMatch ? pickupMatch.id : null,
                };
            });

            setInboundProducts(transformed);
        } catch (err) {
            console.error('Error fetching inbound products:', err);
            setError('Failed to fetch inbound products.');
        } finally {
            setLoadingInboundProducts(false);
        }
    };

    useEffect(() => {
        fetchCustomer(slug);
    }, [slug]);

    if (loadingCustomer) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <p className="text-lg font-medium text-gray-600">
                    Loading customer details...
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

    if (!customerInfo) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <p className="text-lg font-medium text-gray-600">
                    No customer found.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-10">
            <h1 className="text-5xl font-extrabold text-green-700 mb-10 text-center">
                {customerInfo.company_name}
            </h1>

            <ContactDetailsBox contactDetails={customerInfo.contact_details} />

            <PickupLocationsGrid locations={customerInfo.locations} />

            <h2 className="text-3xl font-semibold text-green-600 mb-5 text-center mt-10">
                Bin Movement History
            </h2>
            <PickupsTable pickups={pickups} loading={loadingPickups} />

            <h2 className="text-3xl font-semibold text-green-600 mb-5 text-center mt-10">
                Inbound Products
            </h2>
            <InboundProductsTable
                inboundProducts={inboundProducts}
                loading={loadingInboundProducts}
            />

            <div className="mt-10 flex justify-center">
                <button
                    onClick={() => window.history.back()}
                    className="px-6 py-3 bg-green-600 text-white font-medium text-lg rounded-lg shadow hover:bg-green-700 transition"
                >
                    Back
                </button>
            </div>
        </div>
    );
};

export default CustomerDetails;
