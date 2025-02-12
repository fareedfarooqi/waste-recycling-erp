'use client';

import React from 'react';
import { useSidebar } from '@/components/Sidebar/SidebarContext';
import Sidebar from '@/components/Sidebar/Sidebar';
import SidebarSmall from '@/components/Sidebar/SidebarSmall';
import ProfileModal from '@/components/Profile/ProfilePage';

function ProfilePage(): JSX.Element {
    const { isSidebarOpen } = useSidebar();

    return (
        <div className="flex bg-green-50 min-h-screen">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}
            <ProfileModal />
        </div>
    );
}

export default ProfilePage;
