'use client';

import React from 'react';

type InboundProduct = {
    product_name: string;
    quantity_received: number;
    date_received: string;
    pickup_docket_id: string | null;
};

interface Props {
    inboundProducts: InboundProduct[];
    loading: boolean;
}

const InboundProductsTable: React.FC<Props> = ({
    inboundProducts,
    loading,
}) => {
    return (
        <div className="w-full mx-auto overflow-auto border rounded-lg shadow-lg max-h-[80vh]">
            <table className="min-w-full border-collapse">
                <thead className="bg-green-600 text-white text-center">
                    <tr>
                        <th className="font-extrabold px-6 py-4 sticky top-0 bg-green-600 z-10">
                            Product Type
                        </th>
                        <th className="font-extrabold px-6 py-4 sticky top-0 bg-green-600 z-10">
                            Quantity (kg)
                        </th>
                        <th className="font-extrabold px-6 py-4 sticky top-0 bg-green-600 z-10">
                            Date Received
                        </th>
                        <th className="font-extrabold px-6 py-4 sticky top-0 bg-green-600 z-10">
                            Pickup Docket ID
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td
                                colSpan={4}
                                className="text-center text-gray-500 py-8"
                            >
                                Loading inbound products...
                            </td>
                        </tr>
                    ) : inboundProducts.length > 0 ? (
                        inboundProducts.map((product, index) => (
                            <tr
                                key={index}
                                className="hover:bg-gray-100 even:bg-gray-50 odd:bg-white text-center"
                            >
                                <td className="px-6 py-4 border-b">
                                    {product.product_name}
                                </td>
                                <td className="px-6 py-4 border-b">
                                    {product.quantity_received.toFixed(3)}
                                </td>
                                <td className="px-6 py-4 border-b">
                                    {new Date(
                                        product.date_received
                                    ).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 border-b">
                                    {product.pickup_docket_id || 'N/A'}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={4}
                                className="text-center text-gray-500 py-8"
                            >
                                No inbound products available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default InboundProductsTable;
