'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import ClientsTable from '@/components/ClientsTable';
import SidebarSmall from '@/components/SidebarSmall';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/context/SidebarContext';
import ProcessingRequestsTable from '@/components/ProcessingRequestsTable';

function ProcessingRequestsPage(): JSX.Element {
    const { isSidebarOpen } = useSidebar();

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Navbar */}
                <Navbar />

                {/* Main Table Content */}
                <div className="flex-1 overflow-auto">
                    <ProcessingRequestsTable />
                </div>
            </div>
        </div>
    );
}

export default ProcessingRequestsPage;
