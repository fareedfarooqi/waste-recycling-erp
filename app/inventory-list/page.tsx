'use client';

import React from 'react';
import InventoryTable from '@/components/InventoryTable';
import SidebarSmall from '@/components/Sidebar/SidebarSmall';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useSidebar } from '@/components/Sidebar/SidebarContext';

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
