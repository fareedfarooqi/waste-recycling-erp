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
} from 'react-icons/fa';
import { GoSearch } from 'react-icons/go';
import ClientEditModal from './ClientEditModal';
import ClientDeleteModal from './ClientDeleteModal';
import ImportCSVModal from './ImportCSVModal';
import SortModal from './SortModal';
import SuccessAnimation from '../SuccessAnimation';
import { FaPlus } from 'react-icons/fa';
import { CiImport, CiExport } from 'react-icons/ci';
import Papa from 'papaparse';

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

type Client = {
    id: string;
    company_name: string;
    slug: string;
    contact_details: ContactDetails;
    locations: Location[];
    updated_at: string;
    created_at: string;
};

type ClientsTableProps = {
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
    const [isEditingClientDetails, setIsEditingClientDetails] = useState(false);
    const [customerToEditClientDetails, setCustomerToEditClientDetails] =
        useState<Partial<Client>>({});

    const [isDeletingClientDetails, setIsDeletingClientDetails] =
        useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Partial<Client>>(
        {}
    );
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [sortField, setSortField] = useState<string>('company_name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [sortedClients, setSortedClients] = useState<Client[]>(clients);
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [isSortModalOpen, setIsSortModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 7;
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

    const totalPages = Math.max(
        1,
        Math.ceil(sortedClients.length / itemsPerPage)
    );
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentClients = sortedClients.slice(
        indexOfFirstItem,
        indexOfLastItem
    );

    const toFirstPage = () => setCurrentPage(1);
    const toLastPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(totalPages);
        }
    };
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
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
        router.push('/customers/add');
    };

    const handleCustomerViewButtonClick = (customer: Partial<Client>) => {
        router.push(`/customers/${customer.slug}`);
    };

    const openEditModal = (clientId: string) => {
        const client = clients.find((c) => c.id === clientId);
        if (client) {
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
        setTimeout(() => {
            setShowSuccess(false);
        }, 700);
    };

    const openDeleteModal = (clientId: string) => {
        const client = clients.find((c) => c.id === clientId);
        if (client) {
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

    const exportCSV = () => {
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

    return (
        <div className="flex justify-center py-8 transition-all duration-100">
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
                        className="flex items-center justify-center px-6 bg-green-600 text-white font-bold text-lg rounded-lg 
        hover:bg-green-700 shadow-md transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        style={{ height: '3rem' }}
                        onClick={handleAddCustomerButtonClick}
                    >
                        <span className="pr-2 text-lg">
                            <FaPlus />
                        </span>
                        Add Customer
                    </button>

                    <button
                        className="flex items-center justify-center px-6 bg-green-600 text-white font-bold text-lg rounded-lg 
        hover:bg-green-700 shadow-md transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        style={{ height: '3rem' }}
                        onClick={() => setIsImportModalOpen(true)}
                    >
                        <span className="pr-2 text-lg">
                            <CiImport style={{ strokeWidth: 2 }} size={20} />
                        </span>
                        Import CSV
                    </button>

                    <button
                        className="flex items-center justify-center px-6 bg-green-600 text-white font-bold text-lg rounded-lg 
        hover:bg-green-700 shadow-md transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        style={{ height: '3rem' }}
                        onClick={exportCSV}
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
                                            (total, location) =>
                                                total +
                                                Number(
                                                    location.initial_empty_bins ||
                                                        0
                                                ),
                                            0
                                        )}
                                    </td>
                                    <td className="px-6 py-8 border-b">
                                        <div className="flex justify-center space-x-4">
                                            <FaEye
                                                className="text-gray-500 cursor-pointer hover:text-green-500"
                                                onClick={() =>
                                                    handleCustomerViewButtonClick(
                                                        client
                                                    )
                                                }
                                                size={18}
                                            />
                                            <FaEdit
                                                className="text-gray-500 cursor-pointer hover:text-green-500"
                                                onClick={() =>
                                                    openEditModal(client.id)
                                                }
                                                size={18}
                                            />
                                            <FaTrashAlt
                                                className="text-gray-500 cursor-pointer hover:text-red-500"
                                                onClick={() =>
                                                    openDeleteModal(client.id)
                                                }
                                                size={18}
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
                        className={`cursor-pointer ${
                            currentPage === 1
                                ? 'text-gray-300'
                                : 'hover:text-green-500'
                        }`}
                        onClick={toFirstPage}
                        size={20}
                    />
                    <FaAngleLeft
                        className={`cursor-pointer ${
                            currentPage === 1
                                ? 'text-gray-300'
                                : 'hover:text-green-500'
                        }`}
                        onClick={prevPage}
                        size={20}
                    />
                    <span className="text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <FaAngleRight
                        className={`cursor-pointer ${
                            currentPage === totalPages
                                ? 'text-gray-300'
                                : 'hover:text-green-500'
                        }`}
                        onClick={nextPage}
                        size={20}
                    />
                    <FaAngleDoubleRight
                        className={`cursor-pointer ${
                            currentPage === totalPages
                                ? 'text-gray-300'
                                : 'hover:text-green-500'
                        }`}
                        onClick={toLastPage}
                        size={20}
                    />
                </div>
            </div>

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
