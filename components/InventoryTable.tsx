import React, { useState, useEffect } from 'react';
import {
    FaTrashAlt,
    FaEye,
    FaEdit,
    FaPlus,
    FaSearch,
    FaCalendarAlt,
    FaFilter,
    FaChevronLeft,
    FaChevronRight,
    FaTruck,
} from 'react-icons/fa';
import { supabase } from '@/config/supabaseClient';
import Button from './Button';
import InventoryViewModal from './InventoryViewModal';
import SortModal from './SortModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useRouter } from 'next/navigation';

type InventoryItem = {
    id: string;
    product_name: string;
    quantity: number;
    created_at: string;
    updated_at: string;
};

const InventoryTable = (): JSX.Element => {
    const router = useRouter();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(
        []
    );
    const [, setLoading] = useState<boolean>(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
    const [selectedInventoryItem, setSelectedInventoryItem] =
        useState<InventoryItem | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(
        null
    );

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [dateFilter, setDateFilter] = useState<string>('');
    const [isSortModalOpen, setIsSortModalOpen] = useState<boolean>(false);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    const fetchInventory = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('id, product_name, quantity, created_at, updated_at');

        if (error) {
            console.error('Error fetching products: ', error.message);
        } else {
            const formattedData = data.map((item) => ({
                id: item.id,
                product_name: item.product_name,
                quantity: item.quantity,
                created_at: item.created_at,
                updated_at: item.updated_at,
            }));
            setInventory(formattedData);
            setFilteredInventory(formattedData);
        }
        setLoading(false);
    };

    const handleSearch = (searchTerm: string) => {
        setSearchTerm(searchTerm);
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const filteredData = inventory.filter((item) =>
            item.product_name.toLowerCase().includes(lowercasedSearchTerm)
        );
        setFilteredInventory(filteredData);
        setCurrentPage(1); // Reset to first page after filtering
    };

    const handleDateFilter = (date: string) => {
        setDateFilter(date);
        const filteredData = inventory.filter((item) => {
            const itemDate = new Date(item.created_at);
            const formattedItemDate = itemDate.toISOString().slice(0, 10);
            return formattedItemDate === date;
        });
        setFilteredInventory(filteredData);
        setCurrentPage(1); // Reset to first page after filtering
    };

    const handleFilter = () => {
        setIsSortModalOpen(true);
    };

    const openViewModal = (item: InventoryItem) => {
        setSelectedInventoryItem(item);
        setIsViewModalOpen(true);
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedInventoryItem(null);
    };

    const handleDeleteItem = async () => {
        if (itemToDelete) {
            const { error } = await supabase
                .from('products')
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

    const handleSortChange = (sortBy: string, direction: 'asc' | 'desc') => {
        const sortedData = [...filteredInventory].sort((a, b) => {
            const key = sortBy as keyof InventoryItem;
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        setFilteredInventory(sortedData);
    };

    const handlePageChange = (direction: 'next' | 'prev') => {
        if (
            direction === 'next' &&
            currentPage < Math.ceil(filteredInventory.length / itemsPerPage)
        ) {
            setCurrentPage((prev) => prev + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    // Calculate items for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredInventory.slice(startIndex, endIndex);

    return (
        <div className="flex justify-center py-8">
            <div className="w-11/12 overflow-x-auto border rounded-lg shadow-lg">
                <div className="flex justify-between items-center p-4 space-x-4">
                    <div className="flex space-x-4">
                        <div className="flex items-center">
                            <FaSearch className="mr-2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                className="p-2 border rounded-md"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="text-gray-500" />
                            <input
                                type="date"
                                className="p-2 border rounded-md"
                                placeholder="YYYY-MM-DD"
                                value={dateFilter}
                                onChange={(e) =>
                                    handleDateFilter(e.target.value)
                                }
                            />
                            <span className="text-sm text-gray-600 italic">
                                Search by Date
                            </span>
                        </div>

                        <Button
                            label="Filter"
                            variant="secondary"
                            icon={<FaFilter />}
                            onClick={handleFilter}
                            className="flex items-center px-4 py-2 text-sm"
                        />
                    </div>

                    <Button
                        label="Add New Product"
                        variant="primary"
                        onClick={() => router.push('/add-product')}
                        icon={<FaPlus />}
                        className="flex items-center px-4 py-2 text-sm"
                    />

                    <Button
                        label="Log Products"
                        variant="primary"
                        onClick={() => router.push('/inbound-product-logging')}
                        icon={<FaTruck />}
                        className="flex items-center px-4 py-2 text-sm"
                    />
                </div>

                <table className="min-w-full border-collapse mt-6">
                    <thead className="bg-green-600 text-white text-center sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-3 text-center">
                                Product Name
                            </th>
                            <th className="px-6 py-3 text-center">
                                Quantity (kg)
                            </th>
                            <th className="px-6 py-3 text-center">
                                Last Updated Date
                            </th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((item) => (
                            <tr
                                key={item.id}
                                className="even:bg-gray-50 odd:bg-white text-center hover:bg-gray-100"
                            >
                                <td className="px-6 py-4">
                                    {item.product_name}
                                </td>
                                <td className="px-6 py-4">{item.quantity}</td>
                                <td className="px-6 py-4">
                                    {`${new Date(item.updated_at).getDate().toString().padStart(2, '0')}/${(new Date(item.updated_at).getMonth() + 1).toString().padStart(2, '0')}/${new Date(item.updated_at).getFullYear()}`}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center space-x-4">
                                        <FaEye
                                            className="text-gray-500 hover:text-green-500 cursor-pointer"
                                            onClick={() => openViewModal(item)}
                                        />
                                        <FaEdit
                                            className="text-gray-500 hover:text-green-500 cursor-pointer"
                                            onClick={() =>
                                                router.push(
                                                    `/edit-product/${item.id}`
                                                )
                                            }
                                        />
                                        <FaTrashAlt
                                            className="text-gray-500 hover:text-red-500 cursor-pointer"
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

                <div className="flex justify-between items-center p-4">
                    <button
                        className="p-2 border rounded-md hover:bg-gray-100"
                        onClick={() => handlePageChange('prev')}
                        disabled={currentPage === 1}
                    >
                        <FaChevronLeft />
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {currentPage} of{' '}
                        {Math.ceil(filteredInventory.length / itemsPerPage)}
                    </span>
                    <button
                        className="p-2 border rounded-md hover:bg-gray-100"
                        onClick={() => handlePageChange('next')}
                        disabled={
                            currentPage ===
                            Math.ceil(filteredInventory.length / itemsPerPage)
                        }
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>

            {isViewModalOpen && selectedInventoryItem && (
                <InventoryViewModal
                    isOpen={isViewModalOpen}
                    onClose={closeViewModal}
                    inventoryId={selectedInventoryItem.id}
                />
            )}

            <SortModal
                isOpen={isSortModalOpen}
                onClose={() => setIsSortModalOpen(false)}
                onSortChange={handleSortChange}
            />

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
