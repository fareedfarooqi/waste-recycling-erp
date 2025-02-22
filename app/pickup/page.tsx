// NEW CODE FOR THE PAGE FOR PICKUP
'use client';

import React from 'react';

import SidebarSmall from '@/components/Sidebar/SidebarSmall';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useSidebar } from '@/components/Sidebar/SidebarContext';
import PickupScheduleTable from '@/components/PickupScheduleTable';

const Page: React.FC = () => {
    const { isSidebarOpen } = useSidebar();
    return (
        <div className="flex">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}
            <div className="flex-1">
                <PickupScheduleTable />
            </div>
        </div>
    );
};

export default Page;
