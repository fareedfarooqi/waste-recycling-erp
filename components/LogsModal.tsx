import React from 'react';

interface LogsModalProps {
    onClose: () => void;
}

const LogsModal: React.FC<LogsModalProps> = ({ onClose }) => {
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
                {/* Fetch and render logs from Supabase */}
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
                            {/* Example data */}
                            <tr>
                                <td className="border px-4 py-2">Product A</td>
                                <td className="border px-4 py-2">Provider X</td>
                                <td className="border px-4 py-2">100kg</td>
                                <td className="border px-4 py-2">2024-01-01</td>
                                <td className="border px-4 py-2">Yes</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                    onClick={onClose}
                >
                    ✖
                </button>
            </div>
        </div>
    );
};

export default LogsModal;
