'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    FaTrashAlt,
    FaEye,
    FaEdit,
    FaSort,
    FaCheckSquare,
    FaPlus,
    FaDownload,
    FaUpload,
} from 'react-icons/fa';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';
import { supabase } from '@/config/supabaseClient';
import ProcessingRequestsViewModal from './ProcessingRequestsViewModal';
import SortModal from './SortModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import AddProcessingRequest from './AddProcessingRequest';
import EditProcessingRequestModal from './EditProcessingRequestModal';
import ImportCSVModal from './ImportCSVModal';
import { cn } from '@/lib/utils';
import Button from '@/components/Button';

type ProcessingRequestItem = {
    id: string;
    product_id: string;
    quantity: number;
    status: 'new' | 'in_progress' | 'completed';
    created_at: string;
    updated_at: string;
    product_name: string;
};

const formatDate = (date: Date, timeZoneOffset: number = 0) => {
    date.setHours(date.getHours() + timeZoneOffset);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
};

const ProcessingRequestsTable = (): JSX.Element => {
    const [processingRequests, setProcessingRequests] = useState<
        ProcessingRequestItem[]
    >([]);
    const [filteredProcessingRequests, setFilteredProcessingRequests] =
        useState<ProcessingRequestItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [isSortModalOpen, setIsSortModalOpen] = useState<boolean>(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
    const [sortField, setSortField] = useState<string>('product_name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [selectedProcessingRequestItem, setSelectedProcessingRequestItem] =
        useState<ProcessingRequestItem | null>(null);
    const [itemToDelete, setItemToDelete] =
        useState<ProcessingRequestItem | null>(null);
    const [itemToEdit, setItemToEdit] = useState<ProcessingRequestItem | null>(
        null
    );
    const [refresh, setRefresh] = useState<boolean>(false);
    const modalRef = useRef<HTMLDivElement | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10);

    const fetchProcessingRequests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('processing_requests')
            .select('*');
        if (error) {
            console.error('Error fetching inventory: ', error.message);
        } else {
            const productIds = data.map((item) => item.product_id);
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('id, product_name')
                .in('id', productIds);

            if (productsError) {
                console.error(
                    'Error fetching products: ',
                    productsError.message
                );
            } else {
                const productsMap = productsData.reduce<Record<string, string>>(
                    (acc, product) => {
                        acc[product.id] = product.product_name;
                        return acc;
                    },
                    {}
                );

                const enrichedData = data.map((item) => ({
                    ...item,
                    product_name: productsMap[item.product_id] || 'Unknown',
                }));

                setProcessingRequests(enrichedData as ProcessingRequestItem[]);
                setFilteredProcessingRequests(
                    enrichedData as ProcessingRequestItem[]
                );
            }
        }
        setLoading(false);
    };

    const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
        setSortField(field);
        setSortDirection(direction);

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
        setCurrentPage(1);
    };

    const handleSearch = (searchTerm: string) => {
        const normalizedSearchTerm = searchTerm.toLowerCase().trim();

        const filteredData = processingRequests.filter(
            (item) =>
                item.product_name
                    .toLowerCase()
                    .includes(normalizedSearchTerm) ||
                item.status
                    .replace(/_/g, ' ')
                    .toLowerCase()
                    .includes(normalizedSearchTerm) ||
                item.quantity
                    .toString()
                    .toLowerCase()
                    .includes(normalizedSearchTerm)
        );

        setFilteredProcessingRequests(filteredData);
        setCurrentPage(1);
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

    const handleRequestAdded = () => {
        setRefresh((prev) => !prev);
        setIsAddModalOpen(false);
    };

    const markRequestAsCompleted = async (item: ProcessingRequestItem) => {
        if (item.status === 'completed') {
            return;
        }

        try {
            const { error } = await supabase
                .from('processing_requests')
                .update({ status: 'completed' })
                .eq('id', item.id);

            if (error) {
                console.error('Error updating status: ', error.message);
            } else {
                const updatedDate = formatDate(new Date(), 1);

                const updatedItem: ProcessingRequestItem = {
                    ...item,
                    status: 'completed',
                    updated_at: updatedDate,
                };

                setProcessingRequests((prev) =>
                    prev.map((request) =>
                        request.id === item.id ? updatedItem : request
                    )
                );
                setFilteredProcessingRequests((prev) =>
                    prev.map((request) =>
                        request.id === item.id ? updatedItem : request
                    )
                );
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    };

    const handleRequestUpdated = () => {
        setRefresh((prev) => !prev);
    };

    const prepareCSVData = () => {
        const headers = [
            'ID',
            'Product ID',
            'Product Name',
            'Quantity',
            'Status',
            'Created At',
            'Updated At',
        ];
        const data = filteredProcessingRequests.map((item) => [
            item.id,
            item.product_id,
            item.product_name,
            item.quantity.toString(),
            item.status === 'in_progress'
                ? 'In Progress'
                : item.status.charAt(0).toUpperCase() + item.status.slice(1),
            item.created_at,
            item.updated_at,
        ]);
        return [headers, ...data];
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProcessingRequests.slice(
        indexOfFirstItem,
        indexOfLastItem
    );

    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () =>
        setCurrentPage(
            Math.ceil(filteredProcessingRequests.length / itemsPerPage)
        );
    const nextPage = () =>
        setCurrentPage((prev) =>
            Math.min(
                prev + 1,
                Math.ceil(filteredProcessingRequests.length / itemsPerPage)
            )
        );
    const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

    useEffect(() => {
        fetchProcessingRequests();
    }, [refresh]);

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

    return (
        <div className="py-8">
            <div className="w-11/12 mx-auto overflow-x-auto border rounded-lg shadow-lg">
                <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b">
                    <div className="flex-1 flex items-center space-x-4">
                        <input
                            type="text"
                            placeholder="Search for product name, quantity or status..."
                            className="p-2 border rounded-md flex-1"
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        <Button
                            label="New Request"
                            icon={<FaPlus />}
                            onClick={() => setIsAddModalOpen(true)}
                            variant="primary"
                        />
                        <Button
                            label="Export CSV"
                            icon={<FaDownload />}
                            onClick={() => {
                                const csvContent = prepareCSVData()
                                    .map((row) => row.join(','))
                                    .join('\n');
                                const csvLink = document.createElement('a');
                                csvLink.href = URL.createObjectURL(
                                    new Blob([csvContent], { type: 'text/csv' })
                                );
                                csvLink.setAttribute(
                                    'download',
                                    'processing-requests.csv'
                                );
                                document.body.appendChild(csvLink);
                                csvLink.click();
                                document.body.removeChild(csvLink);
                            }}
                            variant="primary"
                        />
                        <Button
                            label="Import CSV"
                            icon={<FaUpload />}
                            onClick={() => setIsImportModalOpen(true)}
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
                                Quantity
                            </th>
                            <th className="font-extrabold px-6 py-8">Status</th>
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
                                    <span
                                        className={`inline-block ${
                                            item.status === 'completed'
                                                ? 'bg-[#c6efcd]'
                                                : item.status === 'in_progress'
                                                  ? 'bg-[#feeb9c]'
                                                  : item.status === 'new'
                                                    ? 'bg-[#ffc8ce]'
                                                    : ''
                                        } px-2 py-1 rounded-full w-[120px] text-center`}
                                    >
                                        {item.status
                                            ? item.status === 'in_progress'
                                                ? 'In Progress'
                                                : item.status
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                  item.status.slice(1)
                                            : 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-8 border-b">
                                    <div className="flex justify-center space-x-4">
                                        <FaEye
                                            className="text-gray-500 cursor-pointer hover:text-green-500"
                                            size={18}
                                            onClick={() => {
                                                setSelectedProcessingRequestItem(
                                                    item
                                                );
                                                setIsViewModalOpen(true);
                                            }}
                                        />
                                        <FaEdit
                                            className="text-gray-500 cursor-pointer hover:text-green-500"
                                            size={18}
                                            onClick={() => {
                                                setItemToEdit(item);
                                                setIsEditModalOpen(true);
                                            }}
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
                <div className="flex items-center justify-between px-2 py-4 border-t">
                    <button
                        onClick={goToFirstPage}
                        disabled={currentPage === 1}
                        className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full border mr-2',
                            currentPage === 1
                                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                        )}
                        aria-label="Go to first page"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full border',
                            currentPage === 1
                                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                        )}
                        aria-label="Go to previous page"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="text-sm text-gray-500">
                        Page {currentPage} of{' '}
                        {Math.ceil(
                            filteredProcessingRequests.length / itemsPerPage
                        )}
                    </div>
                    <button
                        onClick={nextPage}
                        disabled={
                            currentPage ===
                            Math.ceil(
                                filteredProcessingRequests.length / itemsPerPage
                            )
                        }
                        className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full border',
                            currentPage ===
                                Math.ceil(
                                    filteredProcessingRequests.length /
                                        itemsPerPage
                                )
                                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                        )}
                        aria-label="Go to next page"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                        onClick={goToLastPage}
                        disabled={
                            currentPage ===
                            Math.ceil(
                                filteredProcessingRequests.length / itemsPerPage
                            )
                        }
                        className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full border ml-2',
                            currentPage ===
                                Math.ceil(
                                    filteredProcessingRequests.length /
                                        itemsPerPage
                                )
                                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                        )}
                        aria-label="Go to last page"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
            {isEditModalOpen && itemToEdit && (
                <EditProcessingRequestModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    processingRequest={itemToEdit}
                    onRequestUpdated={handleRequestUpdated}
                />
            )}
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
                onClose={() => setIsSortModalOpen(false)}
                onSortChange={handleSortChange}
            />
            {isViewModalOpen && selectedProcessingRequestItem && (
                <ProcessingRequestsViewModal
                    isOpen={isViewModalOpen}
                    processingRequest={selectedProcessingRequestItem}
                    onClose={() => setIsViewModalOpen(false)}
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

export default ProcessingRequestsTable;
