import './globals.css';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import React from 'react';
import { SidebarProvider } from '@/components/Sidebar/SidebarContext';

export const metadata = {
    title: 'My ERP App',
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createServerComponentClient({ cookies });

    return (
        <html lang="en">
            <body>
                <SidebarProvider>{children}</SidebarProvider>
            </body>
        </html>
    );
}
