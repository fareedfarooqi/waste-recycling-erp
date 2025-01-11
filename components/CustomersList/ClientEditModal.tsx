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
    slug: string;
    contact_details: ContactDetails;
    locations: Location[];
};

type ClientModalProps = {
    isOpen: boolean;
    client: Partial<Client>;
    onClose: () => void;
    onSave: (updatedClient: Partial<Client>) => void;
};

type ValidationErrors = {
    company_name?: string;
    contact_details: {
        phone?: string;
        email?: string;
        address?: string;
    };
    locations: {
        location_name?: string;
        address?: string;
        initial_empty_bins?: string;
        default_product_types: {
            product_name?: string;
            description?: string;
        }[];
    }[];
};

const ClientEditModal: React.FC<ClientModalProps> = ({
    isOpen,
    client,
    onClose,
    onSave,
}) => {
    if (!isOpen) return null;

    const [originalClient, setOriginalClient] = useState<Partial<Client>>({});
    const [editedClient, setEditedClient] = useState<Partial<Client>>({});
    const [isChanged, setIsChanged] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
        company_name: '',
        contact_details: { phone: '', email: '', address: '' },
        locations: [],
    });

    useEffect(() => {
        if (client) {
            const normalized: Partial<Client> = {
                ...client,
                company_name: client.company_name ?? '',
                contact_details: {
                    email: client.contact_details?.email ?? '',
                    phone: client.contact_details?.phone ?? '',
                    address: client.contact_details?.address ?? '',
                },
                locations: (client.locations ?? []).map((loc) => {
                    let bins = parseInt(loc.initial_empty_bins ?? '0', 10);
                    if (isNaN(bins) || bins < 0) bins = 0;
                    return {
                        location_name: loc.location_name ?? '',
                        address: loc.address ?? '',
                        initial_empty_bins: String(bins),
                        default_product_types: loc.default_product_types ?? [],
                    };
                }),
            };
            const cloned = JSON.parse(JSON.stringify(normalized));
            setOriginalClient(normalized);
            setEditedClient(cloned);
            setValidationErrors({
                company_name: '',
                contact_details: { phone: '', email: '', address: '' },
                locations: [],
            });
        }
    }, [client]);

    useEffect(() => {
        const orig = JSON.stringify(originalClient);
        const edit = JSON.stringify(editedClient);
        setIsChanged(orig !== edit);
    }, [originalClient, editedClient]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('contact_details.')) {
            const key = name.split('.')[1];
            setEditedClient((prev) => ({
                ...prev,
                contact_details: {
                    ...(prev.contact_details ?? {
                        email: '',
                        phone: '',
                        address: '',
                    }),
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

    const handleBinsChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        idx: number
    ) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 0) val = 0;
        const locs = [...(editedClient.locations ?? [])];
        locs[idx] = { ...locs[idx], initial_empty_bins: String(val) };
        setEditedClient((prev) => ({ ...prev, locations: locs }));
    };

    const addNewLocation = () => {
        setEditedClient((prev) => ({
            ...prev,
            locations: [
                ...(prev.locations ?? []),
                {
                    location_name: '',
                    address: '',
                    initial_empty_bins: '0',
                    default_product_types: [],
                },
            ],
        }));
    };

    const addProductType = (locIndex: number) => {
        const locs = [...(editedClient.locations ?? [])];
        locs[locIndex] = {
            ...locs[locIndex],
            default_product_types: [
                ...(locs[locIndex].default_product_types ?? []),
                { product_name: '', description: '' },
            ],
        };
        setEditedClient((prev) => ({ ...prev, locations: locs }));
    };

    const removeProductType = (locIndex: number, pIndex: number) => {
        const locs = [...(editedClient.locations ?? [])];
        locs[locIndex].default_product_types = locs[
            locIndex
        ].default_product_types.filter((_, i) => i !== pIndex);
        setEditedClient((prev) => ({ ...prev, locations: locs }));
    };

    const doValidation = (data: Partial<Client>): ValidationErrors => {
        const errors: ValidationErrors = {
            company_name: '',
            contact_details: { phone: '', email: '', address: '' },
            locations: [],
        };
        if (!data.company_name?.trim()) {
            errors.company_name = 'Company name cannot be empty.';
        }
        const cd = data.contact_details;
        if (cd) {
            if (!cd.phone?.trim()) {
                errors.contact_details.phone = 'Phone cannot be empty.';
            }
            if (!cd.email?.trim()) {
                errors.contact_details.email = 'Email cannot be empty.';
            }
            if (!cd.address?.trim()) {
                errors.contact_details.address = 'Address cannot be empty.';
            }
        } else {
            errors.contact_details.phone = 'Phone cannot be empty.';
            errors.contact_details.email = 'Email cannot be empty.';
            errors.contact_details.address = 'Address cannot be empty.';
        }
        if (data.locations) {
            errors.locations = data.locations.map((loc) => ({
                location_name: '',
                address: '',
                initial_empty_bins: '',
                default_product_types: (loc.default_product_types ?? []).map(
                    () => ({ product_name: '', description: '' })
                ),
            }));
            data.locations.forEach((loc, i) => {
                if (!loc.location_name.trim()) {
                    errors.locations[i].location_name =
                        'Location name cannot be empty.';
                }
                if (!loc.address.trim()) {
                    errors.locations[i].address = 'Address cannot be empty.';
                }
                if (!loc.initial_empty_bins.trim()) {
                    errors.locations[i].initial_empty_bins =
                        'Bins cannot be empty.';
                }
                if (parseInt(loc.initial_empty_bins, 10) < 0) {
                    errors.locations[i].initial_empty_bins =
                        'Bins cannot be negative.';
                }
                loc.default_product_types.forEach((pt, j) => {
                    if (!pt.product_name.trim()) {
                        errors.locations[i].default_product_types[
                            j
                        ].product_name = 'Product name cannot be empty.';
                    }
                    if (!pt.description.trim()) {
                        errors.locations[i].default_product_types[
                            j
                        ].description = 'Description cannot be empty.';
                    }
                });
            });
        }
        return errors;
    };

    const isErrorsEmpty = (errs: ValidationErrors) => {
        if (errs.company_name) return false;
        if (errs.contact_details.phone) return false;
        if (errs.contact_details.email) return false;
        if (errs.contact_details.address) return false;
        for (let i = 0; i < errs.locations.length; i++) {
            const locErr = errs.locations[i];
            if (locErr.location_name) return false;
            if (locErr.address) return false;
            if (locErr.initial_empty_bins) return false;
            for (let j = 0; j < locErr.default_product_types.length; j++) {
                const ptErr = locErr.default_product_types[j];
                if (ptErr.product_name) return false;
                if (ptErr.description) return false;
            }
        }
        return true;
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
                        value={editedClient.company_name || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 mb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    {validationErrors.company_name ? (
                        <p className="text-red-500 text-sm mb-4">
                            {validationErrors.company_name}
                        </p>
                    ) : (
                        <div className="mb-4" />
                    )}
                    <label className="block text-lg font-semibold text-gray-700 w-full text-left">
                        Phone Number:
                    </label>
                    <input
                        type="text"
                        name="contact_details.phone"
                        value={editedClient.contact_details?.phone || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 mb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    {validationErrors.contact_details.phone ? (
                        <p className="text-red-500 text-sm mb-4">
                            {validationErrors.contact_details.phone}
                        </p>
                    ) : (
                        <div className="mb-4" />
                    )}
                    <label className="block text-lg font-semibold text-gray-700 w-full text-left">
                        Email:
                    </label>
                    <input
                        type="text"
                        name="contact_details.email"
                        value={editedClient.contact_details?.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 mb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    {validationErrors.contact_details.email ? (
                        <p className="text-red-500 text-sm mb-4">
                            {validationErrors.contact_details.email}
                        </p>
                    ) : (
                        <div className="mb-4" />
                    )}
                    <label className="block text-lg font-semibold text-gray-700 w-full text-left mt-2">
                        Address:
                    </label>
                    <input
                        type="text"
                        name="contact_details.address"
                        value={editedClient.contact_details?.address || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 mb-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    {validationErrors.contact_details.address ? (
                        <p className="text-red-500 text-sm mb-4">
                            {validationErrors.contact_details.address}
                        </p>
                    ) : (
                        <div className="mb-4" />
                    )}
                    <div className="w-full mt-6">
                        <h2 className="block text-lg font-semibold text-gray-700 mb-2 w-full text-left">
                            Locations:
                        </h2>
                        <div className="space-y-4">
                            {editedClient.locations?.map((location, index) => {
                                const locErr = validationErrors.locations[
                                    index
                                ] || {
                                    location_name: '',
                                    address: '',
                                    initial_empty_bins: '',
                                    default_product_types: [],
                                };
                                return (
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
                                                onClick={() => {
                                                    setEditedClient((prev) => ({
                                                        ...prev,
                                                        locations:
                                                            prev.locations?.filter(
                                                                (_, i) =>
                                                                    i !== index
                                                            ),
                                                    }));
                                                }}
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
                                                    value={
                                                        location.location_name
                                                    }
                                                    onChange={(e) => {
                                                        const locs = [
                                                            ...(editedClient.locations ??
                                                                []),
                                                        ];
                                                        locs[index] = {
                                                            ...locs[index],
                                                            location_name:
                                                                e.target.value,
                                                        };
                                                        setEditedClient(
                                                            (p) => ({
                                                                ...p,
                                                                locations: locs,
                                                            })
                                                        );
                                                    }}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                                />
                                                {locErr.location_name ? (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {locErr.location_name}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Address:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={location.address}
                                                    onChange={(e) => {
                                                        const locs = [
                                                            ...(editedClient.locations ??
                                                                []),
                                                        ];
                                                        locs[index] = {
                                                            ...locs[index],
                                                            address:
                                                                e.target.value,
                                                        };
                                                        setEditedClient(
                                                            (p) => ({
                                                                ...p,
                                                                locations: locs,
                                                            })
                                                        );
                                                    }}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                                />
                                                {locErr.address ? (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {locErr.address}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Initial Empty Bins:
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        location.initial_empty_bins
                                                    }
                                                    onChange={(e) =>
                                                        handleBinsChange(
                                                            e,
                                                            index
                                                        )
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                                />
                                                {locErr.initial_empty_bins ? (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {
                                                            locErr.initial_empty_bins
                                                        }
                                                    </p>
                                                ) : null}
                                            </div>
                                            <div>
                                                <h4 className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Default Product Types:
                                                </h4>
                                                {location.default_product_types.map(
                                                    (product, pIndex) => {
                                                        const ptErr = locErr
                                                            .default_product_types[
                                                            pIndex
                                                        ] || {
                                                            product_name: '',
                                                            description: '',
                                                        };
                                                        return (
                                                            <div
                                                                key={pIndex}
                                                                className="flex gap-4 mb-2 items-center"
                                                            >
                                                                <div className="flex-1">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Product Name"
                                                                        value={
                                                                            product.product_name
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const locs =
                                                                                [
                                                                                    ...(editedClient.locations ??
                                                                                        []),
                                                                                ];
                                                                            locs[
                                                                                index
                                                                            ].default_product_types[
                                                                                pIndex
                                                                            ].product_name =
                                                                                e.target.value;
                                                                            setEditedClient(
                                                                                (
                                                                                    pr
                                                                                ) => ({
                                                                                    ...pr,
                                                                                    locations:
                                                                                        locs,
                                                                                })
                                                                            );
                                                                        }}
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                                                    />
                                                                    {ptErr.product_name ? (
                                                                        <p className="text-red-500 text-sm">
                                                                            {
                                                                                ptErr.product_name
                                                                            }
                                                                        </p>
                                                                    ) : null}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Description"
                                                                        value={
                                                                            product.description
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const locs =
                                                                                [
                                                                                    ...(editedClient.locations ??
                                                                                        []),
                                                                                ];
                                                                            locs[
                                                                                index
                                                                            ].default_product_types[
                                                                                pIndex
                                                                            ].description =
                                                                                e.target.value;
                                                                            setEditedClient(
                                                                                (
                                                                                    pr
                                                                                ) => ({
                                                                                    ...pr,
                                                                                    locations:
                                                                                        locs,
                                                                                })
                                                                            );
                                                                        }}
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                                                    />
                                                                    {ptErr.description ? (
                                                                        <p className="text-red-500 text-sm">
                                                                            {
                                                                                ptErr.description
                                                                            }
                                                                        </p>
                                                                    ) : null}
                                                                </div>
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
                                                        );
                                                    }
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
                                );
                            })}
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
                            className="bg-gray-300 text-gray-800 font-bold px-6 py-2 rounded hover:bg-gray-400 focus:ring-gray-300"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            className={`bg-green-600 text-white font-bold px-6 py-2 rounded focus:ring-green-500 ${
                                isChanged
                                    ? 'hover:bg-green-700 cursor-pointer'
                                    : 'opacity-50 cursor-not-allowed'
                            }`}
                            onClick={() => {
                                const newErrors = doValidation(editedClient);
                                setValidationErrors(newErrors);
                                if (isErrorsEmpty(newErrors)) {
                                    onSave(editedClient);
                                }
                            }}
                            disabled={!isChanged}
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
