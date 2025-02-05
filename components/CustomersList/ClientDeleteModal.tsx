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
    onDelete: (clientToRemove: Partial<Client>) => Promise<void>;
};

const ClientDeleteModal: React.FC<ClientModalProps> = ({
    isOpen,
    client,
    onClose,
    onDelete,
}) => {
    if (!isOpen) return null;

    const handleDelete = async () => {
        try {
            await onDelete(client);
            onClose();
        } catch (error) {
            console.error('Delete operation failed:', error);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-gray-700 bg-opacity-50 z-50 flex justify-center items-center"
            onClick={onClose}
        >
            <div
                className="bg-white w-[92%] max-w-lg rounded-lg p-10 shadow-lg relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-3xl font-bold text-center mb-6">
                    Delete Customer
                </h2>
                <p className="text-xl text-center mb-8">
                    Are you sure you want to delete{' '}
                    <span className="font-bold">{client.company_name}</span>?
                </p>
                <div className="flex justify-between">
                    <button
                        className="bg-gray-300 text-gray-800 px-8 py-3 rounded-lg text-base font-bold hover:bg-gray-400 focus:ring-gray-300"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-red-500 text-white px-8 py-3 rounded-lg text-base font-bold hover:bg-red-600 focus:ring-red-300"
                        onClick={handleDelete}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientDeleteModal;
