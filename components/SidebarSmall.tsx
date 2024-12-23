'use client';

import React, { useState } from 'react';
import {
    FaUsers,
    FaBox,
    FaCalendarAlt,
    FaQuestion,
    FaCog,
} from 'react-icons/fa';
import { CgProfile } from 'react-icons/cg';
import { ImExit } from 'react-icons/im';
import { useSidebar } from '@/context/SidebarContext';

const SidebarSmall = (): JSX.Element => {
    const { setSidebarOpen } = useSidebar();
    const [hoverTimeout, setHoverTimeout] = useState<ReturnType<
        typeof setTimeout
    > | null>(null);

    const handleMouseEnter = () => {
        const timeout = setTimeout(() => {
            setSidebarOpen(true);
        }, 1500); // 1.5 second delay
        setHoverTimeout(timeout);
    };

    const handleMouseLeave = () => {
        if (hoverTimeout) clearTimeout(hoverTimeout);
        setSidebarOpen(false);
    };

    const menuItems = [
        {
            icon: <FaUsers className="text-3xl text-gray-300" />,
            label: 'Customers',
        },
        {
            icon: <FaBox className="text-3xl text-gray-300" />,
            label: 'Inventory',
        },
        {
            icon: <FaCalendarAlt className="text-3xl text-gray-300" />,
            label: 'Schedule Pickup',
        },
        {
            icon: <FaQuestion className="text-3xl text-gray-300" />,
            label: 'Requests',
        },
        {
            icon: <FaCog className="text-3xl text-gray-300" />,
            label: 'Settings',
        },
    ];

    return (
        <div
            className="w-20 h-screen bg-green-700 text-white flex flex-col justify-between transition-all duration-600 relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="space-y-6 mt-4">
                <div className="relative flex items-center justify-center h-20 group">
                    <CgProfile className="text-5xl cursor-pointer text-gray-300 hover:bg-green-600 p-1 rounded-full" />
                    <span className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-white text-green-700 text-sm rounded-xl px-3 py-1 shadow-lg transition-all duration-500 transform group-hover:scale-105 border border-green-500">
                        Profile
                    </span>
                </div>

                <div className="space-y-6">
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-center relative group"
                        >
                            <div className="p-2 hover:bg-green-600 rounded-full cursor-pointer flex items-center justify-center">
                                {item.icon}
                            </div>
                            <span className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-white text-green-700 text-sm rounded-xl px-3 py-1 shadow-lg transition-all duration-500 transform group-hover:scale-105 border border-green-500">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-center mb-8 relative group">
                <div className="p-2 hover:bg-green-600 rounded-full cursor-pointer flex items-center justify-center">
                    <ImExit className="text-3xl text-gray-300" />
                </div>
                <span className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-white text-green-700 text-sm rounded-xl px-3 py-1 shadow-lg transition-all duration-500 transform group-hover:scale-105 border border-green-500">
                    Exit
                </span>
            </div>
        </div>
    );
};

export default SidebarSmall;
