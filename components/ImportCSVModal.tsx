import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/config/supabaseClient';
import Button from './Button';
import { IoMdClose } from 'react-icons/io';
import SuccessAnimation from './SuccessAnimation';
import Papa from 'papaparse';

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
    // const [importing, setImporting] = useState(false);
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
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset the file input
        }
    };

    const handleImport = async () => {
        if (files.length === 0) {
            setError('Please select at least one file to import.');
            return;
        }
    
        const invalidFiles = files.filter((file) => !file.name.endsWith('.csv'));
        if (invalidFiles.length > 0) {
            setError('Please select only CSV files.');
            return;
        }
    
        setIsImporting(true);
        setError(null);
        setProgress(0);
    
        try {
            let totalRows = 0;
            let processedRows = 0;
    
            interface CSVRow {
                'Product Name': string;
                'Quantity (kg)': string;
                'Product Description': string;
                'Reserved Location': string;
                'Created Date': string;
                'Last Updated Date': string;
            }
    
            const isValidDate = (dateString: string): boolean => {
                const date = new Date(dateString);
                return !isNaN(date.getTime());
            };
    
            for (const file of files) {
                const text = await file.text();
                const { data } = Papa.parse<CSVRow>(text, { header: true });
                totalRows += data.length;
    
                for (const row of data) {
                    if (!row['Product Name'] || !row['Quantity (kg)']) {
                        setError(
                            `Error in file "${file.name}": Invalid data in one or more rows. Please check the CSV file and try again.`
                        );
                        setIsImporting(false);
                        setProgress(0);
                        return;
                    }
    
                    const productName = row['Product Name'];
                    const quantity = parseInt(row['Quantity (kg)'], 10);
                    const productDescription = row['Product Description'] || 'N/A';
                    const reservedLocation = row['Reserved Location'] || 'N/A';
                    const createdAt = isValidDate(row['Created Date'])
                        ? new Date(row['Created Date']).toISOString()
                        : null;
                    const updatedAt = isValidDate(row['Last Updated Date'])
                        ? new Date(row['Last Updated Date']).toISOString()
                        : new Date().toISOString();
    
                    // Check if the product already exists
                    const { data: existingProducts, error: fetchError } = await supabase
                        .from('products')
                        .select('*')
                        .eq('product_name', productName)
                        .limit(1);
    
                    // if (fetchError) throw fetchError;

                    if (fetchError) {
                        setError(
                            `Error in file "${file.name}": Unable to fetch existing products. Please try again.`
                        );
                        setIsImporting(false);
                        setProgress(0);
                        return;
                    }
    
                    if (existingProducts && existingProducts.length > 0) {
                        // Update existing product
                        const existingProduct = existingProducts[0];
                        const updatedQuantity = existingProduct.quantity + quantity;
    
                        if (updatedQuantity > 10_000_000) {
                            setError(
                                `CSV file "${file.name}" cannot be imported as the quantity for product "${productName}" exceeds the maximum quantity limit.`
                            );
                            setIsImporting(false);
                            setProgress(0);
                            return;
                        }
    
                        const { error: updateError } = await supabase
                            .from('products')
                            .update({
                                quantity: updatedQuantity,
                                product_description: productDescription,
                                reserved_location: reservedLocation,
                                updated_at: updatedAt,
                            })
                            .eq('id', existingProduct.id);
    
                        if (updateError) {
                            setError(
                                `Error in file "${file.name}": Unable to update product "${productName}". Please try again.`
                            );
                            setIsImporting(false);
                            setProgress(0);
                            return;
                        }
                    } else {
                        // Insert new product
                        if (quantity > 10_000_000) {
                            setError(
                                `CSV file "${file.name}" cannot be imported as the quantity for product "${productName}" exceeds the maximum quantity limit.`
                            );
                            setIsImporting(false);
                            setProgress(0);
                            return;
                        }
    
                        const { error: insertError } = await supabase
                            .from('products')
                            .insert([
                                {
                                    product_name: productName,
                                    quantity,
                                    product_description: productDescription,
                                    reserved_location: reservedLocation,
                                    created_at: createdAt || new Date().toISOString(),
                                    updated_at: updatedAt,
                                },
                            ]);
    
                        // if (insertError) throw insertError;
                        if (insertError) {
                            setError(
                                `Error in file "${file.name}": Unable to insert product "${productName}". Please try again.`
                            );
                            setIsImporting(false);
                            setProgress(0);
                            return;
                        }
                    }
    
                    processedRows++;
                    setProgress(Math.round((processedRows / totalRows) * 100));
                }
            }
    
            // router.refresh();
    
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                onImportSuccess();
                onClose();
            }, 700);
        } catch (err: any) {
            console.error(err);
            setError(
                err.message ||
                    'Error importing CSV: Please ensure that you have selected the correct CSV file/s and try again.'
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
                !modalRef.current.contains(event.target as Node) &&
                event.target instanceof Node &&
                !(event.target as Element).closest('.fixed')
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
            className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50 ${isImporting ? 'pointer-events-none' : ''}`}
        >
            {showSuccess && <SuccessAnimation />}
            {isImporting && (
                <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-[60] pointer-events-auto">
                    <div className="text-xl font-bold">
                        Importing Files: {progress}% complete
                    </div>
                </div>
            )}

            <div
                ref={modalRef}
                className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative border border-gray-300"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-700"
                    aria-label="Close"
                >
                    <IoMdClose size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-center">
                    Import CSV Files
                </h2>
                <div
                    className={`mb-4 border-2 border-dashed p-4 rounded-lg ${
                        isDragging
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300'
                    } ${isImporting ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() =>
                        !isImporting && fileInputRef.current?.click()
                    }
                >
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                        multiple
                    />
                    <div className="text-center">
                        <p>
                            Drag and Drop CSV Files or click here to choose
                            files
                        </p>
                    </div>
                </div>
                {files.length > 0 && (
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-semibold">Selected files:</p>
                            <button
                                onClick={handleRemoveAllFiles}
                                className="text-red-500 hover:text-red-700 text-sm"
                            >
                                Remove All
                            </button>
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                            <ul className="list-disc pl-5">
                                {files.map((file, index) => (
                                    <li
                                        key={index}
                                        className="flex justify-between items-center mb-1 p-2 rounded bg-gray-100"
                                    >
                                        <span className="text-sm text-gray-600">
                                            {file.name}
                                        </span>
                                        <button
                                            onClick={() =>
                                                handleRemoveFile(index)
                                            }
                                            className="text-red-500 hover:text-red-700 text-sm"
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
                    <div className="mb-4 p-2 bg-red-100 border border-red-400 rounded">
                        <p className="text-red-700 text-sm">
                            {error}
                            <button
                                onClick={() => setError(null)}
                                className="ml-2 text-blue-500 hover:text-blue-700"
                            >
                                Dismiss
                            </button>
                        </p>
                    </div>
                )}
                <div className="flex justify-center space-x-4 mt-6">
                    <Button
                        label="Cancel"
                        onClick={onClose}
                        variant="secondary"
                    />
                    <Button
                        label={
                            isImporting
                                ? 'Importing...'
                                : `Import ${files.length} ${files.length === 1 ? 'File' : 'Files'}`
                        }
                        onClick={handleImport}
                        disabled={files.length === 0}
                        variant="primary"
                    />
                </div>
            </div>
        </div>
    );
};

export default ImportCSVModal;