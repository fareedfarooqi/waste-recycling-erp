import React from 'react';

type Inventory = {
    id: string;
    product_name: string;
    quantity: number;
    status: 'inbound' | 'outbound' | 'processed';
    created_at: string;
    updated_at: string;
};

type InventoryModalProps = {
    isOpen: boolean;
    inventory: Partial<Inventory>;
    onClose: () => void;
};

const InventoryViewModal: React.FC<InventoryModalProps> = ({
    isOpen,
    inventory,
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
                <h3 className="font-bold text-lg mb-4">Inventory Details</h3>
                <div>
                    <p>
                        <strong>Product Name: </strong>
                        {inventory.product_name || 'N/A'}
                    </p>
                    <p>
                        <strong>Quantity: </strong>
                        {inventory.quantity || 'N/A'} kg
                    </p>
                    <p>
                        <strong>Status: </strong>
                        {inventory.status || 'N/A'}
                    </p>
                    <p>
                        <strong>Created At: </strong>
                        {inventory.created_at || 'N/A'}
                    </p>
                    <p>
                        <strong>Updated At: </strong>
                        {inventory.updated_at || 'N/A'}
                    </p>
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

export default InventoryViewModal;
