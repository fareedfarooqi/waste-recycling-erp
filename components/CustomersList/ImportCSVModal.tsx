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
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const modalRef = useRef<HTMLDivElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
    };

    const handleImport = async () => {
        if (!file) {
            setError('Please select a file to import.');
            return;
        }

        setImporting(true);
        setError(null);

        try {
            const text = await file.text();

            const parsedData = Papa.parse<CustomerRow>(text, {
                header: true,
                skipEmptyLines: true,
            });

            if (parsedData.errors.length > 0) {
                console.error('Parsing Errors:', parsedData.errors);
                throw new Error('Error parsing CSV. Check file format.');
            }

            const groupedData: GroupedData = {};

            parsedData.data.forEach((row: CustomerRow) => {
                if (!row['Company Name']) {
                    console.warn('Invalid row:', row);
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
                        initial_empty_bins: row['Initial Empty Bins'] || '0',
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

            for (const companyName in groupedData) {
                const client = groupedData[companyName];

                const { error } = await supabase
                    .from('customers')
                    .insert(client);
                if (error) {
                    console.error('Supabase Insert Error:', error);
                    throw new Error(
                        `Failed to insert row for company: ${companyName}`
                    );
                }
            }

            onImportSuccess();
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
                className="bg-white w-full max-w-lg rounded-lg shadow-lg p-8 relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    aria-label="Close"
                >
                    <IoMdClose size={24} />
                </button>

                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    Import CSV
                </h2>

                <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded mb-6">
                    <p className="text-sm">
                        <strong>CSV Import Guidelines:</strong>
                    </p>
                    <ul className="list-disc list-inside text-sm">
                        <li>
                            Each row in the CSV file should represent a unique
                            location for a client. For clients with multiple
                            locations, repeat the client information across
                            multiple rows, with each row containing details of a
                            different location.
                        </li>
                        <li>
                            The{' '}
                            <strong>&quot;Default Product Types&quot;</strong>{' '}
                            field should contain comma-separated values (e.g.,
                            &quot;Plastic, Metal, Paper&quot;).
                        </li>
                        <li>
                            Ensure the following fields are included in the CSV:
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
                                    <strong>Location Name</strong> (optional)
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
                        Please double-check your CSV file before importing to
                        ensure the data is correctly formatted.
                    </p>
                </div>

                <div className="mb-6 text-center">
                    <p className="text-sm text-gray-700 mb-2">
                        Download sample CSV files:
                    </p>
                    <a
                        href="/samples/Sample_Customers_No_Timestamp.csv"
                        download
                        className="text-blue-500 underline hover:text-blue-600"
                    >
                        Sample CSV 1 (No Timestamp)
                    </a>
                    <br />
                    <a
                        href="/samples/Sample_Customers_Timestamp.csv"
                        download
                        className="text-blue-500 underline hover:text-blue-600"
                    >
                        Sample CSV 2 (With Timestamp)
                    </a>
                </div>

                <div className="mb-6 relative">
                    <label
                        htmlFor="file-upload"
                        className="flex items-center w-full h-12 bg-gray-100 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200 focus:outline-none px-4"
                    >
                        <span className="text-gray-600 text-center w-full">
                            {file ? file.name : 'Click to select a file'}
                        </span>
                        <input
                            id="file-upload"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                    {file && (
                        <IoMdClose
                            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-red-500 cursor-pointer"
                            onClick={handleRemoveFile}
                            size={20}
                        />
                    )}
                </div>

                {error && (
                    <p className="text-red-500 text-sm mb-4 text-center">
                        {error}
                    </p>
                )}

                <div className="flex justify-center space-x-4">
                    <button
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className={`px-6 py-2 rounded-lg text-white ${
                            importing || !file
                                ? 'bg-green-300 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600'
                        } transition duration-200`}
                        onClick={handleImport}
                        disabled={importing || !file}
                    >
                        {importing ? 'Importing...' : 'Import'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportCSVModal;
