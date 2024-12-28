'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { FaTrashAlt, FaEye, FaEdit } from 'react-icons/fa';
import { supabase } from '@/config/supabaseClient';
import ClientViewModal from './ClientViewModal';
import ClientEditModal from './ClientEditModal';
import ClientDeleteModal from './ClientDeleteModal';
import { useSidebar } from '@/context/SidebarContext';

type Client = {
    id: string;
    company_name: string;
    contact_details: { email: string; phone: string; address: string };
    locations: {
        location_name: string;
        address: string;
        initial_empty_bins: string;
    }[];
};

const ClientsTable = (): JSX.Element => {
    const { isSidebarOpen } = useSidebar();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isViewingClientDetails, setIsViewingClientDetails] =
        useState<boolean>(false);
    const [customerToViewClientDetails, setCustomerToViewClientDetails] =
        useState<Partial<Client>>({});
    const [isEditingClientDetails, setIsEditingClientDetails] =
        useState<boolean>(false);
    const [customerToEditClientDetails, setCustomerToEditClientDetails] =
        useState<Partial<Client>>({});
    const [isDeletingClientDetials, setIsDeletingClientDetials] =
        useState<boolean>(false);
    const [customerToDelete, setCustomerToDelete] = useState<Partial<Client>>(
        {}
    );

    const openViewModal = (clientId: string) => {
        const client = clients.find((client) => client.id === clientId);
        setIsViewingClientDetails(true);
        setCustomerToViewClientDetails(client as Client);
    };

    const closeViewModal = () => {
        setIsViewingClientDetails(false);
        setCustomerToViewClientDetails({});
    };

    const openEditModal = (clientId: string) => {
        const client = clients.find((client) => client.id === clientId);
        setIsEditingClientDetails(true);
        setCustomerToEditClientDetails(client as Client);
    };

    const closeEditModal = () => {
        setIsEditingClientDetails(false);
        setCustomerToEditClientDetails({});
    };

    const openDeleteModal = (clientId: string) => {
        const client = clients.find((client) => client.id === clientId);
        setIsDeletingClientDetials(true);
        setCustomerToDelete(client as Client);
    };

    const closeDeleteModal = () => {
        setIsDeletingClientDetials(false);
        setCustomerToDelete({});
    };

    const handleSave = async (updatedClient: Partial<Client>) => {
        const payload = {
            ...updatedClient,
            contact_details: updatedClient.contact_details || {},
            locations: updatedClient.locations || [],
        };

        console.log('Payload being sent to Supabase:', payload);

        const { error } = await supabase
            .from('customers')
            .update(payload)
            .eq('id', updatedClient.id);

        if (error) {
            console.error('Error occurred:', error);
            alert('An error occurred whilst updating your customer');
        } else {
            alert('Successfully updated details of the client.');

            setClients((prevClients) =>
                prevClients.map((client) =>
                    client.id === updatedClient.id
                        ? { ...client, ...updatedClient }
                        : client
                )
            );

            closeEditModal();
        }
    };

    const handleDelete = async (clientToRemove: Partial<Client>) => {
        const { data, error } = await supabase
            .from('customers')
            .delete()
            .eq('id', clientToRemove.id);

        if (error) {
            console.error('An ERROR has occurred: ', error);
            alert(
                'An ERROR occurred whilst attempting to delete the customer.'
            );
        } else {
            alert('Successfully deleted the customer.');
        }

        setClients((prevClients) =>
            prevClients.filter((client) => client.id !== clientToRemove.id)
        );

        closeDeleteModal();
    };

    const fetchClients = async () => {
        setLoading(true);

        const { data, error } = await supabase.from('customers').select('*');

        if (error) {
            console.error('Error fetching customers:', error.message);
            alert(error);
        } else {
            setClients(
                data.map((client) => ({
                    ...client,
                    contact_details: client.contact_details
                        ? typeof client.contact_details === 'string'
                            ? JSON.parse(client.contact_details)
                            : client.contact_details
                        : { email: '', phone: '', address: '' },
                    locations: client.locations
                        ? typeof client.locations === 'string'
                            ? JSON.parse(client.locations)
                            : client.locations
                        : [],
                }))
            );
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchClients();
    }, []);

    if (loading) {
        <div className="text-center py-8">Loading...</div>;
    }

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
                                    {(client.locations || []).reduce(
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
                                                openViewModal(client.id)
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
            <ClientViewModal
                isOpen={isViewingClientDetails}
                client={customerToViewClientDetails}
                onClose={closeViewModal}
            />
            <ClientEditModal
                isOpen={isEditingClientDetails}
                client={customerToEditClientDetails}
                onClose={closeEditModal}
                onSave={handleSave}
            />
            <ClientDeleteModal
                isOpen={isDeletingClientDetials}
                client={customerToDelete}
                onClose={closeDeleteModal}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default ClientsTable;
