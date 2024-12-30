'use client';

import React from 'react';
import SidebarSmall from '@/components/SidebarSmall';
import Sidebar from '@/components/Sidebar';
import CustomerForm from '@/components/CustomerForm';
import { useSidebar } from '@/context/SidebarContext';

const AddCustomerPage = () => {
    const { isSidebarOpen } = useSidebar();

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div>{isSidebarOpen ? <Sidebar /> : <SidebarSmall />}</div>
            <div className="flex-1 p-10">
                <CustomerForm />
            </div>
        </div>
    );
};

export default AddCustomerPage;
