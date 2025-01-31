'use client';

import { useState, useEffect } from 'react';
// import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PickupDetailsPopup } from '@/components/PickupPopUp';

interface Pickup {
    id: string;
    customerName: string;
    address: string;
    emptyBinsDelivered: number;
    filledBinsCollected: number;
    productsCollected: number; // New field for collected products in kg
    signature: string;
    status: string; // Status of the pickup
}

export default function PickupExecutionScreen() {
    const [pickups, setPickups] = useState<Pickup[]>([]); // Start with an empty array
    const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);

    // Fetch pickup data from the database
    useEffect(() => {
        async function fetchPickups() {
            try {
                // Replace with actual fetch URL or database query logic
                const response = await fetch('/api/getPickups');
                const data = await response.json();
                setPickups(data); // Update state with the fetched data
            } catch (error) {
                console.error('Error fetching pickups:', error);
            }
        }

        fetchPickups();
    }, []);

    const handlePickupClick = (pickup: Pickup) => {
        setSelectedPickup(pickup);
    };

    const handleClosePopup = () => {
        setSelectedPickup(null);
    };

    const handleUpdatePickup = (updatedPickup: Pickup) => {
        setPickups((prevPickups) =>
            prevPickups.map((pickup) =>
                pickup.id === updatedPickup.id ? updatedPickup : pickup
            )
        );
        setSelectedPickup(null);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Assigned Pickups</h1>
            {pickups.map((pickup) => (
                <Card
                    key={pickup.id}
                    className="mb-4 cursor-pointer hover:bg-gray-100"
                    onClick={() => handlePickupClick(pickup)}
                >
                    <CardHeader>
                        <CardTitle>{pickup.customerName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {pickup.address}
                        </p>
                        <div className="mt-2 flex flex-col text-sm">
                            <span>
                                Empty Bins Delivered:{' '}
                                {pickup.emptyBinsDelivered}
                            </span>
                            <span>
                                Filled Bins Collected:{' '}
                                {pickup.filledBinsCollected}
                            </span>
                            <span>
                                Products Collected (kg):{' '}
                                {pickup.productsCollected}
                            </span>
                            <span>Status: {pickup.status}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
            {selectedPickup && (
                <PickupDetailsPopup
                    pickup={selectedPickup}
                    onClose={handleClosePopup}
                    onUpdate={handleUpdatePickup}
                />
            )}
        </div>
    );
}
