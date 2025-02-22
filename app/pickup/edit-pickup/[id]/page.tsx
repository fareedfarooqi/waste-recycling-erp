'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/config/supabaseClient'; // Import Supabase client
import AddEditPickupModal from '@/components/EditPickupModal';
import { useUserRole } from '@/hooks/useUserRole';

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
    id: string;
    contact_details: string;
    name: string;
};

type Pickup = {
    id: string;
    driver: DriverDetails;
    pickup_date: string;
    locations: PickupLocation[];
    status: string;
};

export type PickupItems = {
    id: string;
    customer_id: string;
    pickup_location: {
        location_name: string;
        address: string;
        initial_empty_bins: number;
        default_product_types: { description: string; product_name: string }[];
    };
    pickup_date: string;
    assigned_driver: string;
    empty_bins_delivered: number;
    filled_bins_collected: number;
    products_collected: string;
    driver_id: string;
};

const EditPickupPage: React.FC = () => {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const [pickupItem, setPickupItem] = useState<PickupItems | null>(null);
    const { userRole, loading: roleLoading } = useUserRole();
    const canEditPickup = userRole?.permissions.edit_pickup || false;

    useEffect(() => {
        const fetchPickupItem = async () => {
            // Fetch the pickup item directly from Supabase
            const { data, error } = await supabase
                .from('pickups')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                setPickupItem(data);
            }

            if (error) {
                console.error('Error fetching pickup item:', error);
                router.push('/pickup');
            }
        };

        if (id) {
            fetchPickupItem();
        }
    }, [id, router]);

    const handleClose = () => {
        router.push('/pickup');
    };

    const handleRefresh = () => {
        router.push('/pickup');
    };

    return (
        <div className="min-h-screen">
            {pickupItem && (
                <AddEditPickupModal
                    isOpen={true}
                    item={pickupItem}
                    edit_pickup={canEditPickup}
                    onClose={handleClose}
                    onRefresh={handleRefresh}
                />
            )}
        </div>
    );
};

export default EditPickupPage;
