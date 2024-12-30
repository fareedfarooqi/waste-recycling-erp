'use client';

import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import ClientsTable from './ClientsTable';
import { supabase } from '@/config/supabaseClient';

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
    contact_details: ContactDetails;
    locations: Location[];
};

const ClientManagement = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSave = async (
        updatedClient: Partial<Client>
    ): Promise<void> => {
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
            throw error;
        } else {
            alert('Successfully updated details of the client.');

            setClients((prevClients) =>
                prevClients.map((client) =>
                    client.id === updatedClient.id
                        ? { ...client, ...updatedClient }
                        : client
                )
            );
        }
    };

    const handleDelete = async (
        clientToRemove: Partial<Client>
    ): Promise<void> => {
        const { data, error } = await supabase
            .from('customers')
            .delete()
            .eq('id', clientToRemove.id);

        if (error) {
            console.error('An ERROR has occurred: ', error);
            alert(
                'An ERROR occurred whilst attempting to delete the customer.'
            );
            throw error;
        } else {
            alert('Successfully deleted the customer.');
        }

        setClients((prevClients) =>
            prevClients.filter((client) => client.id !== clientToRemove.id)
        );
    };

    const fetchClients = async (searchQuery: string = ''): Promise<void> => {
        setLoading(true);

        let { data, error } = await supabase.rpc('search_customers', {
            search_term: searchQuery,
        });

        if (error) {
            console.error('Error fetching clients:', error.message);
            setClients([]);
        } else if (data) {
            setClients(
                data.map((client: Client) => ({
                    ...client,
                    contact_details:
                        typeof client.contact_details === 'string'
                            ? JSON.parse(client.contact_details)
                            : client.contact_details,
                    locations:
                        typeof client.locations === 'string'
                            ? JSON.parse(client.locations)
                            : client.locations,
                }))
            );
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchClients('');
    }, []);

    return (
        <div>
            <Navbar fetchClients={fetchClients} />
            <ClientsTable
                clients={clients}
                loading={loading}
                fetchClients={fetchClients}
                handleDelete={handleDelete}
                handleSave={handleSave}
            />
        </div>
    );
};

export default ClientManagement;
