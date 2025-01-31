'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/config/supabaseClient';
import {
    FaSort,
    FaPlus,
    FaFileImport,
    FaFileExport,
    FaTrashAlt,
    FaEdit,
    FaEye,
} from 'react-icons/fa';
import Button from './Button';
import AddEditPickupModal from './AddEditPickupModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import PickupViewModal from './PickupViewModel';
import PickupImportCSVModal from './PickupImportCSVModal';
import { CiImport, CiExport } from 'react-icons/ci';
import SortModal from './SortModal';

type Bin = {
    bin_type: string;
    capacity: number;
    current_fill_level: number;
};

type PickupLocation = {
    location_name: string;
    address: string;
    scheduled_time: string;
    bins: Bin[];
};

type DriverDetails = {
    id: string;
    contact_details: string;
    name: string;
};

type Pickup = {
    id: string;
    driver: DriverDetails;
    pickup_date: string;
    locations: PickupLocation[];
    status: string;
};

type PickupItem = {
    id: string;
    customer_id: string;
    company_name: string;
    pickup_location: {
        address: string;
        location_name: string;
    };
    pickup_date: string;
    driver_id: string; // Changed from assigned_driver
    driver: {
        // Add this to store driver info
        name: string;
        id: string;
        contact_details: string;
    };
    empty_bins_delivered: number;
    filled_bins_collected: number;
    products_collected: string;
    status: string;
};

