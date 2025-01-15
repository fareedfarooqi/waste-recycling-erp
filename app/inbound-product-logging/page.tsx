// 'use client';

// import React, { useState } from 'react';
// import SidebarSmall from '@/components/Sidebar/SidebarSmall';
// import Sidebar from '@/components/Sidebar/Sidebar';
// import Button from '@/components/Button';
// import { FaTruck } from 'react-icons/fa';
// import LoggingForm from '@/components/LoggingForm';
// import LogsModal from '@/components/LogsModal';
// import { useSidebar } from '@/components/Sidebar/SidebarContext';

// const InboundProductLoggingPage: React.FC = () => {
//     const { isSidebarOpen } = useSidebar();
//     const [isLogsModalOpen, setLogsModalOpen] = useState(false);

//     const toggleLogsModal = () => setLogsModalOpen((prev) => !prev);

//     return (
//         <div className="min-h-screen bg-green-50 text-gray-800 flex">
//             {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}
            

//             <div className="flex-1 flex flex-col">
//                 {/* Main Content */}
//                 <div className="flex-grow bg-green-50 p-12">
//                     <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
//                         {/* Header */}
//                         <div className="flex justify-between items-center mb-8">
//                             <div>
//                                 <h1 className="text-3xl font-bold text-green-700 flex items-center">
//                                     <FaTruck className="mr-3 text-green-600" />
//                                     Inbound Product Logging
//                                 </h1>
//                                 <p className="text-lg font-light text-green-600">
//                                     Log the arrival of products into the
//                                     warehouse
//                                 </p>
//                             </div>
//                             <Button
//                                 label="View Logs"
//                                 variant="primary"
//                                 onClick={toggleLogsModal}
//                                 className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-green-600 text-white rounded hover:bg-green-500 transition whitespace-nowrap min-w-[120px] min-h-[50px]"
//                             />
//                         </div>

//                         {/* Logging Form */}
//                         <LoggingForm />

//                         {/* Logs Modal */}
//                         {isLogsModalOpen && (
//                             <LogsModal onClose={toggleLogsModal} />
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default InboundProductLoggingPage;



'use client';

import React, { useState } from 'react';
import SidebarSmall from '@/components/Sidebar/SidebarSmall';
import Sidebar from '@/components/Sidebar/Sidebar';
import Button from '@/components/Button';
import { FaTruck, FaEye } from 'react-icons/fa';
import LoggingForm from '@/components/LoggingForm';
import LogsModal from '@/components/LogsModal';
import { useSidebar } from '@/components/Sidebar/SidebarContext';

const InboundProductLoggingPage: React.FC = () => {
    const { isSidebarOpen } = useSidebar();
    const [isLogsModalOpen, setLogsModalOpen] = useState(false);

    const toggleLogsModal = () => setLogsModalOpen((prev) => !prev);

    return (
        <div className="min-h-screen bg-green-50 text-gray-800 flex">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}

            <div className="flex-1 flex flex-col" style={{ paddingTop: '7%' }}>
                {/* Main Content */}
                <div className="flex-grow bg-green-50">
                    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-green-700 flex items-center">
                                    <FaTruck className="mr-3 text-green-600" />
                                    Inbound Product Logging
                                </h1>
                                <p className="text-lg font-light text-green-600">
                                    Log the arrival of products into the warehouse
                                </p>
                            </div>
                            <Button
                                label="View Logs"
                                variant="primary"
                                onClick={toggleLogsModal}
                                // icon={<FaEye />}
                                icon={
                                    <FaEye
                                        style={{ strokeWidth: 2 }}
                                        size={18}
                                    />
                                }
                                className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-green-600 text-white rounded hover:bg-green-500 transition whitespace-nowrap min-w-[120px] min-h-[50px]"
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
