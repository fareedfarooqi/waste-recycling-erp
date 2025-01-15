import React, { useState, useEffect } from 'react';
import {
    FaTrashAlt,
    FaEye,
    FaEdit,
    FaPlus,
    // FaCalendarAlt,
    FaSort,
    FaAngleLeft,
    FaAngleRight,
    FaAngleDoubleLeft,
    FaAngleDoubleRight,
    FaTruck,
} from 'react-icons/fa';
import { CiImport, CiExport } from 'react-icons/ci';
import { supabase } from '@/config/supabaseClient';
import Button from './Button';
import InventoryViewModal from './InventoryViewModal';
import SortModal from './SortModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useRouter } from 'next/navigation';
import ImportCSVModal from './ImportCSVModal';
import SuccessAnimation from './SuccessAnimation';
import { GoSearch } from 'react-icons/go';

type InventoryItem = {
    id: string;
    product_name: string;
    quantity: number;
    created_at: string;
    updated_at: string;
    product_description: string;
    reserved_location: string;
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

    const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

    const [, setSearchTerm] = useState<string>('');
    // const [, setDateFilter] = useState<string>('');
    const [isSortModalOpen, setIsSortModalOpen] = useState<boolean>(false);
    const [, setRefresh] = useState<boolean>(false);

    const [currentPage, setCurrentPage] = useState<number>(1);
    // const itemsPerPage = 10;
    const [itemsPerPage] = useState<number>(10);

    const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

    const [showSuccess, setShowSuccess] = useState(false);

    const toFirstPage = () => setCurrentPage(1);
    const toLastPage = () => {
        if (totalPages !== 0) {
            setCurrentPage(totalPages);
        }
    };

    const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const nextPage = () =>
        currentPage < totalPages && setCurrentPage(currentPage + 1);

    const fetchInventory = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select(
                'id, product_name, quantity, created_at, updated_at, product_description, reserved_location'
            );
    
        if (error) {
            console.error('Error fetching products: ', error.message);
        } else {
            const formattedData = data.map((item) => ({
                id: item.id,
                product_name: item.product_name,
                quantity: item.quantity,
                created_at: item.created_at,
                updated_at: item.updated_at,
                product_description: item.product_description || 'N/A',
                reserved_location: item.reserved_location || 'N/A',
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

    // const handleDateFilter = (date: string) => {
    //     setDateFilter(date);
    //     const filteredData = inventory.filter((item) => {
    //         const itemDate = new Date(item.created_at);
    //         const formattedItemDate = itemDate.toISOString().slice(0, 10);
    //         return formattedItemDate === date;
    //     });
    //     setFilteredInventory(filteredData);
    //     setCurrentPage(1); // Reset to first page after filtering
    // };

    // const handleFilter = () => {
    //     setIsSortModalOpen(true);
    // };

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

                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                }, 700);
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

    useEffect(() => {
        fetchInventory();
    }, []);
    
    const prepareCSVData = () => {
        const headers = [
            'ID',
            'Product Name',
            'Quantity (kg)',
            'Product Description',
            'Reserved Location',
            'Created Date',
            'Last Updated Date',
        ];
    
        const data = filteredInventory.map((item) => [
            item.id,
            item.product_name,
            item.quantity.toString(),
            `"${(item.product_description || 'N/A').replace(/"/g, '""')}"`, // Wrap in quotes and escape any existing quotes
            `"${(item.reserved_location || 'N/A').replace(/"/g, '""')}"`, // Wrap in quotes and escape any existing quotes
            item.created_at
                ? new Date(item.created_at).toLocaleDateString('en-AU') // Format as dd/mm/yyyy
                : 'N/A',
            item.updated_at
                ? new Date(item.updated_at).toLocaleDateString('en-AU') // Format as dd/mm/yyyy
                : 'N/A',
        ]);
    
        return [headers, ...data];
    };
    

    // Calculate items for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredInventory.slice(startIndex, endIndex);

    return (
        <div className="py-8 bg-green-50 -mt-5 min-h-screen">
            {' '}
            {/* Ensure the background extends to fill the screen */}
            {showSuccess && <SuccessAnimation />}
            <div className="w-11/12 mx-auto overflow-x-auto border rounded-lg shadow-lg bg-white">
                {' '}
                {/* Set the inner content to white */}
                <div className="flex items-center justify-between p-4 border-b bg-white">
                    {/* Search Bar with Icon */}
                    <div className="relative flex items-center flex-grow mr-4">
                        <GoSearch className="absolute left-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for Products"
                            className="w-full max-w-[98%] p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center space-x-4 mr-4">
                        <Button
                            label="Log Products"
                            variant="primary"
                            onClick={() =>
                                router.push('/inbound-product-logging')
                            }
                            // icon={<FaTruck />}
                            icon={
                                <FaTruck
                                    style={{ strokeWidth: 2 }}
                                    size={18}
                                />
                            }
                            className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-green-600 text-white rounded hover:bg-green-500 transition whitespace-nowrap min-w-[120px]"
                        />
                        <Button
                            label="Add Product"
                            variant="primary"
                            onClick={() => router.push('/add-product')}
                            // icon={<FaPlus />}
                            icon={
                                <FaPlus
                                    style={{ strokeWidth: 2 }}
                                    size={18}
                                />
                            }
                            className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-green-600 text-white rounded hover:bg-green-500 transition whitespace-nowrap min-w-[120px]"
                        />
                        <Button
                            label="Import CSV"
                            icon={
                                <CiImport
                                    style={{ strokeWidth: 2 }}
                                    size={20}
                                />
                            }
                            onClick={() => setIsImportModalOpen(true)}
                            variant="primary"
                            className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-green-600 text-white rounded hover:bg-green-500 transition whitespace-nowrap min-w-[120px]"
                        />

                        <Button
                            label="Export CSV"
                            icon={<CiExport style={{ strokeWidth: 2 }} size={20} />}
                            onClick={() => {
                                const csvContent = prepareCSVData()
                                    .map((row) => row.join(',')) // Convert each row to a CSV string
                                    .join('\n'); // Combine rows with newlines

                                const blob = new Blob([csvContent], { type: 'text/csv' });
                                const csvUrl = URL.createObjectURL(blob);

                                const link = document.createElement('a');
                                link.href = csvUrl;
                                link.setAttribute('download', 'inventory-list.csv'); // CSV filename
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                            variant="primary"
                            className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-green-600 text-white rounded hover:bg-green-500 transition whitespace-nowrap min-w-[120px]"
                        />

                    </div>

                    {/* Sort Arrows */}
                    <FaSort
                        className="text-gray-500 cursor-pointer hover:text-green-500 ml-4"
                        size={26}
                        onClick={() => setIsSortModalOpen(true)}
                    />
                </div>
                <table className="min-w-full border-collapse">
                    <thead className="bg-green-600 text-white text-center">
                        <tr>
                            <th className="text-xl font-bold px-6 py-8">
                                Product Name
                            </th>
                            <th className="text-xl font-bold px-6 py-8">
                                Quantity (kg)
                            </th>
                            <th className="text-xl font-bold px-6 py-8">
                                Last Updated Date
                            </th>
                            <th className="text-xl font-bold px-6 py-8">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInventory.length > 0 ? (
                            currentItems.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-100 even:bg-gray-100 odd:bg-white text-center"
                                >
                                    <td className="text-base px-6 py-4 border-b">
                                        {item.product_name}
                                    </td>
                                    <td className="text-base px-6 py-4 border-b">
                                        {item.quantity}
                                    </td>
                                    <td className="text-base px-6 py-4 border-b">
                                        {`${new Date(item.updated_at).getDate().toString().padStart(2, '0')}/${(new Date(item.updated_at).getMonth() + 1).toString().padStart(2, '0')}/${new Date(item.updated_at).getFullYear()}`}
                                    </td>
                                    <td className="text-base px-6 py-4 border-b">
                                        <div className="flex justify-center space-x-4">
                                            <FaEye
                                                className="text-gray-500 cursor-pointer hover:text-green-500"
                                                onClick={() =>
                                                    openViewModal(item)
                                                }
                                            />
                                            <FaEdit
                                                className="text-gray-500 cursor-pointer hover:text-green-500"
                                                onClick={() =>
                                                    router.push(
                                                        `/edit-product/${item.id}`
                                                    )
                                                }
                                            />
                                            <FaTrashAlt
                                                className="text-gray-500 cursor-pointer hover:text-red-500"
                                                onClick={() => {
                                                    setItemToDelete(item);
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
                                    colSpan={4}
                                    className="text-center text-gray-500 font-semibold py-10"
                                >
                                    No products available. Add a product to get
                                    started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="flex justify-center items-center p-4 border-t bg-white rounded-b-lg space-x-4">
                    <FaAngleDoubleLeft
                        className={`cursor-pointer ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:text-green-500'}`}
                        onClick={currentPage > 1 ? toFirstPage : undefined}
                        size={20}
                    />
                    <FaAngleLeft
                        className={`cursor-pointer ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:text-green-500'}`}
                        onClick={currentPage > 1 ? prevPage : undefined}
                        size={20}
                    />
                    <span className="text-gray-600">
                        Page {currentPage} of {totalPages || 1}
                    </span>
                    <FaAngleRight
                        className={`cursor-pointer ${currentPage === totalPages || totalPages === 0 ? 'text-gray-300 cursor-not-allowed' : 'hover:text-green-500'}`}
                        onClick={
                            currentPage < totalPages ? nextPage : undefined
                        }
                        size={20}
                    />
                    <FaAngleDoubleRight
                        className={`cursor-pointer ${currentPage === totalPages || totalPages === 0 ? 'text-gray-300 cursor-not-allowed' : 'hover:text-green-500'}`}
                        onClick={
                            currentPage < totalPages ? toLastPage : undefined
                        }
                        size={20}
                    />
                </div>
            </div>
            <SortModal
                isOpen={isSortModalOpen}
                onClose={() => setIsSortModalOpen(false)}
                onSortChange={handleSortChange}
            />
            {isViewModalOpen && selectedInventoryItem && (
                <InventoryViewModal
                    isOpen={isViewModalOpen}
                    onClose={closeViewModal}
                    inventoryId={selectedInventoryItem.id}
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
            <ImportCSVModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImportSuccess={() => {
                    setRefresh((prev) => !prev);
                    setIsImportModalOpen(false);
                }}
            />
        </div>
    );
};

export default InventoryTable;