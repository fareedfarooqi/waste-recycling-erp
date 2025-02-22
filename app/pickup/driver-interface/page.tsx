'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PickupList from '@/components/PickupList';
import { supabase } from '@/config/supabaseClient';
import { Truck, Calendar, ArrowLeft } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import Link from 'next/link';

// Define interfaces for type safety
interface Pickup {
    id: string;
    customer_id: string;
    pickup_location: string;
    pickup_date: string;
    empty_bins_delivered: number;
    filled_bins_collected: number;
    products_collected: Product[];
    status: string;
    signature: string | null;
    driver_id: string;
    created_at: string;
    updated_at: string;
}

interface Product {
    product_name: string;
    quantity: number;
}

export default function DriverInterfacePage() {
    const [pickups, setPickups] = useState<Pickup[]>([]);
    const [scheduledPickups, setScheduledPickups] = useState<Pickup[]>([]);
    const [driverId, setDriverId] = useState<string | null>(null);
    const { userRole, loading } = useUserRole();

    useEffect(() => {
        const fetchUserAndRole = async () => {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) {
                    console.error('No authenticated user found');
                    return;
                }

                // For admin/manager, we don't need to set a specific driverId
                if (
                    userRole?.role === 'admin' ||
                    userRole?.role === 'manager'
                ) {
                    setDriverId(null);
                    return;
                }

                // For drivers, we need to set their specific driverId
                if (userRole?.role === 'driver') {
                    const { data: driverData, error: driverError } =
                        await supabase
                            .from('drivers')
                            .select('id')
                            .eq('user_id', user.id)
                            .single();

                    if (driverError) {
                        console.error('Error fetching driver ID:', driverError);
                        return;
                    }

                    setDriverId(driverData.id); // Use the correct driver ID from the drivers table
                }
            } catch (error) {
                console.error('Error in fetchUserAndRole:', error);
            }
        };

        if (userRole) {
            fetchUserAndRole();
        }
    }, [userRole]);

    useEffect(() => {
        const fetchPickups = async () => {
            try {
                let completedQuery = supabase
                    .from('pickups')
                    .select('*')
                    .eq('status', 'completed');

                let scheduledQuery = supabase
                    .from('pickups')
                    .select('*')
                    .eq('status', 'scheduled');

                // Only filter by driver_id if user is a driver
                if (userRole?.role === 'driver' && driverId) {
                    completedQuery = completedQuery.eq('driver_id', driverId);
                    scheduledQuery = scheduledQuery.eq('driver_id', driverId);
                }

                const [completedResult, scheduledResult] = await Promise.all([
                    completedQuery,
                    scheduledQuery,
                ]);

                if (completedResult.error) throw completedResult.error;
                if (scheduledResult.error) throw scheduledResult.error;

                setPickups((completedResult.data as Pickup[]) || []);
                setScheduledPickups((scheduledResult.data as Pickup[]) || []);
            } catch (error) {
                console.error('Error fetching pickups:', error);
            }
        };

        // Fetch pickups if we have role information and either:
        // 1. User is admin/manager
        // 2. User is driver and we have their driverId
        if (
            userRole &&
            (['admin', 'manager'].includes(userRole.role) ||
                (userRole.role === 'driver' && driverId))
        ) {
            fetchPickups();
        }
    }, [driverId, userRole]);

    if (!userRole) {
        // return <div className="flex justify-center items-center min-h-screen">
        //     {/* <div className="text-xl text-red-600">Access denied. Please log in.</div> */}
        // </div>;
        return;
    }

    // Get the effective driver ID based on role
    const effectiveDriverId = userRole.role === 'driver' ? driverId || '' : '';

    return (
        <div className="flex flex-col items-center min-h-screen bg-green-50 p-3">
            {/* Back Button - Only shown for admin/manager */}
            {['admin', 'manager'].includes(userRole.role) && (
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
            )}

            <div className="container mx-auto px-4 py-6 w-full">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                    <Card className="bg-white shadow-md rounded-xl p-4">
                        <CardHeader className="flex items-center space-x-3">
                            <Truck className="h-6 w-6 text-green-600" />
                            <CardTitle className="text-lg font-semibold text-gray-800">
                                Pickups Completed
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center">
                            <div className="text-3xl font-bold text-gray-900">
                                {pickups.length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-md rounded-xl p-4">
                        <CardHeader className="flex items-center space-x-3">
                            <Calendar className="h-6 w-6 text-green-600" />
                            <CardTitle className="text-lg font-semibold text-gray-800">
                                Pickups Scheduled
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center">
                            <div className="text-3xl font-bold text-gray-900">
                                {scheduledPickups.length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pickups Table */}
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-green-600 text-white">
                                <th className="px-4 py-3 text-left">
                                    Pickup ID
                                </th>
                                <th className="px-4 py-3 text-left">
                                    Customer Name
                                </th>
                                <th className="px-4 py-3 text-left">
                                    Pickup Location
                                </th>
                                <th className="px-4 py-3 text-left">
                                    Scheduled Date & Time
                                </th>
                                <th className="px-4 py-3 text-center">
                                    Bins to Deliver
                                </th>
                                <th className="px-4 py-3 text-center">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <PickupList driverId={effectiveDriverId} />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
