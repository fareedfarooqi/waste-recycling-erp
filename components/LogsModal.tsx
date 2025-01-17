import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { useRouter } from 'next/navigation';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { GoSearch } from 'react-icons/go';

interface LogsModalProps {
    onClose: () => void;
}

const LogsModal: React.FC<LogsModalProps> = ({ onClose }) => {
    const [logs, setLogs] = useState<any[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [logToDelete, setLogToDelete] = useState<any | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const supabase = createClient();
    const router = useRouter();

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
                setFilteredLogs(data);
            }

            setIsLoading(false);
        };

        fetchLogs();
    }, [supabase]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredLogs(logs);
        } else {
            const filtered = logs.filter((log) =>
                log.products.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.customers.company_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredLogs(filtered);
        }
    }, [searchQuery, logs]);

    const handleDeleteLog = async () => {
        if (logToDelete) {
            const { error } = await supabase
                .from('inbound_product_logging')
                .delete()
                .eq('id', logToDelete.id);

            if (error) {
                console.error('Error deleting log:', error.message);
            } else {
                setLogs((prevLogs) =>
                    prevLogs.filter((log) => log.id !== logToDelete.id)
                );
                setFilteredLogs((prevLogs) =>
                    prevLogs.filter((log) => log.id !== logToDelete.id)
                );
                setLogToDelete(null);
                setIsDeleteModalOpen(false);
            }
        }
    };

    const handleEditLog = (logId: string) => {
        router.push(`/edit-log/${logId}`);
    };

    return (
        <div
            className="fixed inset-0 bg-gray-700 bg-opacity-50 z-50 flex justify-center items-center"
            onClick={onClose}
        >
            <div
                className="bg-white w-[95%] max-w-4xl rounded-md p-6 font-sans shadow-lg relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-3xl font-bold text-center mb-4">Logs</h2>

                <div className="flex items-center border border-gray-300 rounded-md px-4 py-2 mb-4">
                    <GoSearch className="h-5 w-5 text-gray-500 mr-2" />
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
                        <table className="table-auto w-full text-center border-collapse">
                            <thead className="sticky top-0 bg-green-600 text-white text-center z-10">
                                <tr>
                                    <th className="px-4 py-2">Product</th>
                                    <th className="px-4 py-2">Provider</th>
                                    <th className="px-4 py-2">Quantity</th>
                                    <th className="px-4 py-2">Date of Arrival</th>
                                    <th className="px-4 py-2">Invoice</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="border px-4 py-2">{log.products.product_name}</td>
                                            <td className="border px-4 py-2">{log.customers.company_name}</td>
                                            <td className="border px-4 py-2">{log.quantity_received}kg</td>
                                            <td className="border px-4 py-2">
                                                {new Date(log.created_at).toLocaleDateString('en-AU')}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {log.invoice_required ? 'Yes' : 'No'}
                                            </td>
                                            <td className="border px-4 py-2">
                                                <div className="flex justify-center space-x-4">
                                                    <FaEdit
                                                        className="text-gray-500 cursor-pointer hover:text-green-500"
                                                        onClick={() => handleEditLog(log.id)}
                                                    />
                                                    <FaTrashAlt
                                                        className="text-gray-500 cursor-pointer hover:text-red-500"
                                                        onClick={() => {
                                                            setLogToDelete(log);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="text-center text-gray-500 font-semibold py-10"
                                        >
                                            No logs available. Add a log to get started.
                                        </td>
                                    </tr>
                                )}
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

                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    title="Delete Log"
                    content={<p>Are you sure you want to delete this log?</p>}
                    buttons={[
                        {
                            label: 'Cancel',
                            onClick: () => setIsDeleteModalOpen(false),
                            variant: 'secondary',
                        },
                        {
                            label: 'Delete',
                            onClick: handleDeleteLog,
                            variant: 'primary',
                        },
                    ]}
                />
            </div>
        </div>
    );
};

export default LogsModal;
