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
                <nav className="bg-green-50 p-4 flex items-center">
                    <span className="mr-5 text-white hover:scale-110 cursor-pointer transition-all"></span>
                </nav>
            </div>
        </div>
    );
};

export default Navbar;
