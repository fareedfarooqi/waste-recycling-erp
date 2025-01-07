'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import InventoryTable from '@/components/InventoryTable';
import SidebarSmall from '@/components/SidebarSmall';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/context/SidebarContext';

function InventoryListPage(): JSX.Element {
    const { isSidebarOpen } = useSidebar();

    return (
        <div className="flex">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}

            <div className="flex-1">
                <InventoryTable />
            </div>
        </div>
    );
}

export default InventoryListPage;
