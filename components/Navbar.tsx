'use client';
import React from 'react';
import { useState } from 'react';
import { GoSearch } from 'react-icons/go';
import { RiMenuUnfold3Fill, RiMenuUnfold4Fill } from 'react-icons/ri';
import Sidebar from './Sidebar';

const Navbar = (): JSX.Element => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div
            className={`flex ${isSidebarOpen ? 'ml-64' : ''} transition-all duration-100`}
        >
            {isSidebarOpen && (
                <div className="fixed top-0 left-0 h-screen w-64 bg-green-700 shadow-lg z-10">
                    <Sidebar />
                </div>
            )}

            <div className="flex-1">
                <nav className="bg-green-700 p-4 flex items-center">
                    <span
                        className="mr-5 text-white hover:scale-110 cursor-pointer transition-all"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? (
                            <RiMenuUnfold3Fill style={{ fontSize: '2rem' }} />
                        ) : (
                            <RiMenuUnfold4Fill style={{ fontSize: '2rem' }} />
                        )}
                    </span>

                    <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                            <GoSearch />
                        </span>
                        <input
                            type="text"
                            placeholder="Search for Customer"
                            className="pl-10 pr-4 py-2 border rounded-lg w-96 focus:outline-none focus:ring focus:ring-green-500"
                        />
                    </div>
                </nav>

                <div className="p-4">
                    <h1>Main Content Goes Here</h1>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
