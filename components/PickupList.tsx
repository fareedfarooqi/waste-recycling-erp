'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/config/supabaseClient';
import { Card } from '@/components/ui/card';
import PickupForm from './PickupForm';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
// Updated interfaces to match the actual data structure
interface Product {
    quantity: number;
    product_name: string;
}

interface Location {
    id: string;
    address: string;
    location_name: string;
    initial_empty_bins: number;
    default_product_types: Product[];
}

interface Customer {
    id: string;
    company_name: string;
    locations?: Location[];
}

export interface Pickup {
    id: string;
    customer_id: string;
    pickup_location: string | Location;
    pickup_date: string;
    empty_bins_delivered: number;
    filled_bins_collected: number;
    products_collected: number | Product[];
    status: string;
    signature: string | null;
    driver_id: string;
    created_at: string;
    updated_at: string;
    customers?: Customer | null;
    drivers?: {
        id: string;
        name: string;
    } | null;
}

interface PickupCardProps {
    pickup: Pickup;
    onSelect: () => void;
}

function formatProducts(products: number | Product[] | null): string {
    if (products === null) return '0';
    if (typeof products === 'number') return `${products} kg`;
    if (Array.isArray(products)) {
        return products
            .map((p) => `${p.product_name}: ${p.quantity}`)
            .join(', ');
    }
    return '0';
}

function formatLocation(location: string | Location | null): string {
    if (!location) return 'Unknown Location';
    if (typeof location === 'string') return location;
    return location.location_name || 'Unknown Location';
}

function PickupCard({ pickup, onSelect }: PickupCardProps) {
    const locationDisplay = formatLocation(pickup.pickup_location);
    const productsDisplay = formatProducts(pickup.products_collected);

    const formattedDate = pickup.pickup_date
        ? new Date(pickup.pickup_date).toLocaleDateString()
        : 'No date';

    return (
        <Card
            className="p-4 cursor-pointer hover:bg-gray-50"
            onClick={onSelect}
        >
            <div className="flex flex-col sm:flex-row justify-between">
                <div>
                    <h3 className="font-medium">
                        {pickup.customers?.company_name || 'Unknown Company'}
                    </h3>
                    <p className="text-sm text-gray-600">
                        Location: {locationDisplay}
                    </p>
                    <p className="text-sm text-gray-600">
                        Date: {formattedDate}
                    </p>
                </div>
                <div className="mt-2 text-sm sm:mt-0 sm:text-right">
                    <p>Products: {productsDisplay}</p>
                    <p>
                        Empty Bins Delivered: {pickup.empty_bins_delivered || 0}
                    </p>
                    <p>
                        Filled Bins Collected:{' '}
                        {pickup.filled_bins_collected || 0}
                    </p>
                </div>
            </div>
        </Card>
    );
}

export default function PickupList({ driverId }: { driverId: string }) {
    const [pickups, setPickups] = useState<Pickup[]>([]);
    const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchPickups = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('pickups')
                .select(
                    `
          *,
          customers (
            id,
            company_name
          ),
          drivers (
            id,
            name
          )
        `
                )
                .eq('status', 'scheduled')
                .eq('driver_id', driverId)
                .order('pickup_date', { ascending: true });

            if (error) throw error;

            setPickups(data || []);
        } catch (err) {
            console.error('Error fetching pickups:', err);
            setError(`Failed to fetch pickups: ${(err as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (driverId) {
            fetchPickups();
        }
    }, [driverId]);

    if (loading) {
        return (
            <tr>
                <td colSpan={7} className="px-4 py-3 text-center">
                    Loading pickups...
                </td>
            </tr>
        );
    }

    if (error) {
        return (
            <tr>
                <td colSpan={7} className="px-4 py-3 text-center text-red-600">
                    Error: {error}
                    <Button
                        onClick={fetchPickups}
                        className="ml-2 text-blue-600 underline"
                    >
                        Retry
                    </Button>
                </td>
            </tr>
        );
    }

    if (pickups.length === 0) {
        return (
            <tr>
                <td colSpan={7} className="px-4 py-3 text-center">
                    No pending pickups found
                </td>
            </tr>
        );
    }

    return (
        <>
            {pickups.map((pickup) => (
                <tr
                    key={pickup.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                >
                    <td className="px-4 py-3 text-sm">{pickup.id}</td>
                    <td className="px-4 py-3">
                        {pickup.customers?.company_name || 'Unknown Company'}
                    </td>
                    <td className="px-4 py-3">
                        {formatLocation(pickup.pickup_location)}
                    </td>
                    <td className="px-4 py-3">
                        {new Date(pickup.pickup_date).toLocaleString()}
                    </td>

                    <td className="px-4 py-3">
                        {pickup.drivers?.name || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 text-center">
                        {pickup.empty_bins_delivered}
                    </td>
                    <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedPickup(pickup)}
                            >
                                <Eye className="h-7 w-7" />
                            </Button>
                        </div>
                    </td>
                </tr>
            ))}
            {selectedPickup && (
                <tr>
                    <td colSpan={7} className="px-4 py-3">
                        <PickupForm
                            pickup={selectedPickup}
                            onComplete={async () => {
                                await fetchPickups();
                                setSelectedPickup(null);
                            }}
                        />
                    </td>
                </tr>
            )}
        </>
    );
}
