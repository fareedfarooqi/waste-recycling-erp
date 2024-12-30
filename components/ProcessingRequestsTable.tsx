'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    FaTrashAlt,
    FaEye,
    FaEdit,
    FaSort,
    FaCheckSquare,
} from 'react-icons/fa';
import { supabase } from '@/config/supabaseClient';
import Button from './Button';
import ProcessingRequestsViewModal from './ProcessingRequestsViewModal';
import SortModal from './SortModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import AddProcessingRequest from './AddProcessingRequest';

type ProcessingRequestItem = {
    id: string;
    product_id: string;
    quantity: number;
    status: 'new' | 'in_progress' | 'completed';
    created_at: string;
    updated_at: string;
    product_name: string;
};

const ProcessingRequestsTable = (): JSX.Element => {
    const [processingRequests, setProcessingRequests] = useState<
        ProcessingRequestItem[]
    >([]);
    const [filteredProcessingRequests, setFilteredProcessingRequests] =
        useState<ProcessingRequestItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false); // State for the Add Request modal
    const modalRef = useRef<HTMLDivElement | null>(null); // Create a ref for the modal container
    const [isSortModalOpen, setIsSortModalOpen] = useState<boolean>(false);
    const [sortField, setSortField] = useState<string>('product_name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
    const [selectedProcessingRequestItem, setSelectedProcessingRequestItem] =
        useState<ProcessingRequestItem | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false); // State for delete confirmation modal
    const [itemToDelete, setItemToDelete] =
        useState<ProcessingRequestItem | null>(null); // Item selected for deletion
    const [itemToMarkComplete, setitemToMarkComplete] =
        useState<ProcessingRequestItem | null>(null); // Item selected to Mark Complete if it is not already completed

    const fetchProcessingRequests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('processing_requests')
            .select('*');
        if (error) {
            console.error('Error fetching inventory: ', error.message);
        } else {
            setProcessingRequests(data as ProcessingRequestItem[]);
            setFilteredProcessingRequests(data as ProcessingRequestItem[]);
        }
        setLoading(false);
    };

    const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
        setSortField(field);
        setSortDirection(direction);

        // Cast field to keyof InventoryItem so TypeScript understands it
        const sortedData = [...filteredProcessingRequests].sort((a, b) => {
            if (
                a[field as keyof ProcessingRequestItem] <
                b[field as keyof ProcessingRequestItem]
            )
                return direction === 'asc' ? -1 : 1;
            if (
                a[field as keyof ProcessingRequestItem] >
                b[field as keyof ProcessingRequestItem]
            )
                return direction === 'asc' ? 1 : -1;
            return 0;
        });
        setFilteredProcessingRequests(sortedData);
    };

    const openSortModal = () => {
        setIsSortModalOpen(true);
    };

    const closeSortModal = () => {
        setIsSortModalOpen(false);
    };

    const openViewModal = (item: ProcessingRequestItem) => {
        setSelectedProcessingRequestItem(item);
        setIsViewModalOpen(true);
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedProcessingRequestItem(null);
    };

    const handleSearch = (searchTerm: string) => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const filteredData = processingRequests.filter(
            (item) =>
                item.product_name
                    .toLowerCase()
                    .includes(lowercasedSearchTerm) ||
                item.status.toLowerCase().includes(lowercasedSearchTerm)
        );
        setFilteredProcessingRequests(filteredData);
    };

    const handleDeleteItem = async () => {
        if (itemToDelete) {
            const { error } = await supabase
                .from('processing_requests')
                .delete()
                .eq('id', itemToDelete.id);
            if (error) {
                console.error('Error deleting item: ', error.message);
            } else {
                setProcessingRequests((prev) =>
                    prev.filter((item) => item.id !== itemToDelete.id)
                );
                setFilteredProcessingRequests((prev) =>
                    prev.filter((item) => item.id !== itemToDelete.id)
                );
            }
        }
        setIsDeleteModalOpen(false);
    };

    const [refresh, setRefresh] = useState(false);

    const handleRequestAdded = () => {
        setRefresh((prev) => !prev); // Trigger a refresh of the data
        setIsAddModalOpen(false); // Close the Add Request modal after adding
    };

    // Close the modal if clicked outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node)
            ) {
                setIsAddModalOpen(false);
            }
        };

        if (isAddModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAddModalOpen]);

    useEffect(() => {
        fetchProcessingRequests();
    }, [refresh]);

    const markRequestAsCompleted = async (item: ProcessingRequestItem) => {
        if (item.status === 'completed') {
            return; // Do nothing if the status is already 'completed'
        }

        try {
            const { error } = await supabase
                .from('processing_requests')
                .update({ status: 'completed' })
                .eq('id', item.id);

            if (error) {
                console.error('Error updating status: ', error.message);
            } else {
                // Update local state to reflect the change
                setProcessingRequests((prev) =>
                    prev.map((request) =>
                        request.id === item.id
                            ? { ...request, status: 'completed' }
                            : request
                    )
                );
                setFilteredProcessingRequests((prev) =>
                    prev.map((request) =>
                        request.id === item.id
                            ? { ...request, status: 'completed' }
                            : request
                    )
                );
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    };

    useEffect(() => {
        fetchProcessingRequests();
    }, []);

    return (
        <div className="py-8">
            <div className="w-11/12 mx-auto overflow-x-auto border rounded-lg shadow-lg">
                <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b">
                    <div className="flex-1 flex items-center space-x-4">
                        <input
                            type="text"
                            placeholder="Search for product name or status..."
                            className="p-2 border rounded-md flex-1"
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        <Button
                            label="Add New Request"
                            onClick={() => setIsAddModalOpen(true)}
                            variant="primary"
                        />
                    </div>
                    <FaSort
                        className="text-gray-500 cursor-pointer hover:text-green-500 ml-4"
                        size={24}
                        onClick={openSortModal}
                    />
                </div>

                <table className="min-w-full border-collapse">
                    <thead className="bg-green-600 text-white text-center">
                        <tr>
                            <th className="font-extrabold px-6 py-8">
                                Product Name
                            </th>
                            <th className="font-extrabold px-6 py-8">
                                Quantity
                            </th>
                            <th className="font-extrabold px-6 py-8">Status</th>
                            <th className="font-extrabold px-6 py-8">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProcessingRequests.map((item) => (
                            <tr
                                key={item.id}
                                className="hover:bg-gray-100 even:bg-gray-50 odd:bg-white text-center"
                            >
                                <td className="px-6 py-8 border-b">
                                    {item.product_name}
                                </td>
                                <td className="px-6 py-8 border-b">
                                    {item.quantity} kg
                                </td>
                                <td className="px-6 py-8 border-b">
                                    {item.status === 'in_progress'
                                        ? 'in progress'
                                        : item.status}
                                </td>
                                <td className="px-6 py-8 border-b">
                                    <div className="flex justify-center space-x-4">
                                        <FaEye
                                            className="text-gray-500 cursor-pointer hover:text-green-500"
                                            size={18}
                                            onClick={() => openViewModal(item)}
                                        />
                                        <FaEdit
                                            className="text-gray-500 cursor-pointer hover:text-green-500"
                                            size={18}
                                        />
                                        <FaCheckSquare
                                            className={`cursor-pointer ${
                                                item.status === 'completed'
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : 'text-gray-500 hover:text-green-500'
                                            }`}
                                            size={18}
                                            onClick={() =>
                                                markRequestAsCompleted(item)
                                            }
                                        />
                                        <FaTrashAlt
                                            className="text-gray-500 cursor-pointer hover:text-red-500"
                                            size={18}
                                            onClick={() => {
                                                setItemToDelete(item);
                                                setIsDeleteModalOpen(true);
                                            }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
                    <div
                        ref={modalRef}
                        className="bg-white p-6 rounded-lg shadow-lg"
                    >
                        <AddProcessingRequest
                            isOpen={isAddModalOpen}
                            onRequestAdded={handleRequestAdded}
                            onClose={() => setIsAddModalOpen(false)}
                        />
                    </div>
                </div>
            )}

            <SortModal
                isOpen={isSortModalOpen}
                onClose={closeSortModal}
                onSortChange={handleSortChange}
            />

            {isViewModalOpen && selectedProcessingRequestItem && (
                <ProcessingRequestsViewModal
                    isOpen={isViewModalOpen}
                    processingRequest={selectedProcessingRequestItem}
                    onClose={closeViewModal}
                />
            )}

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Product"
                content={
                    <p>
                        Are you sure you want to delete{' '}
                        <strong>{itemToDelete?.product_name}</strong>?
                    </p>
                }
                buttons={[
                    {
                        label: 'Cancel',
                        onClick: () => setIsDeleteModalOpen(false),
                        variant: 'secondary',
                    },
                    {
                        label: 'Delete',
                        onClick: handleDeleteItem,
                        variant: 'primary',
                    },
                ]}
            />
        </div>
    );
};

export default ProcessingRequestsTable;
