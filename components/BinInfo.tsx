//   export default BinInfo;
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BinInfo({
    emptyBinsDelivered,
    filledBinsCollected,
}: {
    emptyBinsDelivered: number;
    filledBinsCollected: number;
}) {
    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>Bin Information</CardTitle>
            </CardHeader>
            <CardContent>
                <p>
                    <strong>Empty Bins Delivered:</strong> {emptyBinsDelivered}
                </p>
                <p>
                    <strong>Filled Bins Collected:</strong>{' '}
                    {filledBinsCollected}
                </p>
            </CardContent>
        </Card>
    );
}
