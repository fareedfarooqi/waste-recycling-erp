import React, { useState } from 'react';
import { IoMdClose } from 'react-icons/io';

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
    initialField = 'company_name',
    initialDirection = 'asc',
}) => {
    const [selectedSort, setSelectedSort] = useState<string>(initialField);
    const [direction, setDirection] = useState<'asc' | 'desc'>(
        initialDirection
    );

    const handleFieldChange = (field: string) => {
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
                    Sort Clients
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
                            onChange={(e) => handleFieldChange(e.target.value)}
                        >
                            <option value="company_name">Company Name</option>
                            <option value="number_of_locations">
                                Number of Locations
                            </option>
                            <option value="total_empty_bins">
                                Total Empty Bins
                            </option>
                            <option value="recently_updated">
                                Recently Updated
                            </option>
                            <option value="recently_added">
                                Recently Added
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-1">
                            Direction:
                        </label>
                        <div className="flex items-center justify-center space-x-4">
                            <button
                                className={`px-5 py-2 rounded-md transition-all duration-200 font-semibold outline-none
                  ${
                      direction === 'asc'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                                onClick={() => handleDirectionChange('asc')}
                            >
                                Ascending
                            </button>

                            <button
                                className={`px-5 py-2 rounded-md transition-all duration-200 font-semibold outline-none
                  ${
                      direction === 'desc'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                                onClick={() => handleDirectionChange('desc')}
                            >
                                Descending
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SortModal;
