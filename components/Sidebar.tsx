'use client';

import React from 'react';
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

const Sidebar = (): JSX.Element => {
    const { setSidebarOpen } = useSidebar();

    return (
        <div
            className="w-64 h-screen bg-green-700 text-white p-6 flex flex-col transition-all duration-500"
            onMouseLeave={() => setSidebarOpen(false)}
        >
            <div>
                <div className="mb-2 flex items-center justify-center h-20">
                    <CgProfile className="text-5xl cursor-pointer text-gray-300 hover:bg-green-600 p-1 rounded-full" />
                </div>

                <div className="space-y-4">
                    <div className="font-bold text-2xl">Main Menu</div>
                    <div className="space-y-3 text-xl">
                        <div className="flex items-center space-x-3 text-gray-300 hover:bg-green-600 p-2 rounded-lg cursor-pointer">
                            <FaUsers />
                            <div className="font-bold">Customers</div>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-300 hover:bg-green-600 p-2 rounded-lg cursor-pointer">
                            <FaBox />
                            <div className="font-bold">Inventory</div>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-300 hover:bg-green-600 p-2 rounded-lg cursor-pointer">
                            <FaCalendarAlt />
                            <div className="font-bold">Schedule Pickup</div>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-300 hover:bg-green-600 p-2 rounded-lg cursor-pointer">
                            <FaQuestion />
                            <div className="font-bold">Requests</div>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-300 hover:bg-green-600 p-2 rounded-lg cursor-pointer">
                            <FaBox />
                            <div className="font-bold">Containers</div>
                        </div>

                        <div className="space-y-3">
                            <div className="font-bold text-2xl">
                                Help/Settings
                            </div>
                            <div className="flex items-center space-x-3 text-gray-300 hover:bg-green-600 p-2 rounded-lg cursor-pointer">
                                <FaCog />
                                <div className="font-bold">Settings</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-3 mt-auto">
                <div className="font-bold text-2xl">Session</div>
                <div className="flex items-center space-x-3 text-gray-300 hover:bg-green-600 p-2 rounded-lg cursor-pointer">
                    <ImExit className="text-2xl" />
                    <div className="text-lg font-bold">Exit</div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
