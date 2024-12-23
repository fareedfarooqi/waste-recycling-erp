'use client';
import React from 'react';
import { GoSearch } from 'react-icons/go';
import { useSidebar } from '@/context/SidebarContext';

const Navbar = (): JSX.Element => {
    const { isSidebarOpen } = useSidebar();

    return (
        <div
            className={`flex ${isSidebarOpen ? 'ml-16' : 'ml-16'} transition-all duration-100`}
        >
            <div className="flex-1">
                <nav className="bg-white p-4 flex items-center">
                    <span className="mr-5 text-white hover:scale-110 cursor-pointer transition-all"></span>

                    <div className="relative">
                        <span className="absolute inset-y-0 pt-4 left-3 flex items-center text-gray-400">
                            <GoSearch />
                        </span>
                        <input
                            type="text"
                            placeholder="Search for Customer"
                            className="pl-10 pr-4 py-2 mt-4 border rounded-lg w-96 focus:outline-none focus:ring focus:ring-green-500"
                        />
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default Navbar;
