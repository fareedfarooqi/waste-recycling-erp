import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/config/supabaseClient';
import Papa from 'papaparse';
import { IoMdClose } from 'react-icons/io';

type CustomerRow = {
    'Company Name': string;
    Email: string;
    Phone: string;
    Address: string;
    'Location Name'?: string;
    'Initial Empty Bins'?: string;
    'Default Product Types'?: string;
};

type GroupedData = {
    [companyName: string]: {
        company_name: string;
        contact_details: {
            email: string;
            phone: string;
            address: string;
        };
        locations: {
            location_name: string;
            address: string;
            initial_empty_bins: string;
            default_product_types: {
                product_name: string;
                description: string;
            }[];
        }[];
    };
};

interface ImportCSVModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess: () => void;
}

const ImportCSVModal: React.FC<ImportCSVModalProps> = ({
    isOpen,
    onClose,
    onImportSuccess,
}) => {
    const [files, setFiles] = useState<File[]>([]);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showGuidelines, setShowGuidelines] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles((prev) => [...prev, ...droppedFiles]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selectedFiles = Array.from(e.target.files);
        setFiles((prev) => [...prev, ...selectedFiles]);
    };

    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRemoveAllFiles = () => {
        setFiles([]);
    };

    const handleImport = async () => {
        if (files.length === 0) {
            setError('Please select at least one CSV file to import.');
            return;
        }

        setImporting(true);
        setError(null);

        try {
            const allGroupedData: GroupedData[] = [];

            for (const file of files) {
                const text = await file.text();
                const parsedData = Papa.parse<CustomerRow>(text, {
                    header: true,
                    skipEmptyLines: true,
                });

                if (parsedData.errors.length > 0) {
                    console.error('Parsing Errors:', parsedData.errors);
                    throw new Error(
                        `Error parsing CSV (${file.name}). Check file format.`
                    );
                }

                const groupedData: GroupedData = {};

                parsedData.data.forEach((row) => {
                    if (!row['Company Name']) {
                        console.warn('Skipping invalid row:', row);
                        return;
                    }

                    const companyName = row['Company Name'];
                    if (!groupedData[companyName]) {
                        groupedData[companyName] = {
                            company_name: companyName,
                            contact_details: {
                                email: row.Email,
                                phone: row.Phone,
                                address: row.Address,
                            },
                            locations: [],
                        };
                    }

                    if (row['Location Name']) {
                        groupedData[companyName].locations.push({
                            location_name: row['Location Name'],
                            address: row.Address,
                            initial_empty_bins:
                                row['Initial Empty Bins'] || '0',
                            default_product_types: row['Default Product Types']
                                ? row['Default Product Types']
                                      .split(',')
                                      .map((productName: string) => ({
                                          product_name: productName.trim(),
                                          description: '',
                                      }))
                                : [],
                        });
                    }
                });

                allGroupedData.push(groupedData);
            }

            for (const groupedData of allGroupedData) {
                for (const companyName in groupedData) {
                    const client = groupedData[companyName];
                    const { error: supabaseError } = await supabase
                        .from('customers')
                        .insert(client);

                    if (supabaseError) {
                        console.error('Supabase Insert Error:', supabaseError);
                        throw new Error(
                            `Failed to insert data for company: ${companyName}`
                        );
                    }
                }
            }

            onImportSuccess();
            setFiles([]);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Unknown error occurred';
            console.error('Error importing CSV:', errorMessage);
            setError(`Error importing CSV: ${errorMessage}`);
        } finally {
            setImporting(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-60 flex items-center justify-center z-50">
            <div
                ref={modalRef}
                className="bg-white w-full max-w-lg rounded-lg shadow-lg p-8 relative max-h-[80vh] overflow-y-auto"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                    aria-label="Close"
                >
                    <IoMdClose size={24} />
                </button>

                <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">
                    Import CSV
                </h2>

                <div className="text-center mb-3">
                    <button
                        className="text-blue-500 underline text-sm"
                        onClick={() => setShowGuidelines(!showGuidelines)}
                    >
                        {showGuidelines ? 'Hide Guidelines' : 'View Guidelines'}
                    </button>
                </div>

                {showGuidelines && (
                    <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded mb-6">
                        <p className="text-sm">
                            <strong>CSV Import Guidelines:</strong>
                        </p>
                        <ul className="list-disc list-inside text-sm">
                            <li>
                                Each row in the CSV file should represent a
                                unique location for a client. For clients with
                                multiple locations, repeat the client info
                                across multiple rows, with each row containing
                                details of a different location.
                            </li>
                            <li>
                                The{' '}
                                <strong>
                                    &quot;Default Product Types&quot;
                                </strong>{' '}
                                field should contain comma-separated values
                                (e.g., &quot;Plastic, Metal, Paper&quot;).
                            </li>
                            <li>
                                Ensure the following fields are included in the
                                CSV:
                                <ul className="list-disc list-inside ml-6">
                                    <li>
                                        <strong>Company Name</strong> (required)
                                    </li>
                                    <li>
                                        <strong>Email</strong> (required)
                                    </li>
                                    <li>
                                        <strong>Phone</strong> (required)
                                    </li>
                                    <li>
                                        <strong>Address</strong> (required)
                                    </li>
                                    <li>
                                        <strong>Location Name</strong>{' '}
                                        (optional)
                                    </li>
                                    <li>
                                        <strong>Default Product Types</strong>{' '}
                                        (optional)
                                    </li>
                                    <li>
                                        <strong>Initial Empty Bins</strong>{' '}
                                        (optional)
                                    </li>
                                </ul>
                            </li>
                        </ul>
                        <p className="text-sm mt-2">
                            Please double-check your CSV file before importing
                            to ensure the data is correctly formatted.
                        </p>
                    </div>
                )}

                <div className="mb-6 text-center">
                    <p className="text-sm text-gray-700 mb-2">
                        Download sample CSV files:
                    </p>
                    <a
                        href="/samples/Sample_Customers_No_Timestamp.csv"
                        download
                        className="text-blue-500 underline hover:text-blue-600 block"
                    >
                        Sample CSV 1 (No Timestamp)
                    </a>
                    <a
                        href="/samples/Sample_Customers_Timestamp.csv"
                        download
                        className="text-blue-500 underline hover:text-blue-600 block mt-1"
                    >
                        Sample CSV 2 (With Timestamp)
                    </a>
                </div>

                <div className="mb-6">
                    {files.length > 0 && (
                        <div className="mb-4 space-y-2">
                            {files.map((file, idx) => (
                                <div
                                    key={`${file.name}-${idx}`}
                                    className="flex items-center justify-between bg-gray-100 rounded px-3 py-2"
                                >
                                    <span className="text-gray-700 text-sm truncate max-w-[80%]">
                                        {file.name}
                                    </span>
                                    <IoMdClose
                                        className="text-gray-600 hover:text-red-500 cursor-pointer"
                                        onClick={() => handleRemoveFile(idx)}
                                        size={20}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <label
                        htmlFor="file-upload"
                        className={`flex items-center w-full h-16 border border-dashed rounded-md 
                        cursor-pointer focus:outline-none px-4
                        ${
                            isDragging
                                ? 'bg-green-100 border-green-500'
                                : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <span className="text-gray-600 text-center w-full">
                            {files.length === 0
                                ? 'Click or Drag CSV files here'
                                : 'Click or Drag more CSV files here'}
                        </span>
                        <input
                            id="file-upload"
                            type="file"
                            accept=".csv"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                </div>

                {error && (
                    <p className="text-red-500 text-sm mb-4 text-center">
                        {error}
                    </p>
                )}

                <div className="flex justify-center flex-wrap gap-4">
                    <button
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        className={`px-6 py-2 rounded-lg text-white ${
                            files.length === 0
                                ? 'bg-red-300 cursor-not-allowed'
                                : 'bg-red-500 hover:bg-red-600'
                        } transition duration-200`}
                        onClick={handleRemoveAllFiles}
                        disabled={files.length === 0}
                    >
                        Delete All Files
                    </button>

                    <button
                        className={`px-6 py-2 rounded-lg text-white ${
                            importing || !files.length
                                ? 'bg-green-300 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600'
                        } transition duration-200`}
                        onClick={handleImport}
                        disabled={importing || !files.length}
                    >
                        {importing ? 'Importing...' : 'Import'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportCSVModal;
