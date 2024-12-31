'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoSearch } from 'react-icons/go';
import { FaPlus } from 'react-icons/fa';

type NavbarProps = {
    fetchClients: (searchQuery: string) => void;
};

const Navbar: React.FC<NavbarProps> = ({ fetchClients }): JSX.Element => {
    const router = useRouter();

    const handleAddCustomerButtonClick = () => {
        router.push('/customers/add');
    };

    const searchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value.trim();
        fetchClients(query);
    };

    return (
        <div className="">
            <div className="flex-1">
                <nav className="p-4 flex items-center justify-between bg-white relative ml-[5.45rem]">
                    <div className="relative">
                        <span className="absolute inset-y-0 pt-4 left-3 flex items-center text-gray-400">
                            <GoSearch />
                        </span>
                        <input
                            type="search"
                            name="search"
                            placeholder="Search for Customer"
                            className="pl-10 pr-4 py-2 mt-4 border rounded-lg w-96 focus:outline-none focus:ring focus:ring-green-500"
                            onChange={searchHandler}
                        />
                    </div>

                    <button
                        className="flex items-center justify-center absolute py-2.5 px-6 mt-4 right-40 bg-green-500 text-white font-bold text-lg rounded-lg hover:bg-green-600 shadow-md transition-all duration-200 ease-in-out"
                        onClick={handleAddCustomerButtonClick}
                    >
                        <span className="pr-2 text-lg">
                            <FaPlus />
                        </span>
                        Add Customer
                    </button>
                </nav>
            </div>
        </div>
    );
};

export default Navbar;
