'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PickupList from '@/components/PickupList';
import { supabase } from '@/config/supabaseClient'; // Assuming supabase client is imported correctly

// Define types for Driver and Pickup
type Driver = {
    id: string;
    name: string;
    contact_details: {
        email: string;
        phone?: string;
    };
};

type Pickup = {
    id: string;
    customer_name: string;
    pickup_location: string;
    scheduled_datetime: string;
    driver_id: string;
    bins_to_deliver: string;
};

export default function DriverInterfacePage() {
    const [drivers, setDrivers] = useState<Driver[]>([]); // Explicitly define the type as Driver[]
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null); // For selected driver
    const [pickups, setPickups] = useState<Pickup[]>([]); // Explicitly define the type as Pickup[]
    const [scheduledPickups, setScheduledPickups] = useState<Pickup[]>([]); // Explicitly define the type as Pickup[] for scheduled pickups
    const [driverId, setDriverId] = useState<string>(''); // To hold the input driver ID
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // To track if the driver has logged in

    // Fetch drivers list on component mount
    useEffect(() => {
        const fetchDrivers = async () => {
            const { data, error } = await supabase
                .from('drivers')
                .select('id, name, contact_details'); // Include contact_details in the query

            if (error) {
                console.error('Error fetching drivers:', error.message);
            } else {
                setDrivers(data || []); // TypeScript will now understand that data is an array of Driver
            }
        };

        fetchDrivers();
    }, []);

    // Fetch pickups when a driver is logged in
    useEffect(() => {
        if (!selectedDriver) return; // Don't fetch pickups if no driver is selected

        const fetchPickups = async () => {
            const { data, error } = await supabase
                .from('pickups')
                .select('*')
                .eq('driver_id', selectedDriver.id) // Assuming driver_id exists in pickups table
                .eq('status', 'completed');

            if (error) {
                console.error('Error fetching pickups:', error.message);
            } else {
                setPickups(data || []); // TypeScript will now understand that data is an array of Pickup
            }
        };

        fetchPickups();
    }, [selectedDriver]);

    // Fetch scheduled pickups
    useEffect(() => {
        if (!selectedDriver) return; // Don't fetch scheduled pickups if no driver is selected

        const fetchScheduledPickups = async () => {
            // const { data, error } = await supabase
            //   .from('pickups')
            //   .select('*')
            //   .eq('driver_id', selectedDriver.id) // Filter by driver_id
            //   .is('status', null); // Assuming `` is null for scheduled pickups
            const { data, error } = await supabase
                .from('pickups')
                .select('*', { count: 'exact' })
                .eq('driver_id', selectedDriver.id)
                .eq('status', 'scheduled');

            if (error) {
                console.error(
                    'Error fetching scheduled pickups:',
                    error.message
                );
            } else {
                setScheduledPickups(data || []); // TypeScript will now understand that data is an array of Pickup
            }
        };

        fetchScheduledPickups();
    }, [selectedDriver]);

    const handleLogin = async () => {
        try {
            // Find the driver by ID from your system or database
            const foundDriver = drivers.find(
                (driver) => driver.id === driverId
            );

            if (!foundDriver) {
                alert('Driver ID not found');
                return;
            }

            // After successful login, set session and driver details
            setSelectedDriver(foundDriver);
            setIsLoggedIn(true);

            // Log user info for debugging
            console.log('Logged in as', foundDriver);
        } catch (err) {
            console.error('Login error:', err);
            alert(
                'Login failed: ' +
                    (err instanceof Error ? err.message : 'Unknown error')
            );
        }
    };
    useEffect(() => {
        const fetchSession = async () => {
            // Check if the user is authenticated via Supabase session
            const {
                data: { session },
                error: authError,
            } = await supabase.auth.getSession();

            if (authError || !session || !session.user) {
                console.log('No session found, please log in.');
                setIsLoggedIn(false);
            } else {
                console.log('Authenticated session:', session.user);
                setIsLoggedIn(true);
            }
        };

        fetchSession();
    }, []);

    return (
        <div className="flex flex-col md:flex-row">
            <div className="flex-1">
                {/* Header */}
                <div className="bg-green-600 p-4">
                    <div className="container mx-auto flex flex-wrap items-center justify-between">
                        <Input
                            className="w-full lg:w-64 bg-white mb-2 lg:mb-0"
                            placeholder="Enter Driver ID"
                            value={driverId}
                            onChange={(e) => setDriverId(e.target.value)}
                        />
                        <button
                            onClick={handleLogin}
                            className="bg-white text-green-600 p-2 rounded ml-2"
                        >
                            Login
                        </button>
                        <h1 className="text-lg lg:text-xl text-white font-semibold">
                            Driver Interface
                        </h1>
                    </div>
                </div>

                {/* Display Pickup Details Only After Login */}
                {isLoggedIn && selectedDriver && (
                    <>
                        {/* Stats Section */}
                        <div className="container mx-auto px-4 py-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <Card className="bg-white shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-gray-600">
                                            Pickups Completed
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {pickups.length}
                                        </div>
                                    </CardContent>
                                </Card>
                                {/* New Card for Pickups Scheduled */}
                                <Card className="bg-white shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-gray-600">
                                            Pickups Scheduled
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {scheduledPickups.length}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Pickup List */}
                            <div className="bg-white rounded-lg shadow mt-4 overflow-x-auto">
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
                                            <th className="px-4 py-3 text-left">
                                                Assigned Driver
                                            </th>
                                            <th className="px-4 py-3 text-center">
                                                Bins to Deliver
                                            </th>
                                            <th className="px-4 py-3 text-center text-lg">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedDriver ? (
                                            <PickupList
                                                driverId={selectedDriver.id}
                                            />
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="text-center py-4"
                                                >
                                                    Select a driver...
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
