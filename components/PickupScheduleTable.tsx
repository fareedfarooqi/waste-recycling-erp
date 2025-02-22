'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/config/supabaseClient';
import {
    FaEye,
    FaPlus,
    FaEdit,
    FaTrashAlt,
    FaAngleLeft,
    FaAngleRight,
    FaAngleDoubleLeft,
    FaAngleDoubleRight,
    FaSort,
} from 'react-icons/fa';
import Button from './Button';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import PickupViewModal from './PickupViewModel';
import PickupImportCSVModal from './PickupImportCSVModal';
import { CiImport, CiExport } from 'react-icons/ci';
import SortModal from './SortModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SuccessAnimation from './SuccessAnimation';
import { useUserRole } from '@/hooks/useUserRole';

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
    created_at: string;
    updated_at: string;
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

    const [showSuccess, setShowSuccess] = useState(false);

    // permissions
    const { userRole, loading: roleLoading } = useUserRole();
    const canDelete = userRole?.permissions.delete_pickup || false;
    const canAddpickup = userRole?.permissions?.add_pickup || false;
    const canEditpickup = userRole?.permissions?.edit_pickup || false;
    const ExportCSV = userRole?.permissions?.export_csv || false;
    const canImportCSV = userRole?.permissions?.pickup_import_csv || false;

    const itemsPerPage = 10;
    const toFirstPage = () => setCurrentPage(1);
    const toLastPage = () => {
        if (totalPages !== 0) {
            setCurrentPage(totalPages);
        }
    };

    const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const nextPage = () =>
        currentPage < totalPages && setCurrentPage(currentPage + 1);

    // for sorting
    const [sortField, setSortField] = useState<string>('id');
    const [sortDirection, setSortDirection] = useState<
        'asc' | 'desc' | 'default'
    >('default');

    const handleSortChange = (
        field: string,
        direction: 'asc' | 'desc' | 'default'
    ) => {
        setSortField(field);
        setSortDirection(direction);

        const sorted = [...pickupSchedules].sort((a, b) => {
            if (direction === 'default') return 0;

            let compareA, compareB;

            switch (field) {
                case 'id':
                    compareA = a.id;
                    compareB = b.id;
                    break;
                case 'company_name':
                    compareA = a.company_name.toLowerCase();
                    compareB = b.company_name.toLowerCase();
                    break;
                case 'driver_name':
                    compareA = a.driver.name.toLowerCase();
                    compareB = b.driver.name.toLowerCase();
                    break;
                case 'pickup_date':
                    compareA = new Date(a.pickup_date).getTime();
                    compareB = new Date(b.pickup_date).getTime();
                    break;
                case 'status':
                    compareA = a.status.toLowerCase();
                    compareB = b.status.toLowerCase();
                    break;
                default:
                    return 0;
            }

            return direction === 'asc'
                ? compareA > compareB
                    ? 1
                    : -1
                : compareA < compareB
                  ? 1
                  : -1;
        });

        setPickupSchedules(sorted);
    };

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
                return {
                    label: 'Completed',
                    color: 'bg-[#c6efcd] border border-[#4caf50]',
                };
            case 'scheduled':
                return {
                    label: 'Scheduled',
                    color: 'bg-[#feeb9c] border border-[#ff9800]',
                };
            default:
                return {
                    label: 'Unknown',
                    color: 'bg-[#ffc8ce] border border-[#f44336]',
                };
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

    const openEditPickupModal = (pickupId: string) => {
        if (canEditpickup) {
            router.push(`/pickup/edit-pickup/${pickupId}`);
        }
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

    const handleAddPickupButtonClick = () => {
        if (canAddpickup) {
            router.push('/pickup/add-pickup');
        }
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

    const router = useRouter();

    return (
        <div className="py-8 bg-green-50 -mt-1 min-h-screen">
            {showSuccess && <SuccessAnimation />}
            <div className="w-11/12 mx-auto overflow-x-auto border rounded-lg shadow-lg bg-white">
                {/* Header Section */}
                <div className="flex items-center justify-between p-4 border-b bg-white">
                    <div className="relative flex items-center flex-grow mr-4">
                        <input
                            type="text"
                            placeholder="Search by ID, customer name, pickup location....."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full max-w-[98%] p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                        <svg
                            className="absolute left-3 text-gray-400 h-4 w-4"
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

                    <div className="flex items-center space-x-4 mr-4">
                        <Link href="/pickup/driver-interface">
                            <button
                                onClick={() => {}} // Keep an empty function or replace it with the actual handler
                                className={`flex items-center justify-center px-6 bg-green-600 text-white font-bold text-lg rounded-lg 
                                hover:bg-green-700 shadow-md transition-all duration-200 ease-in-out hover:scale-105 active:scale-95
                                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                                style={{ height: '3rem' }}
                            >
                                <span className="text-lg">Driver Pickup</span>
                            </button>
                        </Link>

                        <button
                            onClick={
                                canAddpickup
                                    ? handleAddPickupButtonClick
                                    : undefined
                            }
                            disabled={!canAddpickup}
                            className={`flex items-center justify-center px-6 bg-green-600 text-white font-bold text-lg rounded-lg 
                            hover:bg-green-700 shadow-md transition-all duration-200 ease-in-out ${
                                !canAddpickup
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:scale-105 active:scale-95'
                            } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                            style={{ height: '3rem' }}
                        >
                            <span className="pr-2 text-lg">
                                <FaPlus />
                            </span>
                            Add Pickup
                        </button>

                        <button
                            onClick={
                                canImportCSV
                                    ? () => setIsImportModalOpen(true)
                                    : undefined
                            }
                            disabled={!canImportCSV}
                            className={`flex items-center justify-center px-6 bg-green-600 text-white font-bold text-lg rounded-lg 
                                hover:bg-green-700 shadow-md transition-all duration-200 ease-in-out ${
                                    !canImportCSV
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:scale-105 active:scale-95'
                                } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                            style={{ height: '3rem' }}
                        >
                            <span className="pr-2 text-lg">
                                <CiImport
                                    style={{ strokeWidth: 2 }}
                                    size={20}
                                />
                            </span>
                            Import CSV
                        </button>

                        <button
                            onClick={ExportCSV ? handleExportCSV : undefined}
                            disabled={!ExportCSV}
                            className={`flex items-center justify-center px-6 bg-green-600 text-white font-bold text-lg rounded-lg 
                            hover:bg-green-700 shadow-md transition-all duration-200 ease-in-out ${
                                !ExportCSV
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:scale-105 active:scale-95'
                            } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                            style={{ height: '3rem' }}
                        >
                            <span className="pr-2 text-lg">
                                <CiExport
                                    style={{ strokeWidth: 2 }}
                                    size={20}
                                />
                            </span>
                            Export CSV
                        </button>
                    </div>

                    <FaSort
                        className="text-gray-500 cursor-pointer hover:text-green-500 ml-4"
                        size={26}
                        onClick={() => setIsSortModalOpen(true)}
                    />
                </div>

                {/* Table */}
                {/* <div className="w-full overflow-x-auto"> */}
                {/* <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse whitespace-nowrap"> */}
                <table className="min-w-full border-collapse">
                    <thead className="bg-green-600 text-white text-center">
                        <tr>
                            <th className="text-xl font-bold px-6 py-8 text-center">
                                Pickup ID
                            </th>
                            <th className="text-xl font-bold px-6 py-8 text-center">
                                Customer Name
                            </th>
                            <th className="text-xl font-bold px-6 py-8 text-center">
                                Pickup Location
                            </th>
                            <th className="text-xl font-bold px-6 py-8 text-center">
                                Scheduled Date
                            </th>
                            <th className="text-xl font-bold px-6 py-8 text-center">
                                Bins
                            </th>
                            <th className="text-xl font-bold px-6 py-8 text-center">
                                Status
                            </th>
                            <th className="text-xl font-bold px-6 py-8 text-center">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item) => {
                                const { label, color } = getStatusStyle(
                                    item.status
                                );
                                return (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-100 even:bg-gray-100 odd:bg-white"
                                    >
                                        <td className="text-base px-6 py-4 border-b text-center">
                                            {item.id}
                                        </td>
                                        <td className="text-base px-6 py-4 border-b text-center">
                                            {item.company_name}
                                        </td>
                                        <td className="text-base px-6 py-4 border-b text-center">
                                            {item.pickup_location.address}
                                        </td>
                                        <td className="text-base px-6 py-4 border-b text-center">
                                            {`${new Date(item.updated_at).getDate().toString().padStart(2, '0')}/${(new Date(item.updated_at).getMonth() + 1).toString().padStart(2, '0')}/${new Date(item.updated_at).getFullYear()}`}
                                        </td>
                                        <td className="text-base px-6 py-4 border-b text-center">
                                            {item.empty_bins_delivered}
                                        </td>
                                        <td className="text-base px-6 py-4 border-b text-center">
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}
                                            >
                                                {label}
                                            </span>
                                        </td>
                                        <td className="text-base px-6 py-4 border-b">
                                            <div className="flex justify-center space-x-4">
                                                <FaEye
                                                    className="text-gray-500 cursor-pointer hover:text-green-500"
                                                    size={18}
                                                    onClick={() =>
                                                        handleViewPickup(item)
                                                    }
                                                />
                                                <FaEdit
                                                    className={`${
                                                        canEditpickup
                                                            ? 'text-gray-500 cursor-pointer hover:text-green-500'
                                                            : 'text-gray-300 cursor-not-allowed'
                                                    }`}
                                                    size={18}
                                                    onClick={() =>
                                                        canEditpickup &&
                                                        openEditPickupModal(
                                                            item.id
                                                        )
                                                    }
                                                />
                                                <FaTrashAlt
                                                    className={`${
                                                        canDelete
                                                            ? 'text-gray-500 cursor-pointer hover:text-red-500'
                                                            : 'text-gray-300 cursor-not-allowed'
                                                    }`}
                                                    size={18}
                                                    // onClick={() =>
                                                    //     handleDeletePickup(
                                                    //         item.id
                                                    //     )
                                                    // }
                                                    onClick={() =>
                                                        canDelete &&
                                                        handleDeletePickup(
                                                            item.id
                                                        )
                                                    }
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="text-center text-gray-500 font-semibold py-10"
                                >
                                    No pickups available. Add a pickup to get
                                    started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center p-4 border-t bg-white rounded-b-lg space-x-4">
                <FaAngleDoubleLeft
                    className={`cursor-pointer ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:text-green-600'}`}
                    onClick={currentPage > 1 ? toFirstPage : undefined}
                    size={20}
                />
                <FaAngleLeft
                    className={`cursor-pointer ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:text-green-600'}`}
                    onClick={currentPage > 1 ? prevPage : undefined}
                    size={20}
                />
                <span className="text-gray-600">
                    Page {currentPage} of {totalPages || 1}
                </span>
                <FaAngleRight
                    className={`cursor-pointer ${currentPage === totalPages || totalPages === 0 ? 'text-gray-300 cursor-not-allowed' : 'hover:text-green-600'}`}
                    onClick={currentPage < totalPages ? nextPage : undefined}
                    size={20}
                />
                <FaAngleDoubleRight
                    className={`cursor-pointer ${currentPage === totalPages || totalPages === 0 ? 'text-gray-300 cursor-not-allowed' : 'hover:text-green-600'}`}
                    onClick={currentPage < totalPages ? toLastPage : undefined}
                    size={20}
                />
            </div>
            {/* </div> */}
            {/* Modals remain the same */}
            <SortModal
                isOpen={isSortModalOpen}
                onClose={() => setIsSortModalOpen(false)}
                onSortChange={handleSortChange}
                initialField={sortField}
                initialDirection={sortDirection}
            />

            <PickupImportCSVModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                // onImportSuccess={handleRefresh}

                onImportSuccess={() => {
                    // handleRefresh
                    fetchPickupSchedules();
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 700);
                }}
            />
            <PickupViewModal
                isOpen={isViewModalOpen}
                pickup={itemToView || {}}
                onClose={() => setIsViewModalOpen(false)}
            />
            {/* <AddEditPickupModal
                isOpen={isAddEditModalOpen}
                item={itemToEdit}
                onClose={() => setIsAddEditModalOpen(false)}
                onRefresh={handleRefresh}
            /> */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                itemId={itemToDelete}
                onClose={() => setIsDeleteModalOpen(false)}
                delete_pickup={canDelete}
                // onRefresh={handleRefresh}
                onRefresh={() => {
                    fetchPickupSchedules(); // Refresh inventory data
                    // handleRefresh
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 700);
                }}
            />
        </div>
    );
};

export default PickupScheduleTable;
