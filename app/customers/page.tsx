'use client';

import React from 'react';
import ClientManagement from '@/components/ClientManagement'; // Ensure correct import path
import SidebarSmall from '@/components/SidebarSmall';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/context/SidebarContext';

function ClientListPage(): JSX.Element {
    const { isSidebarOpen } = useSidebar();

    return (
        <div className="flex">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}

            <div className="flex-1">
                <ClientManagement />
            </div>
        </div>
    );
}

export default ClientListPage;
