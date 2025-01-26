'use client';

import React from 'react';
// import Navbar from '@/components/Navbar';
// import ClientsTable from '@/components/ClientsTable';
// import SidebarSmall from '@/components/SidebarSmall';
import SidebarSmall from '@/components/Sidebar/SidebarSmall';
// import Sidebar from '@/components/Sidebar';
import Sidebar from '@/components/Sidebar/Sidebar';
// import { useSidebar } from '@/context/SidebarContext';
import { useSidebar } from '@/components/Sidebar/SidebarContext';
import ContainersTable from '@/components/ContainersTable';

function OutboundContainersPage(): JSX.Element {
    const { isSidebarOpen } = useSidebar();

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-green-50">
                {/* Main Table Content */}
                <div className="flex-1 overflow-auto bg-green-50">
                    <ContainersTable />
                </div>
            </div>
        </div>
    );
}

export default OutboundContainersPage;
