'use client';

import React from 'react';
import SidebarSmall from '@/components/Sidebar/SidebarSmall';
import Sidebar from '@/components/Sidebar/Sidebar';
import CustomerForm from '@/components/CustomerAdd/CustomerForm';
import { useSidebar } from '@/components/Sidebar/SidebarContext';

const AddCustomerPage = () => {
    const { isSidebarOpen } = useSidebar();

    return (
        <div className="flex bg-green-50 min-h-screen">
            <div>{isSidebarOpen ? <Sidebar /> : <SidebarSmall />}</div>

            <div className="flex-1 p-10">
                <CustomerForm />
            </div>
        </div>
    );
};

export default AddCustomerPage;
