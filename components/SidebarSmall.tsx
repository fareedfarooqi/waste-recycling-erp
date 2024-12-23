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
        }, 800); // 800 msc delay
        setHoverTimeout(timeout);
    };

    const handleMouseLeave = () => {
        if (hoverTimeout) clearTimeout(hoverTimeout);
        setSidebarOpen(false);
    };

    return (
        <div
            className="w-20 h-screen bg-green-700 text-white flex flex-col justify-between transition-all duration-600"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="space-y-6 mt-4">
                <div className="flex items-center justify-center h-20">
                    <CgProfile className="text-5xl cursor-pointer text-gray-300 hover:bg-green-600 p-1 rounded-full" />
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-center">
                        <div className="p-2 hover:bg-green-600 rounded-full cursor-pointer flex items-center justify-center">
                            <FaUsers className="text-3xl text-gray-300" />
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <div className="p-2 hover:bg-green-600 rounded-full cursor-pointer flex items-center justify-center">
                            <FaBox className="text-3xl text-gray-300" />
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <div className="p-2 hover:bg-green-600 rounded-full cursor-pointer flex items-center justify-center">
                            <FaCalendarAlt className="text-3xl text-gray-300" />
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <div className="p-2 hover:bg-green-600 rounded-full cursor-pointer flex items-center justify-center">
                            <FaQuestion className="text-3xl text-gray-300" />
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <div className="p-2 hover:bg-green-600 rounded-full cursor-pointer flex items-center justify-center">
                            <FaCog className="text-3xl text-gray-300" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center mb-8">
                <div className="p-2 hover:bg-green-600 rounded-full cursor-pointer flex items-center justify-center">
                    <ImExit className="text-3xl text-gray-300" />
                </div>
            </div>
        </div>
    );
};

export default SidebarSmall;
