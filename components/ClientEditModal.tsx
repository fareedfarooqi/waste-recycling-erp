'use client';

import React, { useState, useEffect } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { AiOutlineMinusCircle } from 'react-icons/ai';

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

type ContactDetails = {
    email: string;
    phone: string;
    address: string;
};

type Client = {
    id: string;
    company_name: string;
    contact_details: ContactDetails;
    locations: Location[];
};

type ClientModalProps = {
    isOpen: boolean;
    client: Partial<Client>;
    onClose: () => void;
    onSave: (updatedClient: Partial<Client>) => void;
};

const ClientEditModal: React.FC<ClientModalProps> = ({
    isOpen,
    client,
    onClose,
    onSave,
}) => {
    if (!isOpen) return null;

    const [editedClient, setEditedClient] = useState<Partial<Client>>({});

    useEffect(() => {
        if (client) {
            setEditedClient({
                ...client,
                locations: client.locations?.map((location) => ({
                    ...location,
                    default_product_types: location.default_product_types || [],
                })),
            });
        }
    }, [client]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name.startsWith('contact_details.')) {
            const key = name.split('.')[1];
            setEditedClient((prev) => ({
                ...prev,
                contact_details: {
                    ...prev.contact_details,
                    [key]: value,
                } as ContactDetails,
            }));
        } else {
            setEditedClient((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSave = () => {
        onSave(editedClient);
    };

    const addNewLocation = () => {
        setEditedClient((prev) => ({
            ...prev,
            locations: [
                ...(prev.locations || []),
                {
                    location_name: '',
                    address: '',
                    initial_empty_bins: '0',
                    default_product_types: [],
                },
            ],
        }));
    };

    const addProductType = (index: number) => {
        setEditedClient((prev) => {
            const newLocations = [...(prev.locations || [])];
            newLocations[index] = {
                ...newLocations[index],
                default_product_types: [
                    ...(newLocations[index].default_product_types || []),
                    { product_name: '', description: '' },
                ],
            };
            return { ...prev, locations: newLocations };
        });
    };

    const removeProductType = (locationIndex: number, productIndex: number) => {
        setEditedClient((prev) => {
            const newLocations = [...(prev.locations || [])];
            newLocations[locationIndex].default_product_types = newLocations[
                locationIndex
            ].default_product_types.filter((_, i) => i !== productIndex);
            return { ...prev, locations: newLocations };
        });
    };

    const updateProductType = (
        locationIndex: number,
        productIndex: number,
        field: keyof ProductType,
        value: string
    ) => {
        setEditedClient((prev) => {
            const newLocations = [...(prev.locations || [])];
            newLocations[locationIndex].default_product_types[productIndex][
                field
            ] = value;
            return { ...prev, locations: newLocations };
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 z-50 flex justify-center items-center">
            <div
                className="bg-white w-[90%] max-w-2xl rounded-md border-[0.35rem] border-gray-300 font-sans shadow-lg relative max-h-[95vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white z-10 w-full p-4 border-b border-gray-300">
                    <h1 className="font-extrabold text-2xl text-center">
                        Edit Client Details
                    </h1>
                    <RxCross2
                        className="absolute top-4 right-4 text-2xl font-extrabold cursor-pointer text-gray-800 hover:text-red-600 transform transition-transform duration-300 hover:scale-125"
                        onClick={onClose}
                    />
                </div>

                <div className="p-6">
                    <label className="block text-lg font-semibold text-gray-700 w-full text-left">
                        Company Name:
                    </label>
                    <input
                        type="text"
                        name="company_name"
                        value={editedClient?.company_name || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />

                    <label className="block text-lg font-semibold text-gray-700 w-full text-left">
                        Phone Number:
                    </label>
                    <input
                        type="text"
                        name="contact_details.phone"
                        value={editedClient?.contact_details?.phone || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />

                    <label className="block text-lg font-semibold text-gray-700 w-full text-left">
                        Email:
                    </label>
                    <input
                        type="text"
                        name="contact_details.email"
                        value={editedClient?.contact_details?.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />

                    <label className="block text-lg font-semibold text-gray-700 w-full text-left mt-5">
                        Address:
                    </label>
                    <input
                        type="text"
                        name="contact_details.address"
                        value={editedClient?.contact_details?.address || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />

                    <div className="w-full mt-6">
                        <h2 className="block text-lg font-semibold text-gray-700 mb-2 w-full text-left">
                            Locations:
                        </h2>
                        <div className="space-y-4">
                            {editedClient?.locations?.map((location, index) => (
                                <div
                                    key={index}
                                    className="p-4 border border-gray-300 rounded-lg shadow-sm bg-gray-50 relative"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-semibold text-gray-700">
                                            Location {index + 1}
                                        </h3>
                                        <button
                                            type="button"
                                            className="text-red-500 text-sm font-bold hover:underline"
                                            onClick={() =>
                                                setEditedClient((prev) => ({
                                                    ...prev,
                                                    locations:
                                                        prev.locations?.filter(
                                                            (_, i) =>
                                                                i !== index
                                                        ),
                                                }))
                                            }
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                Location Name:
                                            </label>
                                            <input
                                                type="text"
                                                value={location.location_name}
                                                onChange={(e) => {
                                                    const newLocations = [
                                                        ...(editedClient.locations ||
                                                            []),
                                                    ];
                                                    newLocations[
                                                        index
                                                    ].location_name =
                                                        e.target.value;
                                                    setEditedClient((prev) => ({
                                                        ...prev,
                                                        locations: newLocations,
                                                    }));
                                                }}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                Address:
                                            </label>
                                            <input
                                                type="text"
                                                value={location.address}
                                                onChange={(e) => {
                                                    const newLocations = [
                                                        ...(editedClient.locations ||
                                                            []),
                                                    ];
                                                    newLocations[
                                                        index
                                                    ].address = e.target.value;
                                                    setEditedClient((prev) => ({
                                                        ...prev,
                                                        locations: newLocations,
                                                    }));
                                                }}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                Initial Empty Bins:
                                            </label>
                                            <input
                                                type="number"
                                                value={
                                                    location.initial_empty_bins
                                                }
                                                onChange={(e) => {
                                                    const newLocations = [
                                                        ...(editedClient.locations ||
                                                            []),
                                                    ];
                                                    newLocations[
                                                        index
                                                    ].initial_empty_bins =
                                                        e.target.value;
                                                    setEditedClient((prev) => ({
                                                        ...prev,
                                                        locations: newLocations,
                                                    }));
                                                }}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="block text-sm font-semibold text-gray-700 mb-1">
                                                Default Product Types:
                                            </h4>
                                            {location.default_product_types.map(
                                                (product, pIndex) => (
                                                    <div
                                                        key={pIndex}
                                                        className="flex gap-4 mb-2 items-center"
                                                    >
                                                        <input
                                                            type="text"
                                                            placeholder="Product Name"
                                                            value={
                                                                product.product_name
                                                            }
                                                            onChange={(e) =>
                                                                updateProductType(
                                                                    index,
                                                                    pIndex,
                                                                    'product_name',
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="flex-1 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Description"
                                                            value={
                                                                product.description
                                                            }
                                                            onChange={(e) =>
                                                                updateProductType(
                                                                    index,
                                                                    pIndex,
                                                                    'description',
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="flex-1 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                                        />
                                                        <AiOutlineMinusCircle
                                                            className="text-red-500 cursor-pointer hover:text-red-700 transition-transform duration-200"
                                                            size={24}
                                                            onClick={() =>
                                                                removeProductType(
                                                                    index,
                                                                    pIndex
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                )
                                            )}
                                            <button
                                                type="button"
                                                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                                onClick={() =>
                                                    addProductType(index)
                                                }
                                            >
                                                Add Product Type
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                onClick={addNewLocation}
                            >
                                Add New Location
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between w-full mt-6">
                        <button
                            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                            onClick={handleSave}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientEditModal;
