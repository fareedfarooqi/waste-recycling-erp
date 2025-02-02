'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaTrashAlt,
    FaEye,
    FaEdit,
    FaAngleDoubleLeft,
    FaAngleLeft,
    FaAngleRight,
    FaAngleDoubleRight,
    FaSort,
    FaPlus,
} from 'react-icons/fa';
import { GoSearch } from 'react-icons/go';
import { CiImport, CiExport } from 'react-icons/ci';
import Papa from 'papaparse';
import ImportCSVModal from './ImportCSVModal';
import SortModal from './SortModal';
import SuccessAnimation from '../SuccessAnimation';
import ClientEditModal from './ClientEditModal';
import ClientDeleteModal from './ClientDeleteModal';
import { useUserRole } from '@/hooks/useUserRole';

type ProductType = {
    product_name: string;
    description: string;
};

type Location = {
    location_name: string;
    address: string;
    initial_empty_bins: string;
    default_product_types: ProductType[];
};

type ContactDetails = {
    email: string;
    phone: string;
    address: string;
};

export type Client = {
    id: string;
    company_name: string;
    slug: string;
    contact_details: ContactDetails;
    locations: Location[];
    updated_at: string;
    created_at: string;
};

export type ClientsTableProps = {
    clients: Client[];
    loading: boolean;
    fetchClients: (searchQuery: string) => Promise<void>;
    handleDelete: (clientToRemove: Partial<Client>) => Promise<void>;
    handleSave: (updatedClient: Partial<Client>) => Promise<void>;
};

