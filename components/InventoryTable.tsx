import React, { useState, useEffect } from 'react';
import {
    FaTrashAlt,
    FaEye,
    FaEdit,
    FaPlus,
    FaSearch,
    FaCalendarAlt,
    FaFilter,
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

    const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [dateFilter, setDateFilter] = useState<string>('');
    const [isSortModalOpen, setIsSortModalOpen] = useState<boolean>(false);
    const [refresh, setRefresh] = useState<boolean>(false);

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

    // const handlePageChange = (direction: 'next' | 'prev') => {
    //     if (
    //         direction === 'next' &&
    //         currentPage < Math.ceil(filteredInventory.length / itemsPerPage)
    //     ) {
    //         setCurrentPage((prev) => prev + 1);
    //     } else if (direction === 'prev' && currentPage > 1) {
    //         setCurrentPage((prev) => prev - 1);
    //     }
    // };

    useEffect(() => {
        fetchInventory();
    }, []);

    // const prepareCSVData = () => {
    //     const headers = [
    //         'ID',
    //         'Product ID',
    //         'Product Name',
    //         'Quantity',
    //         'Product Description',
    //         'Created At',
    //         'Updated At',
    //     ];
    //     const data = filteredInventory.map((item) => [
    //         item.id,
    //         item.product_name,
    //         item.quantity.toString(),
    //         item.product_description,
    //         item.reserved_location,
    //         item.created_at,
    //         item.updated_at,
    //     ]);
    //     return [headers, ...data];
    // };

    // Calculate items for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredInventory.slice(startIndex, endIndex);

    // return (
    //     <div className="py-8 bg-green-50 -mt-5">
    //         {showSuccess && <SuccessAnimation />}
    //         <div className="w-11/12 mx-auto overflow-x-auto border rounded-lg shadow-lg">
    //             <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b">
    //                 <div className="flex-1 flex items-center space-x-4">
    //                     <input
    //                         type="text"
    //                         placeholder="Search Products"
    //                         className="p-2 border rounded-md flex-1"
    //                         onChange={(e) => handleSearch(e.target.value)}
    //                     />
    //                     <Button
    //                         label="Log Products"
    //                         variant="primary"
    //                         onClick={() => router.push('/inbound-product-logging')}
    //                         icon={<FaTruck />}
    //                         className="flex items-center px-4 py-2 text-sm"
    //                     />
    //                     <Button
    //                         label="Add New Product"
    //                         variant="primary"
    //                         onClick={() => router.push('/add-product')}
    //                         icon={<FaPlus />}
    //                         className="flex items-center px-4 py-2 text-sm"
    //                     />
    //                     <Button
    //                         label="Import CSV"
    //                         icon={
    //                             <CiExport
    //                                 style={{ strokeWidth: 2 }}
    //                                 size={20}
    //                             />
    //                         }
    //                         onClick={() => setIsImportModalOpen(true)}
    //                         variant="primary"
    //                     />
    //                                         <Button
    //                         label="Export CSV"
    //                         icon={
    //                             <CiImport
    //                                 style={{ strokeWidth: 2 }}
    //                                 size={20}
    //                             />
    //                         }
    //                         onClick={() => {
    //                             // const csvContent = prepareCSVData()
    //                             //     .map((row) => row.join(','))
    //                             //     .join('\n');
    //                             // const csvLink = document.createElement('a');
    //                             // csvLink.href = URL.createObjectURL(
    //                             //     new Blob([csvContent], { type: 'text/csv' })
    //                             // );
    //                             // csvLink.setAttribute(
    //                             //     'download',
    //                             //     'processing-requests.csv'
    //                             // );
    //                             // document.body.appendChild(csvLink);
    //                             // csvLink.click();
    //                             // document.body.removeChild(csvLink);
    //                         }}
    //                         variant="primary"
    //                     />
    //                 </div>
    //                 <FaSort
    //                     className="text-gray-500 cursor-pointer hover:text-green-500 ml-4"
    //                     size={24}
    //                     onClick={() => setIsSortModalOpen(true)}
    //                 />
    //             </div>

    //             <table className="min-w-full border-collapse">
    //                 <thead className="bg-green-600 text-white text-center">
    //                     <tr>
    //                         <th className="font-extrabold px-6 py-8">
    //                             Product Name
    //                         </th>
    //                         <th className="font-extrabold px-6 py-8">
    //                             Quantity (kg)
    //                         </th>
    //                         <th className="font-extrabold px-6 py-8">
    //                             Last Updated Date
    //                         </th>
    //                         <th className="font-extrabold px-6 py-8">Actions</th>
    //                     </tr>
    //                 </thead>
    //                 <tbody>
    //                     {currentItems.map((item) => (
    //                         <tr
    //                             key={item.id}
    //                             className="hover:bg-gray-100 even:bg-gray-50 odd:bg-white text-center"
    //                         >
    //                             <td className="px-6 py-8 border-b">
    //                                 {item.product_name}
    //                             </td>
    //                             <td className="px-6 py-8 border-b">{item.quantity}</td>
    //                             <td className="px-6 py-8 border-b">
    //                                 {`${new Date(item.updated_at).getDate().toString().padStart(2, '0')}/${(new Date(item.updated_at).getMonth() + 1).toString().padStart(2, '0')}/${new Date(item.updated_at).getFullYear()}`}
    //                             </td>
    //                             <td className="px-6 py-8 border-b">
    //                                 <div className="flex justify-center space-x-4">
    //                                     <FaEye
    //                                         className="text-gray-500 cursor-pointer hover:text-green-500"
    //                                         onClick={() => openViewModal(item)}
    //                                     />
    //                                     <FaEdit
    //                                         className="text-gray-500 cursor-pointer hover:text-green-500"
    //                                         onClick={() =>
    //                                             router.push(
    //                                                 `/edit-product/${item.id}`
    //                                             )
    //                                         }
    //                                     />
    //                                     <FaTrashAlt
    //                                         className="text-gray-500 cursor-pointer hover:text-red-500"
    //                                         onClick={() => {
    //                                             setItemToDelete(item);
    //                                             setIsDeleteModalOpen(true);
    //                                         }}
    //                                     />
    //                                 </div>
    //                             </td>
    //                         </tr>
    //                     ))}
    //                 </tbody>
    //             </table>

    //             <div className="flex justify-center items-center p-4 border-t bg-white rounded-b-lg space-x-4">
    //                 <FaAngleDoubleLeft
    //                     className={`cursor-pointer ${
    //                         currentPage === 1
    //                             ? 'text-gray-300 cursor-not-allowed'
    //                             : 'hover:text-green-500'
    //                     }`}
    //                     onClick={currentPage > 1 ? toFirstPage : undefined}
    //                     size={20}
    //                 />
    //                 <FaAngleLeft
    //                     className={`cursor-pointer ${
    //                         currentPage === 1
    //                             ? 'text-gray-300 cursor-not-allowed'
    //                             : 'hover:text-green-500'
    //                     }`}
    //                     onClick={currentPage > 1 ? prevPage : undefined}
    //                     size={20}
    //                 />
    //                 <span className="text-gray-600">
    //                     Page {currentPage} of {totalPages || 1}
    //                 </span>
    //                 <FaAngleRight
    //                     className={`cursor-pointer ${
    //                         currentPage === totalPages || totalPages === 0
    //                             ? 'text-gray-300 cursor-not-allowed'
    //                             : 'hover:text-green-500'
    //                     }`}
    //                     onClick={
    //                         currentPage < totalPages ? nextPage : undefined
    //                     }
    //                     size={20}
    //                 />
    //                 <FaAngleDoubleRight
    //                     className={`cursor-pointer ${
    //                         currentPage === totalPages || totalPages === 0
    //                             ? 'text-gray-300 cursor-not-allowed'
    //                             : 'hover:text-green-500'
    //                     }`}
    //                     onClick={
    //                         currentPage < totalPages ? toLastPage : undefined
    //                     }
    //                     size={20}
    //                 />
    //             </div>
    //         </div>

    //         <SortModal
    //             isOpen={isSortModalOpen}
    //             onClose={() => setIsSortModalOpen(false)}
    //             onSortChange={handleSortChange}
    //         />
    //         {isViewModalOpen && selectedInventoryItem && (
    //             <InventoryViewModal
    //                 isOpen={isViewModalOpen}
    //                 onClose={closeViewModal}
    //                 inventoryId={selectedInventoryItem.id}
    //             />
    //         )}
    //         <DeleteConfirmationModal
    //             isOpen={isDeleteModalOpen}
    //             onClose={() => setIsDeleteModalOpen(false)}
    //             title="Delete Product"
    //             content={
    //                 <p>
    //                     Are you sure you want to delete{' '}
    //                     <strong>{itemToDelete?.product_name}</strong>?
    //                 </p>
    //             }
    //             buttons={[
    //                 {
    //                     label: 'Cancel',
    //                     onClick: () => setIsDeleteModalOpen(false),
    //                     variant: 'secondary',
    //                 },
    //                 {
    //                     label: 'Delete',
    //                     onClick: handleDeleteItem,
    //                     variant: 'primary',
    //                 },
    //             ]}
    //         />
    //         <ImportCSVModal
    //             isOpen={isImportModalOpen}
    //             onClose={() => setIsImportModalOpen(false)}
    //             onImportSuccess={() => {
    //                 setRefresh((prev) => !prev);
    //                 setIsImportModalOpen(false);
    //             }}
    //         />
    //     </div>
    // );
    // };

    return (
        <div className="py-8 bg-green-50 -mt-5 min-h-screen">
            {' '}
            {/* Ensure the background extends to fill the screen */}
            {showSuccess && <SuccessAnimation />}
            <div className="w-11/12 mx-auto overflow-x-auto border rounded-lg shadow-lg bg-white">
                {' '}
                {/* Set the inner content to white */}
                <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b">
                    <div className="flex-1 flex items-center space-x-4">
                        <input
                            type="text"
                            placeholder="Search Products"
                            className="p-2 border rounded-md flex-1"
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        <Button
                            label="Log Products"
                            variant="primary"
                            onClick={() =>
                                router.push('/inbound-product-logging')
                            }
                            icon={<FaTruck />}
                            className="flex items-center px-4 py-2 text-sm"
                        />
                        <Button
                            label="Add New Product"
                            variant="primary"
                            onClick={() => router.push('/add-product')}
                            icon={<FaPlus />}
                            className="flex items-center px-4 py-2 text-sm"
                        />
                        <Button
                            label="Import CSV"
                            icon={
                                <CiExport
                                    style={{ strokeWidth: 2 }}
                                    size={20}
                                />
                            }
                            onClick={() => setIsImportModalOpen(true)}
                            variant="primary"
                        />
                        <Button
                            label="Export CSV"
                            icon={
                                <CiImport
                                    style={{ strokeWidth: 2 }}
                                    size={20}
                                />
                            }
                            onClick={() => {
                                // CSV export logic (optional)
                            }}
                            variant="primary"
                        />
                    </div>
                    <FaSort
                        className="text-gray-500 cursor-pointer hover:text-green-500 ml-4"
                        size={24}
                        onClick={() => setIsSortModalOpen(true)}
                    />
                </div>
                <table className="min-w-full border-collapse">
                    <thead className="bg-green-600 text-white text-center">
                        <tr>
                            <th className="font-extrabold px-6 py-8">
                                Product Name
                            </th>
                            <th className="font-extrabold px-6 py-8">
                                Quantity (kg)
                            </th>
                            <th className="font-extrabold px-6 py-8">
                                Last Updated Date
                            </th>
                            <th className="font-extrabold px-6 py-8">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((item) => (
                            <tr
                                key={item.id}
                                className="hover:bg-gray-100 even:bg-gray-50 odd:bg-white text-center"
                            >
                                <td className="px-6 py-8 border-b">
                                    {item.product_name}
                                </td>
                                <td className="px-6 py-8 border-b">
                                    {item.quantity}
                                </td>
                                <td className="px-6 py-8 border-b">
                                    {`${new Date(item.updated_at).getDate().toString().padStart(2, '0')}/${(new Date(item.updated_at).getMonth() + 1).toString().padStart(2, '0')}/${new Date(item.updated_at).getFullYear()}`}
                                </td>
                                <td className="px-6 py-8 border-b">
                                    <div className="flex justify-center space-x-4">
                                        <FaEye
                                            className="text-gray-500 cursor-pointer hover:text-green-500"
                                            onClick={() => openViewModal(item)}
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
                        ))}
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
