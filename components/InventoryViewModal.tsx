import React from 'react';

// Type definition for inventory item
type Inventory = {
    id: string;
    product_name: string;
    quantity: number;
    created_at: string;
    updated_at: string;
};

type InventoryModalProps = {
    isOpen: boolean;
    inventory: Inventory;  // Removed Partial to ensure all fields are required for the modal
    onClose: () => void;
};

const InventoryViewModal: React.FC<InventoryModalProps> = ({
    isOpen,
    inventory,
    onClose,
}) => {
    if (!isOpen) return null;

    // Function to format date (improve readability)
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div
            className="fixed inset-0 bg-gray-700 bg-opacity-50 z-50 flex justify-center items-center"
            onClick={onClose}
        >
            <div
                className="bg-white w-[90%] max-w-xl rounded-md border-[0.35rem] border-gray-300 p-6 font-sans shadow-lg relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="font-bold text-lg mb-4">Inventory Details</h3>
                <div>
                    <p>
                        <strong>Product Name: </strong>
                        {inventory.product_name}
                    </p>
                    <p>
                        <strong>Quantity: </strong>
                        {inventory.quantity} kg
                    </p>
                    <p>
                        <strong>Created At: </strong>
                        {formatDate(inventory.created_at)}
                    </p>
                    <p>
                        <strong>Updated At: </strong>
                        {formatDate(inventory.updated_at)}
                    </p>
                </div>
                <button
                    className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={onClose}
                    aria-label="Close inventory details modal"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default InventoryViewModal;
