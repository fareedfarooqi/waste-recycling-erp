import React, { useState } from 'react';

type Location = {
    location_name: string;
    address: string;
    initial_empty_bins: string;
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

    const [editedClient, setEditedClient] = useState<Partial<Client>>({
        ...client,
        contact_details: {
            email: client.contact_details?.email || '',
            phone: client.contact_details?.phone || '',
            address: client.contact_details?.address || '',
        },
        locations: client.locations || [],
    });

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
        alert('Changes Saved Successfully!');
    };

    return (
        <div
            className="fixed inset-0 bg-gray-700 bg-opacity-50 z-50 flex justify-center items-center"
            onClick={onClose}
        >
            <div
                className="bg-white w-[90%] max-w-2xl rounded-md border-[0.35rem] border-gray-300 p-8 font-sans shadow-lg relative max-h-[95vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center">
                    <h1 className="font-extrabold text-2xl mb-6 text-center">
                        Edit Client Details
                    </h1>

                    <label className="block text-lg font-semibold text-gray-700 mb-2 w-full text-left">
                        Company Name:
                    </label>
                    <input
                        type="text"
                        name="company_name"
                        value={editedClient.company_name || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />

                    <label className="block text-lg font-semibold text-gray-700 mb-2 w-full text-left">
                        Phone Number:
                    </label>
                    <input
                        type="text"
                        name="contact_details.phone"
                        value={editedClient.contact_details?.phone || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />

                    <label className="block text-lg font-semibold text-gray-700 mb-2 w-full text-left">
                        Email:
                    </label>
                    <input
                        type="text"
                        name="contact_details.email"
                        value={editedClient.contact_details?.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />

                    <label className="block text-lg font-semibold text-gray-700 mb-2 w-full text-left">
                        Address:
                    </label>
                    <input
                        type="text"
                        name="contact_details.address"
                        value={editedClient.contact_details?.address || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />

                    <div className="w-full mt-6">
                        <h2 className="block text-lg font-semibold text-gray-700 mb-2 w-full text-left">
                            Locations
                        </h2>
                        <div className="space-y-4">
                            {editedClient.locations?.map((location, index) => (
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
                                                name={`locations.${index}.location_name`}
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
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="mt-4 text-white font-bold bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600"
                                onClick={() =>
                                    setEditedClient((prev) => ({
                                        ...prev,
                                        locations: [
                                            ...(prev.locations || []),
                                            {
                                                location_name: '',
                                                address: '',
                                                initial_empty_bins: '0',
                                            },
                                        ],
                                    }))
                                }
                            >
                                Add New Location
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between w-full mt-6">
                        <button
                            className="text-white font-bold bg-red-500 px-6 py-2 rounded-lg hover:bg-red-600"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="text-white font-bold bg-green-400 px-6 py-2 rounded-lg hover:bg-green-500"
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
