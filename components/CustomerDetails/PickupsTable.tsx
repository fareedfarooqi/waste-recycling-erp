'use client';

import React from 'react';

type Pickup = {
    id: string; // This is our pickup docket ID
    pickup_location: string;
    pickup_date: string;
    empty_bins_delivered: number;
    filled_bins_collected: number;
};

type PickupsTableProps = {
    pickups: Pickup[];
    loading: boolean;
};

const PickupsTable: React.FC<PickupsTableProps> = ({ pickups, loading }) => {
    return (
        <div className="w-full mx-auto overflow-auto border rounded-lg shadow-lg max-h-[80vh]">
            <table className="min-w-full border-collapse">
                <thead className="bg-green-600 text-white text-center">
                    <tr>
                        <th className="font-extrabold px-6 py-4 sticky top-0 bg-green-600 z-10">
                            Pickup Docket ID
                        </th>
                        <th className="font-extrabold px-6 py-4 sticky top-0 bg-green-600 z-10">
                            Pickup Location
                        </th>
                        <th className="font-extrabold px-6 py-4 sticky top-0 bg-green-600 z-10">
                            Pickup Date
                        </th>
                        <th className="font-extrabold px-6 py-4 sticky top-0 bg-green-600 z-10">
                            Empty Bins Delivered
                        </th>
                        <th className="font-extrabold px-6 py-4 sticky top-0 bg-green-600 z-10">
                            Filled Bins Collected
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td
                                colSpan={5}
                                className="text-center text-gray-500 py-8"
                            >
                                Loading pickups...
                            </td>
                        </tr>
                    ) : pickups.length > 0 ? (
                        pickups.map((pickup) => (
                            <tr
                                key={pickup.id}
                                className="hover:bg-gray-100 even:bg-gray-50 odd:bg-white text-center"
                            >
                                <td className="px-6 py-4 border-b">
                                    {pickup.id}
                                </td>
                                <td className="px-6 py-4 border-b">
                                    {pickup.pickup_location}
                                </td>
                                <td className="px-6 py-4 border-b">
                                    {new Date(
                                        pickup.pickup_date
                                    ).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 border-b">
                                    {pickup.empty_bins_delivered}
                                </td>
                                <td className="px-6 py-4 border-b">
                                    {pickup.filled_bins_collected}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={5}
                                className="text-center text-gray-500 py-8"
                            >
                                No pickups available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PickupsTable;
