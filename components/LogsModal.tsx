import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FaSearch } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

interface LogsModalProps {
    onClose: () => void;
}

const LogsModal: React.FC<LogsModalProps> = ({ onClose }) => {
    const [logs, setLogs] = useState<any[]>([]); // State to store logs
    const [filteredLogs, setFilteredLogs] = useState<any[]>([]); // State for filtered logs based on search
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [error, setError] = useState<string | null>(null); // Error state
    const [searchQuery, setSearchQuery] = useState(''); // State to track search query

    const supabase = createClient(); // Create Supabase client instance

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('inbound_product_logging')
                .select(`
                    id,
                    quantity_received,
                    created_at,
                    invoice_required,
                    products (product_name),
                    customers (company_name)
                `);

            if (error) {
                setError(error.message);
            } else {
                setLogs(data);
                setFilteredLogs(data); // Set the filtered logs initially to all logs
            }

            setIsLoading(false);
        };

        fetchLogs();
    }, [supabase]);

    useEffect(() => {
        // Filter logs based on search query
        if (searchQuery.trim() === '') {
            setFilteredLogs(logs); // If search is empty, show all logs
        } else {
            const filtered = logs.filter((log) =>
                log.products.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.customers.company_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredLogs(filtered); // Update the filtered logs
        }
    }, [searchQuery, logs]);

    return (
        <div
            className="fixed inset-0 bg-gray-700 bg-opacity-50 z-50 flex justify-center items-center"
            onClick={onClose}
        >
            <div
                className="bg-white w-[90%] max-w-4xl rounded-md border-[0.35rem] border-gray-300 p-6 font-sans shadow-lg relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-4">Logs</h2>

                {/* Search Bar */}
                <div className="flex items-center border border-gray-300 rounded-md px-4 py-2 mb-4">
                    <FaSearch className="h-5 w-5 text-gray-500 mr-2" />
                    <input
                        type="text"
                        className="w-full outline-none"
                        placeholder="Search logs by product or provider"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {isLoading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : (
                    <div className="overflow-y-auto max-h-96">
                        <table className="table-auto w-full text-left">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2">Product</th>
                                    <th className="px-4 py-2">Provider</th>
                                    <th className="px-4 py-2">Quantity</th>
                                    <th className="px-4 py-2">Date</th>
                                    <th className="px-4 py-2">Invoice</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="border px-4 py-2">{log.products.product_name}</td>
                                        <td className="border px-4 py-2">{log.customers.company_name}</td>
                                        <td className="border px-4 py-2">{log.quantity_received}kg</td>
                                        <td className="border px-4 py-2">
                                            {new Date(log.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="border px-4 py-2">{log.invoice_required ? 'Yes' : 'No'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-700"
                    aria-label="Close"
                >
                    <IoMdClose size={24} />
                </button>
            </div>
        </div>
    );
};

export default LogsModal;

