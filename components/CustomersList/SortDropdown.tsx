import React, { useState, useEffect, useRef } from 'react';
import { FaSort } from 'react-icons/fa';
import { createPortal } from 'react-dom';

const sortOptions = [
    { field: 'Company Name', order: 'Ascending', label: 'Company Name (A-Z)' },
    { field: 'Company Name', order: 'Descending', label: 'Company Name (Z-A)' },
    {
        field: 'Number of Locations',
        order: 'Ascending',
        label: 'Number of Locations (Ascending)',
    },
    {
        field: 'Number of Locations',
        order: 'Descending',
        label: 'Number of Locations (Descending)',
    },
    {
        field: 'Total Empty Bins',
        order: 'Ascending',
        label: 'Total Empty Bins (Ascending)',
    },
    {
        field: 'Total Empty Bins',
        order: 'Descending',
        label: 'Total Empty Bins (Descending)',
    },
    {
        field: 'Recently Updated',
        order: 'Descending',
        label: 'Recently Updated (Newest to Oldest)',
    },
    {
        field: 'Recently Updated',
        order: 'Ascending',
        label: 'Recently Updated (Oldest to Newest)',
    },
    {
        field: 'Recently Added',
        order: 'Descending',
        label: 'Recently Added (Newest to Oldest)',
    },
    {
        field: 'Recently Added',
        order: 'Ascending',
        label: 'Recently Added (Oldest to Newest)',
    },
];

interface SortDropdownProps {
    sortField: string;
    sortOrder: string;
    setSortField: (field: string) => void;
    setSortOrder: (order: string) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
    sortField,
    sortOrder,
    setSortField,
    setSortOrder,
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleSortSelection = (field: string, order: string) => {
        setSortField(field);
        setSortOrder(order);
        setIsDropdownOpen(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
        ) {
            setIsDropdownOpen(false);
        }
    };

    useEffect(() => {
        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <FaSort
                className="text-gray-500 cursor-pointer hover:text-green-500 -ml-2"
                size={24}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            />
            {isDropdownOpen &&
                createPortal(
                    <ul
                        className="absolute bg-white border border-gray-300 rounded-lg shadow-lg mt-2 w-[18rem] z-30"
                        style={{
                            top: '3rem',
                            right: '0rem',
                            position: 'fixed',
                        }}
                    >
                        {sortOptions.map((option) => (
                            <li
                                key={`${option.field}-${option.order}`}
                                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                    sortField === option.field &&
                                    sortOrder === option.order
                                        ? 'bg-green-100 font-bold'
                                        : ''
                                }`}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={() =>
                                    handleSortSelection(
                                        option.field,
                                        option.order
                                    )
                                }
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>,
                    document.body
                )}
        </div>
    );
};

export default SortDropdown;