const PickupScheduleTable: React.FC = () => {
    const [pickupSchedules, setPickupSchedules] = useState<PickupItem[]>([]);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<PickupItem | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [refresh, setRefresh] = useState(false);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [itemToView, setItemToView] = useState<Partial<Pickup> | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [pickups, setPickups] = useState<Pickup[]>([]);

    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 10;

    // for import
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isSortModalOpen, setIsSortModalOpen] = useState<boolean>(false);

    const handleExportCSV = () => {
        try {
            const csvData = pickupSchedules.map((item) => ({
                'Company Name': `"${item.company_name}"`,
                'Location Name': `"${item.pickup_location.location_name}"`,
                Address: `"${item.pickup_location.address}"`,
                'Pickup Date': `"${item.pickup_date}"`,
                Driver: `"${item.driver.name}"`,
                'Empty Bins': `"${item.empty_bins_delivered}"`,
                'Filled Bins': `"${item.filled_bins_collected}"`,
                Products: Array.isArray(item.products_collected)
                    ? `"${item.products_collected
                          .map(
                              (product) =>
                                  `${product.quantity} ${product.product_name}`
                          )
                          .join('; ')}"`
                    : `"${item.products_collected}"`,
                Status: `"${item.status}"`,
            }));

            const csv = [
                Object.keys(csvData[0]).join(','),
                ...csvData.map((row) => Object.values(row).join(',')),
            ].join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pickup_schedule_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data. Please try again.');
        }
    };

    // FOR STATUS
    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return { label: 'Completed', color: 'bg-green-500 text-white' };
            case 'scheduled':
                return {
                    label: 'Scheduled',
                    color: 'bg-yellow-300 text-black',
                };
            default:
                return { label: 'Unknown', color: 'bg-gray-300 text-black' };
        }
    };

    // FOR SEARCHING ANYTHING
    const filteredPickups = pickupSchedules.filter((item) => {
        const searchStr = searchQuery.toLowerCase();
        return (
            item.id.toLowerCase().includes(searchStr) ||
            item.company_name.toLowerCase().includes(searchStr) ||
            item.pickup_location.address.toLowerCase().includes(searchStr) ||
            item.driver.name.toLowerCase().includes(searchStr) ||
            new Date(item.pickup_date)
                .toLocaleString()
                .toLowerCase()
                .includes(searchStr)
        );
    });

    const totalPages = Math.max(
        1,
        Math.ceil(filteredPickups.length / itemsPerPage)
    );
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredPickups.slice(startIndex, endIndex);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
        if (totalPages === 1 && currentPage === 0) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const fetchPickupSchedules = async () => {
        try {
            const { data, error } = await supabase.from('pickups').select(`
          *,
          customer:customers(company_name),
            driver:drivers(
            name,
            contact_details
        )
        `);

            if (error) {
                console.error('Error fetching pickups:', error);
                return;
            }

            const formattedData = data.map((pickup) => ({
                ...pickup,
                company_name: pickup.customer?.company_name || 'Unknown',
                filled_bins_collected: pickup.filled_bins_collected || 0,
                driver: {
                    name: pickup.driver?.name || 'Unassigned',
                    contact_details: pickup.driver?.contact_details || 'N/A',
                },
            }));

            setPickupSchedules(formattedData);
        } catch (error) {
            console.error('Error fetching pickups:', error);
        }
    };

    useEffect(() => {
        fetchPickupSchedules();
    }, [refresh]);

    const handleAddPickup = () => {
        setItemToEdit(null);
        setIsAddEditModalOpen(true);
    };

    const handleEditPickup = (item: PickupItem) => {
        setItemToEdit(item);
        setIsAddEditModalOpen(true);
    };

    const handleViewPickup = (item: PickupItem) => {
        // Transform the PickupItem into the format expected by PickupViewModal
        const viewData: Partial<Pickup> = {
            id: item.id,
            driver: {
                id: item.driver.id,
                name: item.driver.name,
                contact_details: item.driver.contact_details,
                // email: item.driver.email
            },
            pickup_date: item.pickup_date,
            status: item.status,
            locations: [
                {
                    location_name: item.pickup_location.location_name,
                    address: item.pickup_location.address,
                    scheduled_time: new Date(
                        item.pickup_date
                    ).toLocaleTimeString(),
                    bins: [
                        {
                            bin_type: 'Standard',
                            capacity: item.empty_bins_delivered,
                            current_fill_level: item.filled_bins_collected,
                        },
                    ],
                },
            ],
        };

        setItemToView(viewData);
        setIsViewModalOpen(true);
    };

    const handleDeletePickup = (id: string) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    // const handleRefresh = () => setRefresh(prev => !prev);
    const handleRefresh = async () => {
        const { data, error } = await supabase.from('pickups').select('*');
        if (error) {
            console.error('Error fetching pickups:', error.message);
            return;
        }
        setPickups(data); // Assuming you have a state variable `pickups` to hold the data
    };

    return (
        <div className="py-8 bg-green-50 -mt-50">
            {/* Centered Table Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search by ID, driver name, customer name, pickup location....."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        //  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                        className="p-2 pl-10 border rounded-md h-10 w-full"
                    />
                    <svg
                        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
                {/* <h1 className="text-2xl font-bold">Pickup Schedule</h1> */}
                <div className="flex gap-2">
                    <Button
                        label={
                            <div className="flex items-center gap-1">
                                <FaPlus className="w-4 h-4" />
                                <span>Add Pickup</span>
                            </div>
                        }
                        onClick={handleAddPickup}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1"
                    />
                    <Button
                        label={
                            <div className="flex items-center gap-1">
                                {/* <FaFileImport className="w-4 h-4" /> */}
                                <span>Import CSV</span>
                                {
                                    <CiExport
                                        style={{ strokeWidth: 2 }}
                                        size={20}
                                    />
                                }
                            </div>
                        }
                        // label="Import CSV"
                        // icon={
                        //     <CiImport
                        //         style={{ strokeWidth: 2 }}
                        //         size={20}
                        //     />
                        // }
                        onClick={() => setIsImportModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1"
                    />
                    <Button
                        label={
                            <div className="flex items-center gap-1">
                                {/* <FaFileExport className="w-4 h-4" /> */}
                                <span>Export CSV</span>
                                {
                                    <CiImport
                                        style={{ strokeWidth: 2 }}
                                        size={20}
                                    />
                                }

                                {/* <FaSort
                        className="text-gray-500 cursor-pointer hover:text-green-500 ml-4"
                        size={24}
                        onClick={() => setIsSortModalOpen(true)}
                    /> */}
                            </div>
                        }
                        onClick={handleExportCSV}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1"
                    />
                </div>
            </div>

            {pickupSchedules.length === 0 && (
                <div className="bg-gray-100 text-gray-800 text-center p-3 rounded-lg mb-4">
                    No pickups scheduled.
                </div>
            )}

            {/* Table with centered columns */}
            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-green-600 text-white">
                                <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                                    Pickup ID
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                                    Customer Name
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                                    Pickup Location
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                                    Scheduled Date & Time
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                                    Assigned Driver
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                                    Bins
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentItems.map((item, index) => {
                                const { label, color } = getStatusStyle(
                                    item.status
                                );
                                return (
                                    <tr
                                        key={item.id}
                                        className={
                                            index % 2 === 0
                                                ? 'bg-white hover:bg-gray-50'
                                                : 'bg-gray-50 hover:bg-gray-100'
                                        }
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-900 text-center">
                                            {item.id}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-center">
                                            {item.company_name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-center">
                                            {item.pickup_location.address}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-center">
                                            {new Date(
                                                item.pickup_date
                                            ).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-center">
                                            {item.driver.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-center">
                                            {item.empty_bins_delivered}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${color}`}
                                            >
                                                {label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center space-x-4">
                                                <FaEye
                                                    className="w-4 h-4 text-gray-500 hover:text-blue-600 cursor-pointer"
                                                    onClick={() =>
                                                        handleViewPickup(item)
                                                    }
                                                />
                                                <FaEdit
                                                    className="w-4 h-4 text-gray-500 hover:text-green-600 cursor-pointer"
                                                    onClick={() =>
                                                        handleEditPickup(item)
                                                    }
                                                />
                                                <FaTrashAlt
                                                    className="w-4 h-4 text-gray-500 hover:text-red-600 cursor-pointer"
                                                    onClick={() =>
                                                        handleDeletePickup(
                                                            item.id
                                                        )
                                                    }
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination remains the same */}
                <div className="flex items-center justify-center px-4 py-3 border-t border-gray-200">
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1 || totalPages === 0}
                            className="px-3 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                            {'<<'}
                        </button>
                        <button
                            onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1 || totalPages === 0}
                            className="px-3 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                            {'<'}
                        </button>
                        <span className="px-3 py-1 text-xs text-gray-600">
                            Page {totalPages === 0 ? 0 : currentPage} of{' '}
                            {Math.max(totalPages, 1)}
                        </span>
                        <button
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages)
                                )
                            }
                            disabled={
                                currentPage === totalPages || totalPages === 0
                            }
                            className="px-3 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                            {'>'}
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={
                                currentPage === totalPages || totalPages === 0
                            }
                            className="px-3 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                            {'>>'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals remain the same */}
            {/* <SortModal
                isOpen={isSortModalOpen}
                onClose={() => setIsSortModalOpen(false)}
                onSortChange={handleSortChange}
            /> */}

            <PickupImportCSVModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImportSuccess={handleRefresh}
            />
            <PickupViewModal
                isOpen={isViewModalOpen}
                pickup={itemToView || {}}
                onClose={() => setIsViewModalOpen(false)}
            />
            <AddEditPickupModal
                isOpen={isAddEditModalOpen}
                item={itemToEdit}
                onClose={() => setIsAddEditModalOpen(false)}
                onRefresh={handleRefresh}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                itemId={itemToDelete}
                onClose={() => setIsDeleteModalOpen(false)}
                onRefresh={handleRefresh}
            />
        </div>
    );
};

export default PickupScheduleTable;
