import React, { useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import DateFormatter from './DateFormatter';

type ProcessingRequest = {
    id: string;
    product_id: string;
    quantity: number;
    status: 'new' | 'in_progress' | 'completed';
    created_at: string;
    updated_at: string;
    product_name: string;
};

type ProcessingRequestModalProps = {
    isOpen: boolean;
    processingRequest: Partial<ProcessingRequest>;
    onClose: () => void;
};

const ProcessingRequestsViewModal: React.FC<ProcessingRequestModalProps> = ({
    isOpen,
    processingRequest,
    onClose,
}) => {
    const [localProcessingRequest, setLocalProcessingRequest] =
        useState(processingRequest);

    // Effect to update local state whenever the processingRequest prop changes
    useEffect(() => {
        setLocalProcessingRequest(processingRequest);
    }, [processingRequest]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-gray-700 bg-opacity-50 z-50 flex justify-center items-center"
            onClick={onClose}
        >
            <div
                className="bg-white w-[90%] max-w-xl rounded-md p-6 font-sans shadow-lg relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    aria-label="Close"
                >
                    <IoMdClose size={24} />
                </button>
                <h3 className="font-bold text-lg mb-4 text-center">
                    Processing Request Details
                </h3>
                <div className="space-y-2">
                    <p>
                        <strong>Request ID: </strong>
                        {localProcessingRequest.id || 'N/A'}
                    </p>
                    <p>
                        <strong>Product Name: </strong>
                        {localProcessingRequest.product_name || 'N/A'}
                    </p>
                    <p>
                        <strong>Product ID: </strong>
                        {localProcessingRequest.product_id || 'N/A'}
                    </p>
                    <p>
                        <strong>Quantity: </strong>
                        {localProcessingRequest.quantity || 'N/A'} kg
                    </p>
                    <p>
                        <strong>Status: </strong>
                        {localProcessingRequest.status
                            ? localProcessingRequest.status === 'in_progress'
                                ? 'In Progress'
                                : localProcessingRequest.status
                                      .charAt(0)
                                      .toUpperCase() +
                                  localProcessingRequest.status.slice(1)
                            : 'N/A'}
                    </p>
                    <p>
                        <strong>Request Created: </strong>
                        {localProcessingRequest.created_at ? (
                            <DateFormatter
                                date={localProcessingRequest.created_at}
                            />
                        ) : (
                            'N/A'
                        )}
                    </p>
                    <p>
                        <strong>Request Last Updated: </strong>
                        {localProcessingRequest.updated_at ? (
                            <DateFormatter
                                date={localProcessingRequest.updated_at}
                            />
                        ) : (
                            'N/A'
                        )}
                    </p>
                </div>
                <div className="flex justify-center">
                    <button
                        className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-bold"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProcessingRequestsViewModal;
