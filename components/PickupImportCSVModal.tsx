'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/config/supabaseClient';
import Button from './Button';
import { IoMdClose } from 'react-icons/io';
import SuccessAnimation from './SuccessAnimation';

interface PickupImportCSVModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess: () => void;
    disabled?: boolean;
}

const PickupImportCSVModal: React.FC<PickupImportCSVModalProps> = ({
    isOpen,
    onClose,
    onImportSuccess,
}) => {
    const [files, setFiles] = useState<File[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [progress, setProgress] = useState(0);

    const modalRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles((prevFiles) => [
                ...prevFiles,
                ...Array.from(e.target.files || []),
            ]);
            setError(null);
        }
    };

    const handleDragEvents = useCallback(
        (e: React.DragEvent<HTMLDivElement>, isEntering: boolean) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(isEntering);
        },
        []
    );

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            setFiles((prevFiles) => [
                ...prevFiles,
                ...Array.from(e.dataTransfer.files),
            ]);
            setError(null);
        }
    }, []);

    const handleRemoveFile = (index: number) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const handleRemoveAllFiles = () => {
        setFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleImport = async () => {
        if (files.length === 0) {
            setError('Please select at least one file to import.');
            return;
        }

        if (files.some((file) => !file.name.endsWith('.csv'))) {
            setError('Please select only CSV files.');
            return;
        }

        setIsImporting(true);
        setProgress(0);
        setError(null);

        try {
            let totalRows = 0;
            let processedRows = 0;

            for (const file of files) {
                const text = await file.text();
                const rows = text.split('\n');
                totalRows += rows.length - 1;
            }

            for (const file of files) {
                const text = await file.text();
                const rows = text
                    .split('\n')
                    .map((row) =>
                        row
                            .split(',')
                            .map((cell) =>
                                cell.trim().replace(/^["']|["']$/g, '')
                            )
                    );
                const headers = rows[0];
                const data = rows
                    .slice(1)
                    .filter((row) => row.some((cell) => cell !== ''));

                for (const row of data) {
                    if (row.length === headers.length) {
                        // Parse the Products column into the desired structure
                        const rawProducts =
                            row[headers.indexOf('Products')] || '';
                        const productsCollected = rawProducts
                            .split(';')
                            .map((product) => {
                                const [quantity, ...nameParts] = product
                                    .trim()
                                    .split(' ');
                                const productName = nameParts.join(' '); // Handle multi-word product names
                                return {
                                    quantity: parseInt(quantity, 10) || 0,
                                    product_name: productName.trim(),
                                };
                            })
                            .filter(
                                (product) =>
                                    product.quantity > 0 && product.product_name
                            ); // Filter out invalid entries

                        const item = {
                            customer_id: null, // Will be looked up based on company name
                            pickup_location: {
                                location_name:
                                    row[headers.indexOf('Location Name')] || '',
                                address: row[headers.indexOf('Address')] || '',
                            },
                            pickup_date:
                                row[headers.indexOf('Pickup Date')] || null,
                            empty_bins_delivered: parseInt(
                                row[headers.indexOf('Empty Bins')] || '0'
                            ),
                            filled_bins_collected: parseInt(
                                row[headers.indexOf('Filled Bins')] || '0'
                            ),
                            products_collected: productsCollected,
                            status:
                                row[headers.indexOf('Status')]
                                    ?.toLowerCase()
                                    .replace(' ', '_') || 'scheduled',
                            driver_id: null, // Will be looked up based on driver name
                        };

                        // Look up customer_id based on company name
                        const companyName =
                            row[headers.indexOf('Company Name')];
                        if (companyName) {
                            const { data: customerData } = await supabase
                                .from('customers')
                                .select('id')
                                .eq('company_name', companyName)
                                .single();

                            if (customerData) {
                                item.customer_id = customerData.id;
                            }
                        }

                        // Look up driver_id based on driver name
                        const driverName = row[headers.indexOf('Driver')];
                        if (driverName) {
                            const { data: driverData } = await supabase
                                .from('drivers')
                                .select('id')
                                .eq('name', driverName)
                                .single();

                            if (driverData) {
                                item.driver_id = driverData.id;
                            }
                        }

                        // Only insert if we have the required fields
                        if (item.customer_id && item.pickup_date) {
                            const { error: insertError } = await supabase
                                .from('pickups')
                                .insert(item);

                            if (insertError) {
                                console.error(
                                    'Supabase Insert Error:',
                                    insertError.message
                                );
                                throw insertError;
                            }
                        } else {
                            console.warn(
                                'Skipping row due to missing required fields:',
                                row
                            );
                        }
                    }
                    processedRows++;
                    setProgress(Math.round((processedRows / totalRows) * 100));
                }
            }

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                onImportSuccess();
                onClose();
            }, 700);
        } catch (err) {
            console.error('Import error:', err);
            setError(
                'Error importing CSV. Please check the file format and try again.'
            );
        } finally {
            setIsImporting(false);
            setProgress(0);
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
        } else {
            setError(null);
            setFiles([]);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50`}
        >
            {showSuccess && <SuccessAnimation />}
            {isImporting && (
                <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-60">
                    <div className="text-xl font-bold">
                        Importing Files: {progress}%
                    </div>
                </div>
            )}
            <div
                ref={modalRef}
                className="bg-white p-6 rounded-lg shadow-md max-w-md w-full relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-600"
                >
                    <IoMdClose size={20} />
                </button>
                <h2 className="text-xl font-bold mb-4">Import CSV Files</h2>
                <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center ${
                        isDragging
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-300'
                    }`}
                    onDragEnter={(e) => handleDragEvents(e, true)}
                    onDragOver={(e) => handleDragEvents(e, true)}
                    onDragLeave={(e) => handleDragEvents(e, false)}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileChange}
                        multiple
                    />
                    Drag & Drop or Click to Select Files
                </div>
                {files.length > 0 && (
                    <div className="mt-4">
                        <p className="font-semibold">Selected Files:</p>
                        <ul>
                            {files.map((file, index) => (
                                <li
                                    key={index}
                                    className="flex justify-between"
                                >
                                    <span>{file.name}</span>
                                    <button
                                        className="text-red-500"
                                        onClick={() => handleRemoveFile(index)}
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button
                            className="text-sm text-red-500 mt-2"
                            onClick={handleRemoveAllFiles}
                        >
                            Remove All
                        </button>
                    </div>
                )}
                {error && <p className="text-red-500 mt-2">{error}</p>}
                <div className="mt-4 flex justify-end">
                    <Button
                        label="Cancel"
                        onClick={onClose}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg"
                    />
                    <Button
                        label={`Import ${files.length} File${files.length > 1 ? 's' : ''}`}
                        onClick={handleImport}
                        disabled={isImporting || files.length === 0}
                        className="ml-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    />
                </div>
            </div>
        </div>
    );
};

export default PickupImportCSVModal;
