'use client';
import React, { useState } from 'react';
import Button from './Button';
import { IoMdClose } from 'react-icons/io';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

type SortModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSortChange: (
        sortBy: string,
        direction: 'asc' | 'desc' | 'default'
    ) => void;
    initialField?: string;
    initialDirection?: 'asc' | 'desc' | 'default';
};

const SortModal: React.FC<SortModalProps> = ({
    isOpen,
    onClose,
    onSortChange,
    initialField = 'id',
    initialDirection = 'default',
}) => {
    const [selectedSort, setSelectedSort] = useState<string>(initialField);
    const [direction, setDirection] = useState<'asc' | 'desc' | 'default'>(
        initialDirection
    );

    const handleSortChange = (field: string) => {
        setSelectedSort(field);
        onSortChange(field, direction);
    };

    const handleDirectionChange = (
        newDirection: 'asc' | 'desc' | 'default'
    ) => {
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
                className="bg-white w-[90%] max-w-xl rounded-md p-6 font-sans shadow-lg relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-700"
                >
                    <IoMdClose size={24} />
                </button>
                <h2 className="text-3xl font-bold text-center mb-4">
                    Sort Pickups
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="font-medium">Sort by:</label>
                        <select
                            className="w-full p-2 border rounded-md mt-2"
                            value={selectedSort}
                            onChange={(e) => handleSortChange(e.target.value)}
                        >
                            <option value="id">Pickup ID</option>
                            <option value="company_name">Customer Name</option>
                            <option value="driver_name">Driver Name</option>
                            <option value="pickup_date">Pickup Date</option>
                        </select>
                    </div>
                    <div>
                        <label className="font-medium">Direction:</label>
                        <div className="flex items-center justify-center space-x-4">
                            {/* <Button
                                label="Default"
                                onClick={() => handleDirectionChange('default')}
                                className={`px-4 py-2 ${direction === 'default' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                            /> */}
                            {/* <FaArrowUp
                                        style={{ strokeWidth: 2 }}
                                        size={18}
                                    /> */}
                            <Button
                                label={
                                    <span className="flex items-center space-x-2">
                                        <FaArrowUp
                                            size={18}
                                            style={{ strokeWidth: 2 }}
                                        />
                                        <span>Ascending</span>
                                    </span>
                                }
                                variant={
                                    direction === 'asc'
                                        ? 'primary'
                                        : 'secondary'
                                }
                                onClick={() => handleDirectionChange('asc')}
                                className={`flex items-center justify-center px-4 py-2 text-sm font-bold min-w-[120px] rounded-md transition ${
                                    direction === 'asc'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-200 text-black'
                                }`}
                            />
                            <Button
                                label={
                                    <span className="flex items-center space-x-2">
                                        <FaArrowDown
                                            size={18}
                                            style={{ strokeWidth: 2 }}
                                        />
                                        <span>Descending</span>
                                    </span>
                                }
                                variant={
                                    direction === 'desc'
                                        ? 'primary'
                                        : 'secondary'
                                }
                                onClick={() => handleDirectionChange('desc')}
                                className={`flex items-center justify-center px-4 py-2 text-sm font-bold min-w-[120px] rounded-md transition ${
                                    direction === 'desc'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-200 text-black'
                                }`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SortModal;
