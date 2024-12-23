'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { FaTrashAlt, FaEye, FaEdit } from 'react-icons/fa';
import { supabase } from '@/config/supabaseClient';
import ClientViewModal from './ClientViewModal';
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

    const openViewModal = (clientId: string) => {
        const client = clients.find((client) => client.id === clientId);
        setIsViewingClientDetails(true);
        setCustomerToViewClientDetails(client as Client);
    };

    const closeViewModal = () => {
        setIsViewingClientDetails(false);
        setCustomerToViewClientDetails({});
    };

    const fetchClients = async () => {
        setLoading(true);

        const { data, error } = await supabase.from('customers').select('*'); // This will need to be updated with the user's id once auth is set up.

        if (error) {
            console.error('Error fetching customer: ', error.message);
            alert(error);
        } else {
            setClients(data as Client[]);
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
            className={`flex justify-center py-8 transition-all duration-100 ${isSidebarOpen ? '' : ''}`}
        >
            <div className="w-11/12 overflow-x-auto border rounded-lg shadow-lg">
                <table className="min-w-full border-collapse">
                    <thead className="bg-green-600 text-white text-center">
                        <tr>
                            <th className="font-extrabold px-6 py-8">
                                Company Name
                            </th>
                            <th className="font-extrabold px-6 py-8">
                                Company Details
                            </th>
                            <th className="font-extrabold px-6 py-8">
                                Locations
                            </th>
                            <th className="font-extrabold px-6 py-8">
                                Total Empty Bins
                            </th>
                            <th className="font-extrabold px-6 py-8">
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
                                            Number(location.initial_empty_bins),
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
                                            size={18}
                                        />
                                        <FaTrashAlt
                                            className="text-gray-500 cursor-pointer hover:text-red-500"
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
        </div>
    );
};

export default ClientsTable;
