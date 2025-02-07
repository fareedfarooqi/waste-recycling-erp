'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import SidebarSmall from '@/components/Sidebar/SidebarSmall';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useSidebar } from '@/components/Sidebar/SidebarContext';
import { FaEye, FaEdit } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

interface Employee {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    role: string;
    profile_picture: string;
    created_at: string;
}

export default function EmployeeListPage() {
    const { isSidebarOpen } = useSidebar();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
        null
    );

    const supabase = createClient();

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const { data, error } = await supabase
                    .from('company_users')
                    .select(
                        'user_id, first_name, last_name, email, phone_number, role, profile_picture, created_at'
                    );

                if (error) throw error;
                setEmployees(data || []);
            } catch (err) {
                setError('Failed to fetch employees.');
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, [supabase]);

    return (
        <div className="min-h-screen bg-green-50 flex">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}
            <div className="flex-1 p-8">
                <h1 className="text-3xl font-bold text-green-700 mb-2">
                    Employee List
                </h1>
                <p className="text-sm text-gray-500 mb-8">
                    List of all employees currently at the warehouse
                </p>

                {loading ? (
                    // <p className="text-gray-500">Loading employees...</p>
                    <div className="flex justify-center items-center min-h-screen bg-gray-50">
                        <svg
                            className="animate-spin h-8 w-8 text-green-600 mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        <p className="text-lg font-medium text-gray-600">
                            Loading employee details...
                        </p>
                    </div>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                        <table className="table-auto w-full text-left">
                            {/* <thead className="bg-green-600 text-white text-center">
                                <tr>
                                    <th className="px-6 py-4 text-center">Profile</th>
                                    <th className="px-6 py-4 text-center">First Name</th>
                                    <th className="px-6 py-4 text-center">Last Name</th>
                                    <th className="px-6 py-4 text-center">Role</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((employee) => (
                                    <tr key={employee.user_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <img
                                                src={employee.profile_picture || '/placeholder.png'}
                                                alt={`${employee.first_name} ${employee.last_name}`}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        </td>
                                        <td className="px-6 py-4">{employee.first_name}</td>
                                        <td className="px-6 py-4">{employee.last_name}</td>
                                        <td className="px-6 py-4">{employee.role}</td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end space-x-4">
                                            <button className="text-gray-500 hover:text-green-600">
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => setSelectedEmployee(employee)}
                                                className="text-gray-500 hover:text-green-600"
                                            >
                                                <FaEye />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody> */}
                            <thead className="bg-green-600 text-white text-center">
                                <tr>
                                    <th className="px-6 py-4 text-center">
                                        Profile
                                    </th>
                                    <th className="px-6 py-4 text-center">
                                        First Name
                                    </th>
                                    <th className="px-6 py-4 text-center">
                                        Last Name
                                    </th>
                                    <th className="px-6 py-4 text-center">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((employee) => (
                                    <tr
                                        key={employee.user_id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 text-center">
                                            <img
                                                src={employee.profile_picture}
                                                alt={`${employee.first_name} ${employee.last_name}`}
                                                className="w-10 h-10 rounded-full object-cover mx-auto"
                                                // onError={(e) => {
                                                //     (e.target as HTMLImageElement).src = '/placeholder.png';
                                                // }}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {employee.first_name}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {employee.last_name}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {employee.role}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center space-x-4">
                                                <button className="text-gray-500 hover:text-green-600">
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setSelectedEmployee(
                                                            employee
                                                        )
                                                    }
                                                    className="text-gray-500 hover:text-green-600"
                                                >
                                                    <FaEye />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {selectedEmployee && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setSelectedEmployee(null)}
                    >
                        <div className="bg-white p-8 rounded-lg shadow-lg w-96 relative">
                            {/* <button
                                onClick={() => setSelectedEmployee(null)}
                                className="absolute top-5 right-5 text-gray-500 hover:text-red-500"
                            >
                                &times;
                            </button> */}
                            <button
                                onClick={() => setSelectedEmployee(null)}
                                className="absolute top-2 right-2 text-gray-500 hover:text-red-700"
                                aria-label="Close"
                            >
                                <IoMdClose size={24} />
                            </button>
                            <div className="flex flex-col items-center">
                                <img
                                    src={selectedEmployee.profile_picture}
                                    alt={`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
                                    className="w-20 h-20 rounded-full object-cover mb-4"
                                />
                                <p className="text-lg font-semibold text-gray-700">
                                    {selectedEmployee.first_name || 'N/A'}{' '}
                                    {selectedEmployee.last_name || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {selectedEmployee.role || 'N/A'}
                                </p>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm">
                                    <strong>Email:</strong>{' '}
                                    {selectedEmployee.email || 'N/A'}
                                </p>
                                <p className="text-sm">
                                    <strong>Phone Number:</strong>{' '}
                                    {selectedEmployee.phone_number || 'N/A'}
                                </p>
                                <p className="text-sm">
                                    <strong>Date Joined:</strong>{' '}
                                    {new Date(
                                        selectedEmployee.created_at
                                    ).toLocaleDateString('en-AU') || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
