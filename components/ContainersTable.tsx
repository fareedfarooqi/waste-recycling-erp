'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import OutboundContainersViewModal from './OutboundContainersViewModal';
import SortModal from './SortModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import AddProcessingRequest from './AddProcessingRequest';
import EditOutboundContainerstModal from './EditOutboundContainerModal';
import ImportCSVModal from './ImportCSVModal';
import { cn } from '@/lib/utils';
import Button from '@/components/Button';
import { CiImport, CiExport } from 'react-icons/ci';
import { updateSession } from '@/utils/supabase/middleware';
import DateFormatter from './DateFormatter';

interface ProductAllocation {
    product_id: string;
    quantity: number;
    productName: string; // Add productName to the product allocation type
}

type OutboundContainerItem = {
    id: string;
    status: 'new' | 'packing' | 'sent' | 'invoiced';
    products_allocated: ProductAllocation[];
    container_photo: string;
    created_at: string;
    updated_at: string;
};

const ContainersTable = (): JSX.Element => {
    const [outboundContainers, setOutboundContainers] = useState<
        OutboundContainerItem[]
    >([]);
    const [filteredOutboundContainers, setFilteredOutboundContainers] =
        useState<OutboundContainerItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [isSortModalOpen, setIsSortModalOpen] = useState<boolean>(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
    const [sortField, setSortField] = useState<string>('id');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [selectedOutboundContainerItem, setSelectedOutboundContainerItem] =
        useState<OutboundContainerItem | null>(null);
    const [itemToDelete, setItemToDelete] =
        useState<OutboundContainerItem | null>(null);
    const [itemToEdit, setItemToEdit] = useState<OutboundContainerItem | null>(
        null
    );
    const [refresh, setRefresh] = useState<boolean>(false);
    const modalRef = useRef<HTMLDivElement | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10);
    const totalPages = Math.ceil(
        filteredOutboundContainers.length / itemsPerPage
    );
    const [showSuccess, setShowSuccess] = useState(false);

    const toFirstPage = () => setCurrentPage(1);
    const toLastPage = () => {
        if (totalPages !== 0) {
            setCurrentPage(totalPages);
        }
    };

    const router = useRouter();
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const query = new URLSearchParams(window.location.search);
            if (query.get('success') === '1') {
                setShowSuccess(true);

                query.delete('success');
                const newUrl =
                    window.location.pathname + '?' + query.toString();
                router.replace(newUrl);

                setTimeout(() => {
                    setShowSuccess(false);
                }, 700);
            }
        }
    }, [router]);

    const fetchOutboundContainers = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('containers').select('*');
        if (error) {
            console.error('Error fetching inventory: ', error.message);
        } else {
            const product_ids = data.flatMap(
                (item) =>
                    Array.isArray(item.products_allocated)
                        ? item.products_allocated.map(
                              (product: ProductAllocation) => product.product_id
                          )
                        : [] // Return an empty array if products_allocated is not an array
            );
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('id, product_name')
                .in('id', product_ids);

            if (productsError) {
                console.error(
                    'Error fetching products: ',
                    productsError.message
                );
            } else {
                // Create a map of product ids to product names
                const productsMap = productsData.reduce<Record<string, string>>(
                    (acc, product) => {
                        acc[product.id] = product.product_name;
                        return acc;
                    },
                    {}
                );

                // Enrich each item in the data array with product names for each product_id in products_allocated
                const enrichedData = data.map((item) => ({
                    ...item,
                    products_allocated: Array.isArray(item.products_allocated)
                        ? item.products_allocated.map(
                              (product: ProductAllocation) => ({
                                  ...product,
                                  product_name:
                                      productsMap[product.product_id] ||
                                      'Unknown',
                              })
                          )
                        : [], // Default to an empty array if products_allocated is not an array
                }));

                // Sort the enriched data alphabetically by product_name
                const sortedData = enrichedData.sort((a, b) => {
                    if (a.id > b.id) return -1;
                    if (a.id < b.id) return 1;
                    return 0;
                });
                setOutboundContainers(sortedData as OutboundContainerItem[]);
                setFilteredOutboundContainers(
                    sortedData as OutboundContainerItem[]
                );
            }
        }
        setLoading(false);
    };

    const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
        setSortField(field);
        setSortDirection(direction);

        const sortedData = [...filteredOutboundContainers].sort((a, b) => {
            // Check if the field is a string or a number
            const aValue = a[field as keyof OutboundContainerItem];
            const bValue = b[field as keyof OutboundContainerItem];

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

        setFilteredOutboundContainers(sortedData);
        setCurrentPage(1);
    };

    const handleSearch = (searchTerm: string) => {
        const normalizedSearchTerm = searchTerm.trim();

        const filteredData = outboundContainers.filter(
            (item) =>
                item.id.includes(normalizedSearchTerm) ||
                item.status
                    .toLowerCase()
                    .includes(normalizedSearchTerm.toLowerCase())
        );

        setFilteredOutboundContainers(filteredData);
        setCurrentPage(1);
    };

    const handleOutboundContainerViewButton = (
        container: Partial<OutboundContainerItem>
    ) => {
        router.push(`/outbound-container-management/${container.id}`);
    };

    const handleDeleteItem = async () => {
        if (itemToDelete) {
            const { error } = await supabase
                .from('containers')
                .delete()
                .eq('id', itemToDelete.id);
            if (error) {
                console.error('Error deleting item: ', error.message);
            } else {
                setOutboundContainers((prev) =>
                    prev.filter((item) => item.id !== itemToDelete.id)
                );
                setFilteredOutboundContainers((prev) =>
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

    const handleContainerAdded = () => {
        setRefresh((prev) => !prev);
        setIsAddModalOpen(false);
    };

    const markContainerAsSent = async (item: OutboundContainerItem) => {
        if (item.status === 'sent') {
            return;
        }

        try {
            const { error } = await supabase
                .from('containers')
                .update({ status: 'sent' })
                .eq('id', item.id);

            if (error) {
                console.error('Error updating status: ', error.message);
            } else {
                const updatedDate = format(
                    toZonedTime(new Date(), 'GMT'),
                    'yyyy-MM-dd HH:mm:ss'
                );

                const updatedItem: OutboundContainerItem = {
                    ...item,
                    status: 'sent',
                    updated_at: updatedDate,
                };

                setOutboundContainers((prev) =>
                    prev.map((request) =>
                        request.id === item.id ? updatedItem : request
                    )
                );
                setFilteredOutboundContainers((prev) =>
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

    const handleContainerUpdated = () => {
        setRefresh((prev) => !prev);
    };

    const prepareCSVData = () => {
        const headers = [
            'ID',
            'Status',
            'Products Allocated',
            'Container Photo',
            'Created At',
            'Updated At',
        ];
        const data = filteredOutboundContainers.map((item) => [
            item.id,
            item.status.charAt(0).toUpperCase() + item.status.slice(1),
            item.products_allocated,
            item.container_photo,
            item.created_at,
            item.updated_at,
        ]);
        return [headers, ...data];
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredOutboundContainers.slice(
        indexOfFirstItem,
        indexOfLastItem
    );

    const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const nextPage = () =>
        currentPage < totalPages && setCurrentPage(currentPage + 1);

    useEffect(() => {
        fetchOutboundContainers();
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
                                placeholder="Search for container by ID or status..."
                                className="p-2 pl-10 border rounded-md h-12 w-full"
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <Button
                            label="New Container"
                            icon={<FaPlus />}
                            // onClick={() => setIsAddModalOpen(true)}
                            onClick={() =>
                                // console.log('Cancel clicked')
                                router.push('/add-container')
                            }
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
                                    'oubound-containers.csv'
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
                                Container ID
                            </th>
                            <th className="font-extrabold px-6 py-8">Status</th>
                            <th className="font-extrabold px-6 py-8">
                                Date Created
                            </th>
                            <th className="font-extrabold px-6 py-8">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOutboundContainers.length > 0 ? (
                            currentItems.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-100 even:bg-gray-50 odd:bg-white text-center"
                                >
                                    <td className="px-6 py-8 border-b">
                                        {item.id}
                                    </td>
                                    <td className="px-6 py-8 border-b">
                                        <span
                                            className={`inline-block ${
                                                item.status === 'sent'
                                                    ? 'bg-[#c6efcd] border border-[#4caf50]'
                                                    : item.status === 'packing'
                                                      ? 'bg-[#feeb9c] border border-[#ff9800]'
                                                      : item.status === 'new'
                                                        ? 'bg-[#ffc8ce] border border-[#f44336]'
                                                        : item.status ===
                                                            'invoiced'
                                                          ? 'bg-[#bbdefb] border border-[#2196f3]' // Blue background for 'invoiced'
                                                          : ''
                                            } px-2 py-1 rounded-full w-[120px] text-center`}
                                        >
                                            {item.status
                                                ? item.status
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                  item.status.slice(1)
                                                : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-8 border-b">
                                        {
                                            <DateFormatter
                                                date={item.created_at}
                                            />
                                        }
                                    </td>
                                    <td className="px-6 py-8 border-b">
                                        <div className="flex justify-center space-x-4">
                                            <FaEye
                                                className="text-gray-500 cursor-pointer hover:text-green-500"
                                                size={18}
                                                onClick={() => {
                                                    handleOutboundContainerViewButton(
                                                        item
                                                    );
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
                                                    item.status === 'sent'
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-gray-500 hover:text-green-500'
                                                }`}
                                                size={18}
                                                onClick={() =>
                                                    markContainerAsSent(item)
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
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="text-center text-gray-500 font-semibold py-10 bg-white"
                                >
                                    No outbound containers found.
                                </td>
                            </tr>
                        )}
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
                <EditOutboundContainerstModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    outboundContainer={itemToEdit}
                    onRequestUpdated={handleContainerUpdated}
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
                            onRequestAdded={handleContainerAdded}
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
            {isViewModalOpen && selectedOutboundContainerItem && (
                <OutboundContainersViewModal
                    isOpen={isViewModalOpen}
                    outboundContainer={selectedOutboundContainerItem}
                    onClose={() => setIsViewModalOpen(false)}
                />
            )}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Container"
                content={<p>Are you sure you want to delete this container?</p>}
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

export default ContainersTable;
