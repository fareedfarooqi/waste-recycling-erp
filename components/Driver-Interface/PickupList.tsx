'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/config/supabaseClient';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import PickupForm from './PickupForm';

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

export default function PickupList({ driverId }: { driverId: string }) {
    const [pickups, setPickups] = useState<Pickup[]>([]);
    const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { userRole } = useUserRole();

    const fetchPickups = async () => {
        try {
            setLoading(true);

            let query = supabase
                .from('pickups')
                .select(
                    `
                *,
                customers (id, company_name),
                drivers (id, name)
            `
                )
                .order('pickup_date', { ascending: true });

            if (userRole?.role === 'driver') {
                query = query
                    .eq('driver_id', driverId)
                    .eq('status', 'scheduled');
            } else if (['admin', 'manager'].includes(userRole?.role || '')) {
                query = query.eq('status', 'scheduled');
            }

            const { data, error } = await query;

            if (error) throw error;
            setPickups(data || []);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Unknown error';
            setError(`Failed to fetch pickups: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userRole && (userRole.role !== 'driver' || driverId)) {
            fetchPickups();
        }
    }, [driverId, userRole]);

    // if (loading) return <tr><td colSpan={6}>Loading pickups...</td></tr>;
    if (error)
        return (
            <tr>
                <td colSpan={6} className="text-red-500">
                    {error}
                </td>
            </tr>
        );
    if (pickups.length === 0)
        return (
            <tr>
                <td colSpan={6}>No pickups found</td>
            </tr>
        );

    return (
        <>
            {pickups.map((pickup) => (
                <React.Fragment key={pickup.id}>
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3">{pickup.id}</td>
                        <td className="px-4 py-3">
                            {pickup.customers?.company_name ||
                                'Unknown Company'}
                        </td>
                        <td className="px-4 py-3">
                            {typeof pickup.pickup_location === 'string'
                                ? pickup.pickup_location
                                : pickup.pickup_location.address}
                        </td>
                        <td className="px-4 py-3">
                            {new Date(pickup.pickup_date).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                            {pickup.empty_bins_delivered}
                        </td>
                        <td className="px-4 py-3 text-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedPickup(pickup)}
                                className="mx-auto"
                            >
                                <Eye className="h-7 w-7" />
                            </Button>
                        </td>
                    </tr>
                    {selectedPickup?.id === pickup.id && (
                        <tr>
                            <td colSpan={6} className="p-4">
                                <PickupForm
                                    pickup={selectedPickup}
                                    onComplete={async () => {
                                        await fetchPickups();
                                        setSelectedPickup(null);
                                    }}
                                    viewOnly={userRole?.role !== 'driver'}
                                />
                            </td>
                        </tr>
                    )}
                </React.Fragment>
            ))}
        </>
    );
}
