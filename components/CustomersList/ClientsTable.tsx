'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaTrashAlt, FaEye, FaEdit } from 'react-icons/fa';
import ClientEditModal from './ClientEditModal';
import ClientDeleteModal from './ClientDeleteModal';
import { useSidebar } from '@/components/Sidebar/SidebarContext';

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
}): JSX.Element => {
    const router = useRouter();
    const { isSidebarOpen } = useSidebar();
    const [isViewingClientDetails, setIsViewingClientDetails] =
        useState<boolean>(false);
    const [customerToViewClientDetails, setCustomerToViewClientDetails] =
        useState<Partial<Client>>({});
    const [isEditingClientDetails, setIsEditingClientDetails] =
        useState<boolean>(false);
    const [customerToEditClientDetails, setCustomerToEditClientDetails] =
        useState<Partial<Client>>({});
    const [isDeletingClientDetails, setIsDeletingClientDetails] =
        useState<boolean>(false);
    const [customerToDelete, setCustomerToDelete] = useState<Partial<Client>>(
        {}
    );

    const handleCustomerViewButtonClick = (customer: Partial<Client>) => {
        router.push(`/customers/${customer.slug}`);
    };

    const openViewModal = (clientId: string) => {
        const client = clients.find((client) => client.id === clientId);
        if (client) {
            setIsViewingClientDetails(true);
            setCustomerToViewClientDetails(client);
        }
    };

    const closeViewModal = () => {
        setIsViewingClientDetails(false);
        setCustomerToViewClientDetails({});
    };

    const openEditModal = (clientId: string) => {
        const client = clients.find((client) => client.id === clientId);
        if (client) {
            setIsEditingClientDetails(true);
            setCustomerToEditClientDetails(client);
        }
    };

    const closeEditModal = () => {
        setIsEditingClientDetails(false);
        setCustomerToEditClientDetails({});
    };

    const openDeleteModal = (clientId: string) => {
        const client = clients.find((client) => client.id === clientId);
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
        } catch (error) {
            console.error('Save operation failed:', error);
        }
    };

    const handleDeleteClient = async (clientToRemove: Partial<Client>) => {
        try {
            await handleDelete(clientToRemove);
            closeDeleteModal();
        } catch (error) {
            console.error('Delete operation failed:', error);
        }
    };

    return (
        <div
            className={`flex justify-center py-8 transition-all duration-100 ${
                isSidebarOpen ? '' : ''
            }`}
        >
            <div className="w-11/12 overflow-auto border rounded-lg shadow-lg max-h-[80vh]">
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
                        {clients.map((client) => (
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
                                                location.initial_empty_bins || 0
                                            ),
                                        0
                                    )}
                                </td>
                                <td className="px-6 py-8 border-b">
                                    <div className="flex justify-center space-x-4">
                                        <FaEye
                                            className="text-gray-500 cursor-pointer hover:text-green-500"
                                            onClick={() =>
                                                //openViewModal(client.id)
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
                        ))}
                    </tbody>
                </table>
            </div>
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
        </div>
    );
};

export default ClientsTable;
