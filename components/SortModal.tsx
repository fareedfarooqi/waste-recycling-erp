// import React, { useState } from 'react';
// import Button from './Button';
// import { IoMdClose } from 'react-icons/io';

// type SortModalProps = {
//     isOpen: boolean;
//     onClose: () => void;
//     onSortChange: (sortBy: string, direction: 'asc' | 'desc') => void;
// };

// const SortModal: React.FC<SortModalProps> = ({
//     isOpen,
//     onClose,
//     onSortChange,
// }) => {
//     const [selectedSort, setSelectedSort] = useState<string>('product_name');
//     const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

//     const handleSortChange = (field: string) => {
//         setSelectedSort(field);
//         onSortChange(field, direction);
//     };

//     const handleDirectionChange = (newDirection: 'asc' | 'desc') => {
//         setDirection(newDirection);
//         onSortChange(selectedSort, newDirection);
//     };

//     if (!isOpen) return null;

//     return (
//         <div
//             className="fixed inset-0 bg-gray-700 bg-opacity-50 z-50 flex justify-center items-center"
//             onClick={onClose}
//         >
//             <div
//                 className="bg-white w-[90%] max-w-xl rounded-md p-6 font-sans shadow-lg relative"
//                 onClick={(e) => e.stopPropagation()}
//             >
//                 <button
//                     onClick={onClose}
//                     className="absolute top-2 right-2 text-gray-500 hover:text-red-700"
//                     aria-label="Close"
//                 >
//                     <IoMdClose size={24} />
//                 </button>
//                 <h3 className="text-3xl font-bold text-center mb-4">Sort Requests</h3>
//                 <div className="space-y-4">
//                     <div>
//                         <label className="font-medium">Sort by:</label>
//                         <select
//                             className="w-full p-2 border rounded-md mt-2"
//                             value={selectedSort}
//                             onChange={(e) => handleSortChange(e.target.value)}
//                         >
//                             <option value="product_name">Product Name</option>
//                             <option value="created_at">Created Date</option>
//                             <option value="updated_at">
//                                 Last Updated Date
//                             </option>
//                             <option value="quantity">Quantity</option>
//                         </select>
//                     </div>
//                     <div>
//                         <label className="font-medium">Direction:</label>
//                         <div className="flex justify-center space-x-4 mt-2">
//                             <Button
//                                 label="Ascending"
//                                 variant={
//                                     direction === 'asc'
//                                         ? 'primary'
//                                         : 'secondary'
//                                 }
//                                 onClick={() => handleDirectionChange('asc')}
//                             />
//                             <Button
//                                 label="Descending"
//                                 variant={
//                                     direction === 'desc'
//                                         ? 'primary'
//                                         : 'secondary'
//                                 }
//                                 onClick={() => handleDirectionChange('desc')}
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SortModal;

import React, { useState } from 'react';
import Button from './Button';
import { IoMdClose } from 'react-icons/io';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa'; // Import arrow icons

type SortModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSortChange: (sortBy: string, direction: 'asc' | 'desc') => void;
};

const SortModal: React.FC<SortModalProps> = ({
    isOpen,
    onClose,
    onSortChange,
}) => {
    const [selectedSort, setSelectedSort] = useState<string>('product_name');
    const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

    const handleSortChange = (field: string) => {
        setSelectedSort(field);
        onSortChange(field, direction);
    };

    const handleDirectionChange = (newDirection: 'asc' | 'desc') => {
        setDirection(newDirection);
        onSortChange(selectedSort, newDirection);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-gray-700 bg-opacity-50 z-50 flex justify-center items-center"
            onClick={onClose}
        >
            <div
                className="bg-white w-[90%] max-w-xl rounded-md p-6 font-sans shadow-lg relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-700"
                    aria-label="Close"
                >
                    <IoMdClose size={24} />
                </button>
                <h3 className="text-3xl font-bold text-center mb-4">
                    Sort Requests
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="font-medium">Sort by:</label>
                        <select
                            className="w-full p-2 border rounded-md mt-2"
                            value={selectedSort}
                            onChange={(e) => handleSortChange(e.target.value)}
                        >
                            <option value="product_name">Product Name</option>
                            <option value="created_at">Created Date</option>
                            <option value="updated_at">
                                Last Updated Date
                            </option>
                            <option value="quantity">Quantity</option>
                        </select>
                    </div>
                    <div>
                        <label className="font-medium">Direction:</label>
                        <div className="flex justify-center space-x-4 mt-2">
                            <Button
                                label="Ascending"
                                variant={
                                    direction === 'asc'
                                        ? 'primary'
                                        : 'secondary'
                                }
                                onClick={() => handleDirectionChange('asc')}
                                icon={
                                    <FaArrowUp
                                        style={{ strokeWidth: 2 }}
                                        size={18}
                                    />
                                }
                                className="flex items-center justify-center px-4 py-2 text-sm font-bold min-w-[120px]"
                            />
                            <Button
                                label="Descending"
                                variant={
                                    direction === 'desc'
                                        ? 'primary'
                                        : 'secondary'
                                }
                                onClick={() => handleDirectionChange('desc')}
                                icon={
                                    <FaArrowDown
                                        style={{ strokeWidth: 2 }}
                                        size={18}
                                    />
                                }
                                className="flex items-center justify-center px-4 py-2 text-sm font-bold min-w-[120px]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SortModal;
