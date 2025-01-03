'use client';

import React, { createContext, useContext, useState } from 'react';

interface SidebarContextType {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    const setSidebarOpen = (value: boolean) => {
        setIsSidebarOpen(value);
    };

    return (
        <SidebarContext.Provider
            value={{ isSidebarOpen, toggleSidebar, setSidebarOpen }}
        >
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = (): SidebarContextType => {
    const context = useContext(SidebarContext);

    if (!context) {
        throw new Error('useSidebar MUST be used within a SidebarProvider.');
    }

    return context;
};
