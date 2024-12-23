'use client';

import './globals.css';
import React from 'react';
import { SidebarProvider } from '@/context/SidebarContext';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <SidebarProvider>{children}</SidebarProvider>
            </body>
        </html>
    );
}
