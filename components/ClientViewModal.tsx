import React from 'react';

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
};

const ClientViewModal: React.FC<ClientModalProps> = ({
    isOpen,
    client,
    onClose,
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-gray-700 bg-opacity-50 z-50 flex justify-center items-center"
            onClick={onClose}
        >
            <div
                className="bg-white w-[90%] max-w-xl rounded-md border-[0.35rem] border-gray-300 p-6 font-sans shadow-lg relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="font-bold text-lg mb-4">Client Details</h3>
                <div>
                    <p>
                        <strong>Company Name: </strong>
                        {client.company_name || 'N/A'}
                    </p>
                    <p>
                        <strong>Phone No: </strong>
                        {client.contact_details?.phone || 'N/A'}
                    </p>
                    <p>
                        <strong>Email: </strong>
                        {client.contact_details?.email || 'N/A'}
                    </p>
                    <p>
                        <strong>Address: </strong>
                        {client.contact_details?.address || 'N/A'}
                    </p>
                    <p className="mt-4">
                        <strong>Locations:</strong>
                    </p>
                    {client.locations && client.locations.length > 0 ? (
                        <ul className="mt-2 list-none space-y-4">
                            {client.locations.map((location, index) => (
                                <li
                                    key={index}
                                    className="p-4 bg-gray-100 rounded-md"
                                >
                                    <p>
                                        <strong>Location Name:</strong>{' '}
                                        {location.location_name || 'N/A'}
                                    </p>
                                    <p>
                                        <strong>Address:</strong>{' '}
                                        {location.address || 'N/A'}
                                    </p>
                                    <p>
                                        <strong>Initial Empty Bins:</strong>{' '}
                                        {location.initial_empty_bins || '0'}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No locations available.</p>
                    )}
                </div>
                <button
                    className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default ClientViewModal;
