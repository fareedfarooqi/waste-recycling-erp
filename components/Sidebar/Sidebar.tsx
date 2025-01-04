'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    FaUsers,
    FaBox,
    FaCalendarAlt,
    FaQuestion,
    FaCog,
} from 'react-icons/fa';
import { CgProfile } from 'react-icons/cg';
import { ImExit } from 'react-icons/im';
import { useSidebar } from '@/components/Sidebar/SidebarContext';

const Sidebar = (): JSX.Element => {
    const { setSidebarOpen } = useSidebar();
    const router = useRouter();

    const menuItems = [
        { icon: <FaUsers />, label: 'Customers', route: '/customers' },
        { icon: <FaBox />, label: 'Inventory', route: '/inventory' },
        {
            icon: <FaCalendarAlt />,
            label: 'Schedule Pickup',
            route: '/schedule',
        },
        { icon: <FaQuestion />, label: 'Requests', route: '/requests' },
        { icon: <FaBox />, label: 'Containers', route: '/containers' },
    ];

    const helpSettings = [
        { icon: <FaCog />, label: 'Settings', route: '/settings' },
    ];

    const handleMenuClick = (route: string) => {
        setSidebarOpen(false);
        router.push(route);
    };

    return (
        <div
            className="w-64 min-h-screen bg-green-700 text-white p-6 flex flex-col transition-all duration-500 overflow-y-auto"
            onMouseLeave={() => setSidebarOpen(false)}
        >
            <div className="mb-2 flex items-center justify-center h-20">
                <CgProfile className="text-5xl cursor-pointer text-white hover:bg-green-600 p-1 rounded-full" />
            </div>

            <div className="space-y-4">
                <div className="font-bold text-2xl">Main Menu</div>
                <div className="space-y-3 text-xl">
                    {menuItems.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleMenuClick(item.route)}
                            className="flex items-center space-x-3 text-white hover:bg-green-600 p-2 rounded-lg cursor-pointer"
                        >
                            {item.icon}
                            <div className="font-bold">{item.label}</div>
                        </div>
                    ))}

                    <div className="space-y-3 mt-6">
                        <div className="font-bold text-2xl">Help/Settings</div>
                        {helpSettings.map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleMenuClick(item.route)}
                                className="flex items-center space-x-3 text-white hover:bg-green-600 p-2 rounded-lg cursor-pointer"
                            >
                                {item.icon}
                                <div className="font-bold">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-3 mt-auto">
                <div className="font-bold text-2xl">Session</div>
                <div
                    onClick={() => {
                        router.push('/logout');
                        setSidebarOpen(false);
                    }}
                    className="flex items-center space-x-3 text-white hover:bg-green-600 p-2 rounded-lg cursor-pointer"
                >
                    <ImExit className="text-2xl" />
                    <div className="text-lg font-bold">Exit</div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
