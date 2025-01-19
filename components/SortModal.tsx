import React, { useState } from 'react';
import Button from './Button';
import { IoMdClose } from 'react-icons/io';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa'; // Import arrow icons

type SortModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSortChange: (sortBy: string, direction: 'asc' | 'desc') => void;
    initialField?: string;
    initialDirection?: 'asc' | 'desc';
};

const SortModal: React.FC<SortModalProps> = ({
    isOpen,
    onClose,
    onSortChange,
    initialField = 'product_name',
    initialDirection = 'asc',
}) => {
    const [selectedSort, setSelectedSort] = useState<string>(initialField);
    const [direction, setDirection] = useState<'asc' | 'desc'>(
        initialDirection
    );

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
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <div
                className="relative bg-white w-full max-w-sm sm:max-w-md mx-2 sm:mx-0 
                rounded-lg shadow-2xl p-6 transform transition duration-300
                animate-fadeInUp"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Close"
                >
                    <IoMdClose size={24} />
                </button>
                <h2 className="font-semibold text-xl text-gray-800 mb-6 text-center">
                    Sort Requests
                </h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">
                            Sort by:
                        </label>
                        <select
                            className="w-full border border-gray-300 rounded-md p-2 
                            focus:outline-none focus:ring-2 focus:ring-green-400
                            hover:border-green-400 transition-colors"
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
                        <label className="block text-gray-700 font-medium mb-1">
                            Direction:
                        </label>
                        <div className="flex items-center justify-center space-x-4">
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
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SortModal;
