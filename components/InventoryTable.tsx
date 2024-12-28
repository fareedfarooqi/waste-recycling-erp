'use client';

import React, { useState, useEffect } from 'react';
import { FaTrashAlt, FaEye, FaEdit, FaSort } from 'react-icons/fa';
import { supabase } from '@/config/supabaseClient';
import Button from './Button';
import InventoryViewModal from './InventoryViewModal';
import SortModal from './SortModal';
import DeleteConfirmationModal from './DeleteConfirmationModal'; // Import updated DeleteConfirmationModal

type InventoryItem = {
    id: string;
    product_name: string;
    product_id: string;
    quantity: number;
    status: 'inbound' | 'outbound' | 'processed';
    created_at: string;
    updated_at: string;
};

const InventoryTable = (): JSX.Element => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(
        []
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [isSortModalOpen, setIsSortModalOpen] = useState<boolean>(false);
    const [sortField, setSortField] = useState<string>('product_name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
    const [selectedInventoryItem, setSelectedInventoryItem] =
        useState<InventoryItem | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false); // State for delete confirmation modal
    const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(
        null
    ); // Item selected for deletion

    const fetchInventory = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('inventory').select('*');
        if (error) {
            console.error('Error fetching inventory: ', error.message);
        } else {
            setInventory(data as InventoryItem[]);
            setFilteredInventory(data as InventoryItem[]);
        }
        setLoading(false);
    };

    const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
        setSortField(field);
        setSortDirection(direction);

        // Cast field to keyof InventoryItem so TypeScript understands it
        const sortedData = [...filteredInventory].sort((a, b) => {
            if (
                a[field as keyof InventoryItem] <
                b[field as keyof InventoryItem]
            )
                return direction === 'asc' ? -1 : 1;
            if (
                a[field as keyof InventoryItem] >
                b[field as keyof InventoryItem]
            )
                return direction === 'asc' ? 1 : -1;
            return 0;
        });
        setFilteredInventory(sortedData);
    };

    const openSortModal = () => {
        setIsSortModalOpen(true);
    };

    const closeSortModal = () => {
        setIsSortModalOpen(false);
    };

    const openViewModal = (item: InventoryItem) => {
        setSelectedInventoryItem(item);
        setIsViewModalOpen(true);
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedInventoryItem(null);
    };

    const handleSearch = (searchTerm: string) => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const filteredData = inventory.filter(
            (item) =>
                item.product_name
                    .toLowerCase()
                    .includes(lowercasedSearchTerm) ||
                item.status.toLowerCase().includes(lowercasedSearchTerm)
        );
        setFilteredInventory(filteredData);
    };

    const handleDeleteItem = async () => {
        if (itemToDelete) {
            const { error } = await supabase
                .from('inventory')
                .delete()
                .eq('id', itemToDelete.id);
            if (error) {
                console.error('Error deleting item: ', error.message);
            } else {
                setInventory((prev) =>
                    prev.filter((item) => item.id !== itemToDelete.id)
                );
                setFilteredInventory((prev) =>
                    prev.filter((item) => item.id !== itemToDelete.id)
                );
            }
        }
        setIsDeleteModalOpen(false);
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    return (
        <div className="flex justify-center py-8">
            <div className="w-11/12 overflow-x-auto border rounded-lg shadow-lg">
                <div className="flex justify-between items-center p-4">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="p-2 border rounded-md w-1/3"
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <FaSort
                        className="text-gray-500 cursor-pointer hover:text-green-500"
                        size={24}
                        onClick={openSortModal}
                    />
                </div>

                <table className="min-w-full border-collapse mt-6">
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
                        {filteredInventory.map((item) => (
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
                                    {item.status}
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

            {/* Sort Modal */}
            <SortModal
                isOpen={isSortModalOpen}
                onClose={closeSortModal}
                onSortChange={handleSortChange}
            />

            {/* View Inventory Item Modal */}
            {isViewModalOpen && selectedInventoryItem && (
                <InventoryViewModal
                    isOpen={isViewModalOpen}
                    inventory={selectedInventoryItem}
                    onClose={closeViewModal}
                />
            )}

            {/* Delete Confirmation Modal */}
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

export default InventoryTable;
