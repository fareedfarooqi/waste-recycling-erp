'use client';

import React from 'react';
import ClientManagement from '@/components/CustomersList/ClientManagement';
import SidebarSmall from '@/components/Sidebar/SidebarSmall';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useSidebar } from '@/components/Sidebar/SidebarContext';

function ClientListPage(): JSX.Element {
    const { isSidebarOpen } = useSidebar();

    return (
        <div className="flex bg-green-50">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}

            <div className="flex-1">
                <ClientManagement />
            </div>
        </div>
    );
}

export default ClientListPage;