const ClientsTable: React.FC<ClientsTableProps> = ({
    clients = [],
    loading,
    fetchClients,
    handleDelete,
    handleSave,
}) => {
    const router = useRouter();
    const { userRole, loading: roleLoading } = useUserRole();

    const [isEditingClientDetails, setIsEditingClientDetails] = useState(false);
    const [customerToEditClientDetails, setCustomerToEditClientDetails] =
        useState<Partial<Client>>({});
    const [isDeletingClientDetails, setIsDeletingClientDetails] =
        useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Partial<Client>>(
        {}
    );
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isSortModalOpen, setIsSortModalOpen] = useState(false);
    const [sortField, setSortField] = useState<string>('company_name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [sortedClients, setSortedClients] = useState<Client[]>(clients);
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState(1);

    const canAddCustomer = userRole?.permissions.add_customer;
    const canEditCustomer = userRole?.permissions.edit_customer;
    const canRemoveCustomer = userRole?.permissions.remove_customer;
    const canImportCSV = userRole?.permissions.import_csv;
    const canExportCSV = userRole?.permissions.export_csv;

    const handleExportCSV = () => {
        const flatData = clients.flatMap((client) =>
            client.locations.map((location) => ({
                'Company Name': client.company_name || 'Unknown Company',
                Email: client.contact_details?.email || 'No Email Provided',
                Phone: client.contact_details?.phone || 'No Phone Provided',
                'Location Name': location.location_name || 'No Location Name',
                Address: location.address || 'No Address Provided',
                'Initial Empty Bins': location.initial_empty_bins || '0',
                'Default Product Types': location.default_product_types?.length
                    ? location.default_product_types
                          .map((p) => p.product_name)
                          .join(', ')
                    : 'No Products',
                'Last Updated': client.updated_at || 'Not Available',
                'Created At': client.created_at || 'Not Available',
            }))
        );

        const csv = Papa.unparse(flatData, { header: true });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'clients.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalPages = Math.max(1, Math.ceil(sortedClients.length / 7));
    const indexOfLastItem = currentPage * 7;
    const indexOfFirstItem = indexOfLastItem - 7;
    const currentClients = sortedClients.slice(
        indexOfFirstItem,
        indexOfLastItem
    );

    const toFirstPage = () => setCurrentPage(1);
    const toLastPage = () => setCurrentPage(totalPages);
    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    useEffect(() => {
        const sorted = [...clients].sort((a, b) => {
            let val1: string | number;
            let val2: string | number;

            switch (sortField) {
                case 'company_name':
                    val1 = a.company_name.toLowerCase();
                    val2 = b.company_name.toLowerCase();
                    break;
                case 'number_of_locations':
                    val1 = a.locations.length;
                    val2 = b.locations.length;
                    break;
                case 'total_empty_bins':
                    val1 = a.locations.reduce(
                        (sum, loc) => sum + Number(loc.initial_empty_bins || 0),
                        0
                    );
                    val2 = b.locations.reduce(
                        (sum, loc) => sum + Number(loc.initial_empty_bins || 0),
                        0
                    );
                    break;
                case 'recently_updated':
                    val1 = Date.parse(a.updated_at);
                    val2 = Date.parse(b.updated_at);
                    break;
                case 'recently_added':
                    val1 = Date.parse(a.created_at);
                    val2 = Date.parse(b.created_at);
                    break;
                default:
                    val1 = a.company_name.toLowerCase();
                    val2 = b.company_name.toLowerCase();
            }

            if (typeof val1 === 'string' && typeof val2 === 'string') {
                return sortOrder === 'asc'
                    ? val1.localeCompare(val2)
                    : val2.localeCompare(val1);
            } else {
                return sortOrder === 'asc'
                    ? (val1 as number) - (val2 as number)
                    : (val2 as number) - (val1 as number);
            }
        });

        setSortedClients(sorted);
    }, [sortField, sortOrder, clients]);

    const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
        setSortField(field);
        setSortOrder(direction);
    };

    const handleAddCustomerButtonClick = () => {
        if (canAddCustomer) {
            router.push('/customers/add');
        }
    };

    const handleCustomerViewButtonClick = (customer: Partial<Client>) => {
        router.push(`/customers/${customer.slug}`);
    };

    const openEditModal = (clientId: string) => {
        const client = clients.find((c) => c.id === clientId);
        if (client && canEditCustomer) {
            setIsEditingClientDetails(true);
            setCustomerToEditClientDetails(client);
        }
    };

    const closeEditModal = () => {
        setIsEditingClientDetails(false);
        setCustomerToEditClientDetails({});
    };

    const onSuccessfulCSVImport = () => {
        setIsImportModalOpen(false);
        fetchClients('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 700);
    };

    const openDeleteModal = (clientId: string) => {
        const client = clients.find((c) => c.id === clientId);
        if (client && canRemoveCustomer) {
            setIsDeletingClientDetails(true);
            setCustomerToDelete(client);
        }
    };

    const closeDeleteModal = () => {
        setIsDeletingClientDetails(false);
        setCustomerToDelete({});
    };

    const handleSaveClient = async (updatedClient: Partial<Client>) => {
        try {
            await handleSave(updatedClient);
            closeEditModal();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 700);
        } catch (error) {
            console.error('Save operation failed:', error);
        }
    };

    const handleDeleteClient = async (clientToRemove: Partial<Client>) => {
        try {
            await handleDelete(clientToRemove);
            closeDeleteModal();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 700);
        } catch (error) {
            console.error('Delete operation failed:', error);
        }
    };

    let content: JSX.Element;

    if (roleLoading) {
        content = (
            <div className="flex justify-center items-center min-h-screen">
                <svg
                    className="animate-spin h-8 w-8 text-green-600 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <p className="text-lg font-medium text-gray-600">
                    Loading customer details...
                </p>
            </div>
        );
    } else {
        content = (
            <div className="w-11/12 border border-gray-300 rounded-lg shadow-lg mt-5">
                <div className="flex items-center bg-white sticky top-0 z-10 border-b rounded-t-lg px-4 py-3 space-x-4">
                    <div className="relative flex-grow my-2">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                            <GoSearch />
                        </span>
                        <input
                            type="search"
                            name="search"
                            placeholder="Search for Customer"
                            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring focus:ring-green-500"
                            style={{ height: '3rem' }}
                            onChange={(e) =>
                                fetchClients(e.target.value.trim())
                            }
                        />
                    </div>

                    <button
                        onClick={
                            canAddCustomer
                                ? handleAddCustomerButtonClick
                                : undefined
                        }
                        disabled={!canAddCustomer}
                        className={`flex items-center justify-center px-6 bg-green-600 text-white font-bold text-lg rounded-lg 
    hover:bg-green-700 shadow-md transition-all duration-200 ease-in-out ${
        !canAddCustomer
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:scale-105 active:scale-95'
    } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                        style={{ height: '3rem' }}
                    >
                        <span className="pr-2 text-lg">
                            <FaPlus />
                        </span>
                        Add Customer
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
                            <CiImport style={{ strokeWidth: 2 }} size={20} />
                        </span>
                        Import CSV
                    </button>

                    <button
                        onClick={canExportCSV ? handleExportCSV : undefined}
                        disabled={!canExportCSV}
                        className={`flex items-center justify-center px-6 bg-green-600 text-white font-bold text-lg rounded-lg 
    hover:bg-green-700 shadow-md transition-all duration-200 ease-in-out ${
        !canExportCSV
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:scale-105 active:scale-95'
    } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                        style={{ height: '3rem' }}
                    >
                        <span className="pr-2 text-lg">
                            <CiExport style={{ strokeWidth: 2 }} size={20} />
                        </span>
                        Export CSV
                    </button>

                    <FaSort
                        className="text-gray-500 cursor-pointer hover:text-green-500 -ml-2"
                        size={24}
                        onClick={() => setIsSortModalOpen(true)}
                    />
                </div>

                <table className="min-w-full border-collapse">
                    <thead className="bg-green-600 text-white text-center">
                        <tr>
                            <th className="font-extrabold px-6 py-8 sticky top-0 bg-green-600 z-10">
                                Company Name
                            </th>
                            <th className="font-extrabold px-6 py-8 sticky top-0 bg-green-600 z-10">
                                Company Details
                            </th>
                            <th className="font-extrabold px-6 py-8 sticky top-0 bg-green-600 z-10">
                                Locations
                            </th>
                            <th className="font-extrabold px-6 py-8 sticky top-0 bg-green-600 z-10">
                                Total Empty Bins
                            </th>
                            <th className="font-extrabold px-6 py-8 sticky top-0 bg-green-600 z-10">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.length === 0 ? (
                            <tr className="bg-white">
                                <td
                                    colSpan={5}
                                    className="py-8 text-center font-semibold text-gray-600"
                                >
                                    No customers available. Add a customer to
                                    get started.
                                </td>
                            </tr>
                        ) : (
                            currentClients.map((client) => (
                                <tr
                                    key={client.id}
                                    className="hover:bg-gray-100 even:bg-gray-50 odd:bg-white text-center"
                                >
                                    <td className="px-6 py-8 border-b">
                                        {client.company_name}
                                    </td>
                                    <td className="px-6 py-8 border-b">
                                        {client.contact_details.phone}
                                        <br />
                                        {client.contact_details.email}
                                        <br />
                                        {client.contact_details.address}
                                    </td>
                                    <td className="px-6 py-8 border-b">
                                        {client.locations.length}
                                    </td>
                                    <td className="px-6 py-8 border-b">
                                        {client.locations.reduce(
                                            (total, loc) =>
                                                total +
                                                Number(
                                                    loc.initial_empty_bins || 0
                                                ),
                                            0
                                        )}
                                    </td>
                                    <td className="px-6 py-8 border-b">
                                        <div className="flex justify-center space-x-4">
                                            <FaEye
                                                className="text-gray-500 cursor-pointer hover:text-green-500"
                                                size={18}
                                                onClick={() =>
                                                    handleCustomerViewButtonClick(
                                                        client
                                                    )
                                                }
                                            />
                                            <FaEdit
                                                className={`${
                                                    canEditCustomer
                                                        ? 'text-gray-500 cursor-pointer hover:text-green-500'
                                                        : 'text-gray-300 cursor-not-allowed'
                                                }`}
                                                size={18}
                                                onClick={() =>
                                                    canEditCustomer &&
                                                    openEditModal(client.id)
                                                }
                                            />
                                            <FaTrashAlt
                                                className={`${
                                                    canRemoveCustomer
                                                        ? 'text-gray-500 cursor-pointer hover:text-red-500'
                                                        : 'text-gray-300 cursor-not-allowed'
                                                }`}
                                                size={18}
                                                onClick={() =>
                                                    canRemoveCustomer &&
                                                    openDeleteModal(client.id)
                                                }
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div className="flex justify-center items-center p-4 border-t bg-white rounded-b-lg space-x-4">
                    <FaAngleDoubleLeft
                        className={`cursor-pointer ${currentPage === 1 ? 'text-gray-300' : 'hover:text-green-500'}`}
                        onClick={toFirstPage}
                        size={20}
                    />
                    <FaAngleLeft
                        className={`cursor-pointer ${currentPage === 1 ? 'text-gray-300' : 'hover:text-green-500'}`}
                        onClick={prevPage}
                        size={20}
                    />
                    <span className="text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <FaAngleRight
                        className={`cursor-pointer ${currentPage === totalPages ? 'text-gray-300' : 'hover:text-green-500'}`}
                        onClick={nextPage}
                        size={20}
                    />
                    <FaAngleDoubleRight
                        className={`cursor-pointer ${currentPage === totalPages ? 'text-gray-300' : 'hover:text-green-500'}`}
                        onClick={toLastPage}
                        size={20}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center py-8 transition-all duration-100">
            {content}

            {showSuccess && <SuccessAnimation />}

            <SortModal
                isOpen={isSortModalOpen}
                onClose={() => setIsSortModalOpen(false)}
                initialField={sortField}
                initialDirection={sortOrder}
                onSortChange={handleSortChange}
            />

            <ClientEditModal
                isOpen={isEditingClientDetails}
                client={customerToEditClientDetails}
                onClose={closeEditModal}
                onSave={handleSaveClient}
            />

            <ClientDeleteModal
                isOpen={isDeletingClientDetails}
                client={customerToDelete}
                onClose={closeDeleteModal}
                onDelete={handleDeleteClient}
            />

            <ImportCSVModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImportSuccess={onSuccessfulCSVImport}
            />
        </div>
    );
};

export default ClientsTable;
