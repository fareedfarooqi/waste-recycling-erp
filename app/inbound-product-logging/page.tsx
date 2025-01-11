'use client';

import React, { useState } from 'react';
// import SidebarSmall from '@/components/SidebarSmall';
import SidebarSmall from '@/components/Sidebar/SidebarSmall';
// import Sidebar from '@/components/Sidebar';
import Sidebar from '@/components/Sidebar/Sidebar';
// import Navbar from '@/components/Navbar';
import Button from '@/components/Button';
import { FaTruck } from 'react-icons/fa';
import LoggingForm from '@/components/LoggingForm';
import LogsModal from '@/components/LogsModal';
// import { useSidebar } from '@/context/SidebarContext';
import { useSidebar } from '@/components/Sidebar/SidebarContext';

const InboundProductLoggingPage: React.FC = () => {
    const { isSidebarOpen } = useSidebar();
    const [isLogsModalOpen, setLogsModalOpen] = useState(false);

    const toggleLogsModal = () => setLogsModalOpen((prev) => !prev);

    return (
        <div className="min-h-screen bg-green-50 text-gray-800 flex">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}

            <div className="flex-1 flex flex-col">
                {/* Main Content */}
                <div className="flex-grow bg-green-50 p-12">
                    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-green-700 flex items-center">
                                    <FaTruck className="mr-3 text-green-600" />
                                    Inbound Product Logging
                                </h1>
                                <p className="text-lg font-light text-green-600">
                                    Log the arrival of products into the
                                    warehouse
                                </p>
                            </div>
                            <Button
                                label="View Logs"
                                variant="primary"
                                onClick={toggleLogsModal}
                            />
                        </div>

                        {/* Logging Form */}
                        <LoggingForm />

                        {/* Logs Modal */}
                        {isLogsModalOpen && (
                            <LogsModal onClose={toggleLogsModal} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InboundProductLoggingPage;
