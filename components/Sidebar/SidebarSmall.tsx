'use client';

import React, { useState } from 'react';
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
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const SidebarSmall = (): JSX.Element => {
    const supabase = createClientComponentClient();
    const { setSidebarOpen } = useSidebar();
    const [hoverTimeout, setHoverTimeout] = useState<ReturnType<
        typeof setTimeout
    > | null>(null);
    const router = useRouter();

    const menuItems = [
        {
            icon: <FaUsers className="text-3xl text-white" />,
            label: 'Customers',
            route: '/customers',
        },
        {
            icon: <FaBox className="text-3xl text-white" />,
            label: 'Inventory',
            route: '/inventory-list',
        },
        {
            icon: <FaCalendarAlt className="text-3xl text-white" />,
            label: 'Schedule Pickup',
            route: '/schedule',
        },
        {
            icon: <FaQuestion className="text-3xl text-white" />,
            label: 'Requests',
            route: '/requests',
        },
        {
            icon: <FaCog className="text-3xl text-white" />,
            label: 'Settings',
            route: '/settings',
        },
    ];

    const handleMouseEnter = () => {
        const timeout = setTimeout(() => {
            setSidebarOpen(true);
        }, 1500);
        setHoverTimeout(timeout);
    };

    const handleMouseLeave = () => {
        if (hoverTimeout) clearTimeout(hoverTimeout);
        setSidebarOpen(false);
    };

    const handleMenuClick = (route: string) => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }
        setSidebarOpen(false);
        router.push(route);
    };

    // **New: Handle Logout Function**
    const handleLogout = async () => {
        try {
            // Call Supabase's signOut method
            const { error } = await supabase.auth.signOut();

            if (error) {
                // Handle error (e.g., display a notification)
                console.error('Error signing out:', error.message);
                // Optionally, display a user-friendly message here
                return;
            }

            // Sign-out successful
            console.log('User signed out successfully.');

            // Redirect to the sign-in page
            router.push('/sign-in');

            // Close the sidebar
            setSidebarOpen(false);
        } catch (err) {
            // Handle unexpected errors
            console.error('Unexpected error during sign out:', err);
            // Optionally, display a user-friendly message here
        }
    };

    return (
        <div
            className="w-20 min-h-screen bg-green-700 text-white flex flex-col justify-between transition-all duration-600 relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="space-y-6 mt-4">
                <div className="relative flex items-center justify-center h-20 group">
                    <CgProfile
                        className="text-5xl cursor-pointer text-white hover:bg-green-600 p-1 rounded-full"
                        onClick={() => {
                            if (hoverTimeout) clearTimeout(hoverTimeout);
                            setSidebarOpen(false);
                            router.push('/profile');
                        }}
                    />
                    <span className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-white text-green-700 text-sm rounded-xl px-3 py-1 shadow-lg transition-all duration-500 transform group-hover:scale-105 border border-green-500">
                        Profile
                    </span>
                </div>

                <div className="space-y-6">
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-center relative group"
                            onClick={() => handleMenuClick(item.route)}
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

            <div
                className="flex items-center justify-center mb-8 relative group"
                onClick={handleLogout} // **Updated onClick Handler**
            >
                <div className="p-2 hover:bg-green-600 rounded-full cursor-pointer flex items-center justify-center">
                    <ImExit className="text-3xl text-white" />
                </div>
                <span className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-white text-green-700 text-sm rounded-xl px-3 py-1 shadow-lg transition-all duration-500 transform group-hover:scale-105 border border-green-500">
                    Exit
                </span>
            </div>
        </div>
    );
};

export default SidebarSmall;
