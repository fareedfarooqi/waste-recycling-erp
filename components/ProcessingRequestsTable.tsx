'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GoSearch } from 'react-icons/go';
import SuccessAnimation from './SuccessAnimation';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import {
    FaTrashAlt,
    FaEye,
    FaEdit,
    FaSort,
    FaCheckSquare,
    FaPlus,
    FaAngleDoubleLeft,
    FaAngleLeft,
    FaAngleRight,
    FaAngleDoubleRight,
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
import { CiImport, CiExport } from 'react-icons/ci';
import { updateSession } from '@/utils/supabase/middleware';

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
    const totalPages = Math.ceil(
        filteredProcessingRequests.length / itemsPerPage
    );
    const [showSuccess, setShowSuccess] = useState(false);

    const toFirstPage = () => setCurrentPage(1);
    const toLastPage = () => {
        if (totalPages !== 0) {
            setCurrentPage(totalPages);
        }
    };

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
            // Check if the field is a string or a number
            const aValue = a[field as keyof ProcessingRequestItem];
            const bValue = b[field as keyof ProcessingRequestItem];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                // String comparison (case-insensitive)
                const comparison = aValue.localeCompare(bValue, undefined, {
                    sensitivity: 'base', // Ignores case sensitivity
                });
                return direction === 'asc' ? comparison : -comparison;
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                // Numeric comparison
                return direction === 'asc' ? aValue - bValue : bValue - aValue;
            }

            // If the field is neither string nor number, fallback to default comparison
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

                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                }, 700);
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
                const updatedDate = format(
                    toZonedTime(new Date(), 'GMT'),
                    'yyyy-MM-dd HH:mm:ss'
                );

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
                setRefresh((prev) => !prev);
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

    const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const nextPage = () =>
        currentPage < totalPages && setCurrentPage(currentPage + 1);

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

    useEffect(() => {
        // Ensure currentPage is within valid bounds
        setCurrentPage((prevPage) => Math.min(prevPage, totalPages || 1));
    }, [totalPages]);

    return (
        <div className="py-8 bg-green-50 -mt-50">
            {showSuccess && <SuccessAnimation />}
            <div className="w-11/12 mx-auto overflow-x-auto border rounded-lg shadow-lg">
                <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b">
                    <div className="flex-1 flex items-center space-x-4">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                <GoSearch className="h-5 w-5" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search for product name, quantity or status..."
                                className="p-2 pl-10 border rounded-md h-12 w-full"
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <Button
                            label="New Request"
                            icon={<FaPlus />}
                            onClick={() => setIsAddModalOpen(true)}
                            variant="primary"
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
                                                ? 'bg-[#c6efcd] border border-[#4caf50]'
                                                : item.status === 'in_progress'
                                                  ? 'bg-[#feeb9c] border border-[#ff9800]'
                                                  : item.status === 'new'
                                                    ? 'bg-[#ffc8ce] border border-[#f44336]'
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
                <div className="flex justify-center items-center p-4 border-t bg-white rounded-b-lg space-x-4">
                    <FaAngleDoubleLeft
                        className={`cursor-pointer ${
                            currentPage === 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'hover:text-green-500'
                        }`}
                        onClick={currentPage > 1 ? toFirstPage : undefined}
                        size={20}
                    />
                    <FaAngleLeft
                        className={`cursor-pointer ${
                            currentPage === 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'hover:text-green-500'
                        }`}
                        onClick={currentPage > 1 ? prevPage : undefined}
                        size={20}
                    />
                    <span className="text-gray-600">
                        Page {currentPage} of {totalPages || 1}
                    </span>
                    <FaAngleRight
                        className={`cursor-pointer ${
                            currentPage === totalPages || totalPages === 0
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'hover:text-green-500'
                        }`}
                        onClick={
                            currentPage < totalPages ? nextPage : undefined
                        }
                        size={20}
                    />
                    <FaAngleDoubleRight
                        className={`cursor-pointer ${
                            currentPage === totalPages || totalPages === 0
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'hover:text-green-500'
                        }`}
                        onClick={
                            currentPage < totalPages ? toLastPage : undefined
                        }
                        size={20}
                    />
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
                title="Delete Processing Request"
                content={
                    <p>
                        Are you sure you want to delete this processing request?
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
