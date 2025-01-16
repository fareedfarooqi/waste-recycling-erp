// WORKING WITHOUT TIME
// // import React, { useState, useEffect } from 'react';
// // import { createClient } from '@/utils/supabase/client';

// // // Type definition for inventory item
// // type Inventory = {
// //     id: string;
// //     product_name: string;
// //     product_description?: string; // Optional field
// //     reserved_location?: string; // Optional field
// //     quantity: number;
// //     created_at: string;
// //     updated_at: string;
// // };

// // type InventoryModalProps = {
// //     isOpen: boolean;
// //     inventoryId: string; // Only pass the inventory ID to fetch the data
// //     onClose: () => void;
// // };

// // const InventoryViewModal: React.FC<InventoryModalProps> = ({
// //     isOpen,
// //     inventoryId,
// //     onClose,
// // }) => {
// //     const [inventory, setInventory] = useState<Inventory | null>(null);

// //     // Function to format date (improve readability)
// //     const formatDate = (dateString: string) => {
// //         const date = new Date(dateString);
// //         return date.toLocaleDateString('en-US', {
// //             weekday: 'long',
// //             year: 'numeric',
// //             month: 'long',
// //             day: 'numeric',
// //         });
// //     };

// //     // Fetch inventory data when the modal is open and inventoryId changes
// //     useEffect(() => {
// //         const fetchInventory = async () => {
// //             const supabase = createClient(); // Create a Supabase client

// //             if (inventoryId) {
// //                 const { data, error } = await supabase
// //                     .from('products') // Assuming the table is named 'products'
// //                     .select('*')
// //                     .eq('id', inventoryId)
// //                     .single(); // Fetch a single item

// //                 if (error) {
// //                     console.error('Error fetching inventory:', error);
// //                     return;
// //                 }

// //                 if (data) {
// //                     setInventory(data);
// //                 }
// //             }
// //         };

// //         if (isOpen) {
// //             fetchInventory();
// //         } else {
// //             setInventory(null); // Clear data when modal is closed
// //         }
// //     }, [isOpen, inventoryId]);

// //     if (!isOpen || !inventory) return null;

// //     return (
// //         <div
// //             className="fixed inset-0 bg-gray-700 bg-opacity-50 z-50 flex justify-center items-center"
// //             onClick={onClose}
// //         >
// //             <div
// //                 className="bg-white w-[90%] max-w-xl rounded-md border-[0.35rem] border-gray-300 p-6 font-sans shadow-lg relative"
// //                 onClick={(e) => e.stopPropagation()}
// //             >
// //                 <h3 className="font-bold text-lg mb-4">Inventory Details</h3>
// //                 <div>
// //                     <p>
// //                         <strong>Product Name: </strong>
// //                         {inventory.product_name}
// //                     </p>
// //                     <p>
// //                         <strong>Quantity: </strong>
// //                         {inventory.quantity} kg
// //                     </p>
// //                     <p>
// //                         <strong>Product Description: </strong>
// //                         {inventory.product_description || 'N/A'}
// //                     </p>
// //                     <p>
// //                         <strong>Reserved Location: </strong>
// //                         {inventory.reserved_location || 'N/A'}
// //                     </p>
// //                     <p>
// //                         <strong>Created At: </strong>
// //                         {formatDate(inventory.created_at)}
// //                     </p>
// //                     <p>
// //                         <strong>Updated At: </strong>
// //                         {formatDate(inventory.updated_at)}
// //                     </p>
// //                 </div>
// //                 <button
// //                     className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
// //                     onClick={onClose}
// //                     aria-label="Close inventory details modal"
// //                 >
// //                     Close
// //                 </button>
// //             </div>
// //         </div>
// //     );
// // };

// // export default InventoryViewModal;

// WORKING WITH TIME
// import React, { useState, useEffect } from 'react';
// import { createClient } from '@/utils/supabase/client';
// import { IoMdClose } from 'react-icons/io';

// // Type definition for inventory item
// type Inventory = {
//     id: string;
//     product_name: string;
//     product_description?: string; // Optional field
//     reserved_location?: string; // Optional field
//     quantity: number;
//     created_at: string;
//     updated_at: string;
// };

// type InventoryModalProps = {
//     isOpen: boolean;
//     inventoryId: string; // Only pass the inventory ID to fetch the data
//     onClose: () => void;
// };

// const InventoryViewModal: React.FC<InventoryModalProps> = ({
//     isOpen,
//     inventoryId,
//     onClose,
// }) => {
//     const [inventory, setInventory] = useState<Inventory | null>(null);

//     // Function to format date and time
//     const formatDateTime = (dateString: string) => {
//         const date = new Date(dateString);
//         return date.toLocaleString('en-US', {
//             weekday: 'long',
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric',
//             hour: 'numeric',
//             minute: 'numeric',
//             second: 'numeric',
//             hour12: true,
//         });
//     };

//     // Fetch inventory data when the modal is open and inventoryId changes
//     useEffect(() => {
//         const fetchInventory = async () => {
//             const supabase = createClient(); // Create a Supabase client

//             if (inventoryId) {
//                 const { data, error } = await supabase
//                     .from('products') // Assuming the table is named 'products'
//                     .select('*')
//                     .eq('id', inventoryId)
//                     .single(); // Fetch a single item

