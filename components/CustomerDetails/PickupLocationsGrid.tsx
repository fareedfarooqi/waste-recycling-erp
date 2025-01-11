'use client';

import React from 'react';

type ProductType = {
    product_name: string;
    description: string;
};

type Location = {
    location_name: string;
    address: string;
    initial_empty_bins: string;
    default_product_types: ProductType[];
};

interface Props {
    locations: Location[];
}

const PickupLocationsGrid: React.FC<Props> = ({ locations }) => {
    return (
        <>
            <h2 className="text-3xl font-semibold text-green-600 mb-8 text-center">
                Pickup Locations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                {locations.map((location, index) => (
                    <div
                        key={index}
                        className="bg-gray-50 p-6 rounded-lg shadow-md w-full max-w-md"
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
                            {location.location_name}
                        </h3>
                        <p className="text-gray-600 mb-3 text-center">
                            {location.address} (
                            <span className="text-green-600 font-medium">
                                {location.initial_empty_bins} empty bins
                            </span>
                            )
                        </p>
                        <ul className="list-disc list-inside mt-3 text-left">
                            {location.default_product_types.map(
                                (product, idx) => (
                                    <li
                                        key={idx}
                                        className="text-gray-700 text-sm"
                                    >
                                        <strong>{product.product_name}:</strong>{' '}
                                        {product.description}
                                    </li>
                                )
                            )}
                        </ul>
                    </div>
                ))}
            </div>
        </>
    );
};

export default PickupLocationsGrid;
