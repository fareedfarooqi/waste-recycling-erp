'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import ClientsTable from '@/components/ClientsTable';
import SidebarSmall from '@/components/SidebarSmall';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/context/SidebarContext';

function ClientListPage(): JSX.Element {
    const { isSidebarOpen } = useSidebar();

    return (
        <div className="flex">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}

            <div className="flex-1">
                <Navbar />
                <ClientsTable />
            </div>
        </div>
    );
}

export default ClientListPage;