//                 if (error) {
//                     console.error('Error fetching inventory:', error);
//                     return;
//                 }

//                 if (data) {
//                     setInventory(data);
//                 }
//             }
//         };

//         if (isOpen) {
//             fetchInventory();
//         } else {
//             setInventory(null); // Clear data when modal is closed
//         }
//     }, [isOpen, inventoryId]);

//     if (!isOpen || !inventory) return null;

//     return (
//         <div
//             className="fixed inset-0 bg-gray-700 bg-opacity-50 z-50 flex justify-center items-center"
//             onClick={onClose}
//         >
//             <div
//                 className="bg-white w-[90%] max-w-xl rounded-md border-[0.35rem] border-gray-300 p-6 font-sans shadow-lg relative"
//                 onClick={(e) => e.stopPropagation()}
//             >
//                 <h3 className="font-bold text-lg mb-4">Inventory Details</h3>
//                 <div>
//                     <p>
//                         <strong>Product Name: </strong>
//                         {inventory.product_name}
//                     </p>
//                     <p>
//                         <strong>Quantity: </strong>
//                         {inventory.quantity} kg
//                     </p>
//                     <p>
//                         <strong>Product Description: </strong>
//                         {inventory.product_description || 'N/A'}
//                     </p>
//                     <p>
//                         <strong>Reserved Location: </strong>
//                         {inventory.reserved_location || 'N/A'}
//                     </p>
//                     <p>
//                         <strong>Created At: </strong>
//                         {formatDateTime(inventory.created_at)}
//                     </p>
//                     <p>
//                         <strong>Updated At: </strong>
//                         {formatDateTime(inventory.updated_at)}
//                     </p>
//                 </div>
//                 <button
//                     className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//                     onClick={onClose}
//                     aria-label="Close inventory details modal"
//                 >
//                     Close
//                 </button>
//                 <button
//                     onClick={onClose}
//                     className="absolute top-4 right-4 text-gray-500 hover:text-red-700"
//                     aria-label="Close"
//                 >
//                     <IoMdClose size={24} />
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default InventoryViewModal;

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { IoMdClose } from 'react-icons/io';
import DateFormatter from './DateFormatter';
import { useRouter } from 'next/navigation'; // Import the useRouter hook

type Inventory = {
    id: string;
    product_name: string;
    product_description?: string;
    reserved_location?: string;
    quantity: number;
    created_at: string;
    updated_at: string;
};

type InventoryModalProps = {
    isOpen: boolean;
    inventoryId: string;
    onClose: () => void;
};

const InventoryViewModal: React.FC<InventoryModalProps> = ({
    isOpen,
    inventoryId,
    onClose,
}) => {
    const [inventory, setInventory] = useState<Inventory | null>(null);
    const router = useRouter(); // Initialize router for navigation

    useEffect(() => {
        const fetchInventory = async () => {
            const supabase = createClient();

            if (inventoryId) {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', inventoryId)
                    .single();

                if (error) {
                    console.error('Error fetching inventory:', error);
                    return;
                }

                if (data) {
                    setInventory(data);
                }
            }
        };

        if (isOpen) {
            fetchInventory();
        } else {
            setInventory(null);
        }
    }, [isOpen, inventoryId]);

    if (!isOpen || !inventory) return null;

    return (
        <div
            className="fixed inset-0 bg-gray-700 bg-opacity-50 z-50 flex justify-center items-center"
            onClick={onClose}
        >
            <div
                className="bg-white w-[90%] max-w-xl rounded-md p-6 font-sans shadow-lg relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-3xl font-bold text-center mb-4">
                    Inventory Details
                </h3>
                <div>
                    <p>
                        <strong>Product Name: </strong>
                        {inventory.product_name}
                    </p>
                    <p>
                        <strong>Quantity: </strong>
                        {inventory.quantity} kg
                    </p>
                    <p>
                        <strong>Product Description: </strong>
                        {inventory.product_description || 'N/A'}
                    </p>
                    <p>
                        <strong>Reserved Location: </strong>
                        {inventory.reserved_location || 'N/A'}
                    </p>
                    <p>
                        <strong>Created At: </strong>
                        <DateFormatter date={inventory.created_at} />
                    </p>
                    <p>
                        <strong>Updated At: </strong>
                        <DateFormatter date={inventory.updated_at} />
                    </p>
                </div>
                {/* <button
                    className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={onClose}
                    aria-label="Close inventory details modal"
                >
                    Close
                </button> */}
                <div className="flex justify-between mt-3 space-x-4">
                    <button
                        className="bg-red-500 text-white px-8 py-3 rounded-lg text-base font-bold hover:bg-red-600 focus:ring-red-300"
                        onClick={onClose}
                        aria-label="Close inventory details modal"
                    >
                        Close
                    </button>
                    <button
                        // className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 font-bold"
                        className="bg-green-600 text-white px-8 py-3 rounded-lg text-base font-bold hover:bg-green-500 focus:ring-green-500"
                        onClick={() =>
                            router.push(`/edit-product/${inventory.id}`)
                        }
                        aria-label="Edit current product"
                    >
                        Edit
                    </button>
                </div>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-700"
                    aria-label="Close"
                >
                    <IoMdClose size={24} />
                </button>
            </div>
        </div>
    );
};

export default InventoryViewModal;
