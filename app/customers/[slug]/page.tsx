'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar/Sidebar';
import SidebarSmall from '@/components/Sidebar/SidebarSmall';
import { useSidebar } from '@/components/Sidebar/SidebarContext';
import CustomerDetails from '@/components/CustomerDetails';

export default function CustomerDetailsPage() {
    const { slug } = useParams();
    const { isSidebarOpen } = useSidebar();

    const topWave = `
    data:image/svg+xml,%3Csvg width='1440' height='200' viewBox='0 0 1440 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23b2f2bb' d='M0,100 C360,0 1080,200 1440,100 L1440,0 L0,0 Z'%3E%3C/path%3E%3C/svg%3E
  `;

    const bottomWave = `
    data:image/svg+xml,%3Csvg width='1440' height='320' viewBox='0 0 1440 320' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23b2f2bb' d='M0,224L20,213.3C40,203,80,181,120,192C160,203,200,245,240,266.7C280,288,320,288,360,266.7C400,245,440,203,480,181.3C520,160,560,160,600,186.7C640,213,680,267,720,272C760,277,800,235,840,208C880,181,920,171,960,176C1000,181,1040,203,1080,197.3C1120,192,1160,160,1200,149.3C1240,139,1280,149,1320,186.7C1360,224,1400,288,1420,320L1440,320L1440,0L1420,0C1400,0,1360,0,1320,0C1280,0,1240,0,1200,0C1160,0,1120,0,1080,0C1040,0,1000,0,960,0C920,0,880,0,840,0C800,0,760,0,720,0C680,0,640,0,600,0C560,0,520,0,480,0C440,0,400,0,360,0C320,0,280,0,240,0C200,0,160,0,120,0C80,0,40,0,20,0L0,0Z'%3E%3C/path%3E%3C/svg%3E
  `;

    return (
        <div
            className="flex min-h-screen"
            style={{
                background:
                    'linear-gradient(to bottom, #edfff1 0%, #ffffff 300px, #ffffff 100%)',

                backgroundImage: `url("${topWave}"), url("${bottomWave}")`,
                backgroundRepeat: 'no-repeat, no-repeat',
                backgroundPosition: 'top, bottom',
                backgroundSize: 'cover, cover',
            }}
        >
            <div>{isSidebarOpen ? <Sidebar /> : <SidebarSmall />}</div>
            <div className="flex-grow px-8 py-6 overflow-y-auto max-h-screen">
                <CustomerDetails slug={slug as string} />
            </div>
        </div>
    );
}
