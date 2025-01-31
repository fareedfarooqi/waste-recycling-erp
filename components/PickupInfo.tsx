// FINAL CODE - 2
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// export default function PickupInfo({ pickup }: { pickup: any }) {
export default function PickupInfo({
    pickup,
}: {
    pickup: {
        id: string;
        customer: { name: string };
        pickup_location: string;
        pickup_date: string;
        driver: { name: string };
    };
}) {
    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>Pickup Information</CardTitle>
            </CardHeader>
            <CardContent>
                <p>
                    <strong>Pickup ID:</strong> {pickup.id}
                </p>
                <p>
                    <strong>Customer Name:</strong> {pickup.customer.name}
                </p>
                <p>
                    <strong>Pickup Location:</strong> {pickup.pickup_location}
                </p>
                <p>
                    <strong>Date & Time:</strong>{' '}
                    {new Date(pickup.pickup_date).toLocaleString()}
                </p>
                <p>
                    <strong>Driver:</strong> {pickup.driver.name}
                </p>
            </CardContent>
        </Card>
    );
}
