'use client';

import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    MouseEvent,
} from 'react';
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

const REQUIRED_FIELDS = ['Company Name', 'Email', 'Phone', 'Address'];

interface TooltipData {
    text: string;
    top: number;
    left: number;
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
    const [isDragging, setIsDragging] = useState(false);
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);

    const modalRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
        },
        []
    );

    const handleDragLeave = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
        },
        []
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
            setFiles((prev) => [...prev, ...Array.from(droppedFiles)]);
            setError(null);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selectedFiles = Array.from(e.target.files);
        setFiles((prev) => [...prev, ...selectedFiles]);
        setError(null);
    };

    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRemoveAllFiles = () => {
        setFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleMouseEnterFile = (
        e: React.MouseEvent<HTMLDivElement>,
        fileName: string
    ) => {
        if (!modalRef.current) return;
        const fileRect = (
            e.currentTarget as HTMLDivElement
        ).getBoundingClientRect();
        const modalRect = modalRef.current.getBoundingClientRect();
        setTooltip({
            text: fileName,
            top: fileRect.top - modalRect.top - 8,
            left: e.clientX - modalRect.left,
        });
    };

    const handleMouseLeaveFile = () => {
        setTooltip(null);
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
                    throw new Error(
                        `Error parsing CSV (${file.name}). Check file format.`
                    );
                }

                parsedData.data.forEach((row, rowIndex) => {
                    REQUIRED_FIELDS.forEach((field) => {
                        if (!row[field as keyof CustomerRow]?.trim()) {
                            throw new Error(
                                `Row #${rowIndex + 2} in "${file.name}" is missing required field "${field}".`
                            );
                        }
                    });
                });

                const groupedData: GroupedData = {};

                parsedData.data.forEach((row) => {
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
                                      .map((p) => ({
                                          product_name: p.trim(),
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
            setError(`Error importing CSV: ${errorMessage}`);
        } finally {
            setImporting(false);
        }
    };

    const handleCloseError = () => {
        setError(null);
    };

    useEffect(() => {
        const handleClickOutside = (event: Event) => {
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
        <div
            className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50 ${
                importing ? 'pointer-events-none' : ''
            }`}
        >
            <div
                ref={modalRef}
                className="relative bg-white p-8 rounded-lg shadow-lg max-w-md w-full border border-gray-300"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    aria-label="Close"
                >
                    <IoMdClose size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-3 text-center">
                    Import CSV Files
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
                        <p className="text-sm font-bold">
                            CSV Import Guidelines:
                        </p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                            <li>
                                <strong>Unique location per row:</strong> Each
                                row should represent a unique location for a
                                client.
                            </li>
                            <li>
                                <strong>Multiple locations:</strong> If a client
                                has multiple locations, repeat the client info
                                across separate rows.
                            </li>
                            <li>
                                <strong>Default Product Types:</strong> Provide
                                comma-separated values (e.g.,{' '}
                                <strong>Plastic, Metal, Paper</strong>).
                            </li>
                            <li>
                                <strong>Required fields:</strong>
                                <ul className="list-disc list-inside ml-5">
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
                                </ul>
                            </li>
                            <li>
                                <strong>Optional fields:</strong>{' '}
                                <strong>Location Name</strong>,{' '}
                                <strong>Default Product Types</strong>, and{' '}
                                <strong>Initial Empty Bins</strong> are
                                optional.
                            </li>
                            <li>
                                <strong>Double-check:</strong> Ensure your CSV
                                file is correctly formatted before importing.
                            </li>
                        </ul>
                    </div>
                )}

                <div className="text-center mb-4">
                    <p className="text-m text-gray-700 mb-2">
                        Download sample CSV files:
                    </p>
                    <a
                        href="/samples/Sample_Customers_No_Timestamp.csv"
                        download
                        className="text-blue-500 underline hover:text-blue-600 block text-m"
                    >
                        Sample CSV 1 (No Timestamp)
                    </a>
                    <a
                        href="/samples/Sample_Customers_Timestamp.csv"
                        download
                        className="text-blue-500 underline hover:text-blue-600 block mt-1 text-m"
                    >
                        Sample CSV 2 (With Timestamp)
                    </a>
                </div>

                <div
                    className={`mb-4 border-2 border-dashed p-8 rounded-lg ${
                        isDragging
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300'
                    } ${importing ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !importing && fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                        multiple
                    />
                    <div className="text-center text-sm text-gray-700">
                        Drag and Drop CSV Files or click here to choose files
                    </div>
                </div>

                {files.length > 0 && (
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">Selected files:</h3>
                            <button
                                onClick={handleRemoveAllFiles}
                                className="text-red-500 hover:text-red-700 text-sm"
                            >
                                Remove All
                            </button>
                        </div>
                        <div className="max-h-40 overflow-y-auto overflow-x-hidden border border-gray-300 rounded-md p-2">
                            <ul className="space-y-1">
                                {files.map((file, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center bg-gray-100 rounded p-2"
                                    >
                                        <div
                                            className="flex-1 min-w-0"
                                            onMouseEnter={(e) =>
                                                handleMouseEnterFile(
                                                    e,
                                                    file.name
                                                )
                                            }
                                            onMouseLeave={handleMouseLeaveFile}
                                        >
                                            <p className="text-sm text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis">
                                                {file.name}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleRemoveFile(index)
                                            }
                                            className="text-red-500 hover:text-red-700 text-sm ml-2 whitespace-nowrap"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-4 border border-red-500 bg-red-50 text-red-700 rounded px-4 py-2">
                        <div className="flex items-center justify-between">
                            <p
                                className="text-sm break-words"
                                style={{ wordBreak: 'break-word' }}
                            >
                                {error}
                            </p>
                            <button
                                onClick={handleCloseError}
                                aria-label="Close error"
                            >
                                <IoMdClose size={20} />
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex justify-center space-x-4 mt-4">
                    <button
                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg transition hover:bg-gray-300"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className={`bg-green-600 text-white px-6 py-3 rounded-lg transition hover:bg-green-700 ${
                            importing || files.length === 0
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                        }`}
                        onClick={handleImport}
                        disabled={importing || files.length === 0}
                    >
                        {importing
                            ? 'Importing...'
                            : `Import ${files.length} ${files.length === 1 ? 'File' : 'Files'}`}
                    </button>
                </div>

                {tooltip && (
                    <div
                        className="absolute px-3 py-1 text-xs text-white bg-green-600 rounded shadow-lg z-50 whitespace-nowrap"
                        style={{
                            top: tooltip.top,
                            left: tooltip.left,
                            transform: 'translate(-50%, -100%)',
                            transition: 'opacity 0.2s ease-in-out',
                        }}
                    >
                        {tooltip.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImportCSVModal;
