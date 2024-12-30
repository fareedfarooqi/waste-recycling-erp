import React from 'react';

type DateFormatterProps = {
    date: string;
};

const DateFormatter: React.FC<DateFormatterProps> = ({ date }) => {
    const newDate = new Date(date);

    // Get the weekday, day, month, year, hour, minute, second, and hour12
    const weekday = newDate.toLocaleString('en-US', { weekday: 'long' });
    const day = newDate.getDate();
    const month = newDate.toLocaleString('en-US', { month: 'long' });
    const year = newDate.getFullYear();
    const hour = newDate.getHours() % 12 || 12; // 12-hour format
    const minute = String(newDate.getMinutes()).padStart(2, '0');
    const second = String(newDate.getSeconds()).padStart(2, '0');
    const hour12 = newDate.getHours() < 12 ? 'AM' : 'PM';

    // Capitalize only the first letter of weekday and month
    const formattedWeekday =
        weekday.charAt(0).toUpperCase() + weekday.slice(1).toLowerCase();
    const formattedMonth =
        month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

    // Format the date string
    const formattedString = `${formattedWeekday}, ${day}, ${formattedMonth}, ${year}, ${hour}:${minute}:${second} ${hour12}`;

    return <span>{formattedString}</span>;
};

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
                <h3 className="font-bold text-lg mb-4">
                    Processing Request Details
                </h3>
                <div>
                    <p>
                        <strong>Request id: </strong>
                        {processingRequest.id || 'N/A'}
                    </p>
                    <p>
                        <strong>Product Name: </strong>
                        {processingRequest.product_name || 'N/A'}
                    </p>
                    <p>
                        <strong>Product id: </strong>
                        {processingRequest.product_id || 'N/A'}
                    </p>
                    <p>
                        <strong>Quantity: </strong>
                        {processingRequest.quantity || 'N/A'} kg
                    </p>
                    <p>
                        <strong>Status: </strong>
                        {processingRequest.status || 'N/A'}
                    </p>
                    <p>
                        <strong>Request Created: </strong>
                        {processingRequest.created_at ? (
                            <DateFormatter
                                date={processingRequest.created_at}
                            />
                        ) : (
                            'N/A'
                        )}
                    </p>
                    <p>
                        <strong>Request Last Updated: </strong>
                        {processingRequest.created_at ? (
                            <DateFormatter
                                date={processingRequest.created_at}
                            />
                        ) : (
                            'N/A'
                        )}
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

export default ProcessingRequestsViewModal;
