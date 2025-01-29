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

    // const handleImport = async () => {
    //     if (files.length === 0) {
    //         setError('Please select at least one file to import.');
    //         return;
    //     }

    //     // Check if all files are CSV files
    //     const invalidFiles = files.filter(
    //         (file) => !file.name.endsWith('.csv')
    //     );
    //     if (invalidFiles.length > 0) {
    //         setError('Please select only CSV files.');
    //         return;
    //     }

    //     setIsImporting(true);
    //     setError(null);
    //     setProgress(0);

    //     try {
    //         let totalRows = 0;
    //         let processedRows = 0;

    //         // Count total rows for all files
    //         for (const file of files) {
    //             const text = await file.text();
    //             const rows = text.split('\n');
    //             totalRows += rows.length - 1; // Subtract 1 for header row
    //         }

    //         for (const file of files) {
    //             const text = await file.text();
    //             const rows = text.split('\n').map((row) => row.split(','));
    //             const headers = rows[0];
    //             const data = rows.slice(1);

    //             for (const row of data) {
    //                 if (row.length === headers.length) {
    //                     const item = {
    //                         product_id: row[1],
    //                         quantity: parseInt(row[3]),
    //                         status: row[4].toLowerCase().replace(' ', '_'),
    //                         created_at: row[5],
    //                         updated_at: row[6],
    //                     };

    //                     const { error } = await supabase
    //                         .from('processing_requests')
    //                         .insert(item);
    //                     if (error) throw error;
    //                 }
    //                 processedRows++;
    //                 setProgress(Math.round((processedRows / totalRows) * 100));
    //             }
    //         }

    //         setShowSuccess(true);
    //         setTimeout(() => {
    //             setShowSuccess(false);
    //             onImportSuccess();
    //             onClose();
    //         }, 700);
    //     } catch (err) {
    //         setError(
    //             'Error importing CSV: Please ensure that you have selected the correct CSV file/s and try again.'
    //         );
    //     } finally {
    //         setIsImporting(false);
    //         setProgress(0);
    //     }
    // };

    // const handleImport = async () => {
    //     if (files.length === 0) {
    //         setError('Please select at least one file to import.');
    //         return;
    //     }

    //     // Validate file extensions
    //     const invalidFiles = files.filter((file) => !file.name.endsWith('.csv'));
    //     if (invalidFiles.length > 0) {
    //         setError('Please select only CSV files.');
    //         return;
    //     }

    //     setIsImporting(true);
    //     setError(null);
    //     setProgress(0);

    //     try {
    //         let totalRows = 0;
    //         let processedRows = 0;

    //         const isValidDate = (dateString: string): boolean => {
    //             const date = new Date(dateString);
    //             return !isNaN(date.getTime());
    //         };

    //         for (const file of files) {
    //             const text = await file.text();
    //             const rows = text.split('\n').map((row) => row.split(','));
    //             const headers = rows[0];
    //             const data = rows.slice(1).filter((row) => row.length === headers.length);

    //             totalRows += data.length;

    //             for (const row of data) {
    //                 const [id, status, productsAllocated, createdDate, updatedDate] = row;

    //                 // Parse productsAllocated field
    //                 const products = productsAllocated
    //                     .split(';')
    //                     .map((product) => {
    //                         const match = product.match(/ID: (.*?), Quantity: (\d+)/);
    //                         if (match) {
    //                             return { product_id: match[1], quantity: parseInt(match[2], 10) };
    //                         }
    //                         return null;
    //                     })
    //                     .filter((p) => p !== null);

    //                 if (!id || !status || products.length === 0) {
    //                     setError(
    //                         `Error in file "${file.name}": Invalid data in row "${row.join(',')}".`
    //                     );
    //                     setIsImporting(false);
    //                     setProgress(0);
    //                     return;
    //                 }

    //                 const formattedCreatedDate = isValidDate(createdDate)
    //                     ? new Date(createdDate).toISOString()
    //                     : new Date().toISOString();

    //                 const formattedUpdatedDate = isValidDate(updatedDate)
    //                     ? new Date(updatedDate).toISOString()
    //                     : new Date().toISOString();

    //                 // Insert container and associated products
    //                 const { error: containerError } = await supabase
    //                     .from('containers')
    //                     .upsert([
    //                         {
    //                             id,
    //                             status: status.toLowerCase(),
    //                             products_allocated: products,
    //                             created_at: formattedCreatedDate,
    //                             updated_at: formattedUpdatedDate,
    //                         },
    //                     ]);

    //                 if (containerError) {
    //                     setError(
    //                         `Error in file "${file.name}": Unable to insert container "${id}".`
    //                     );
    //                     setIsImporting(false);
    //                     setProgress(0);
    //                     return;
    //                 }

    //                 processedRows++;
    //                 setProgress(Math.round((processedRows / totalRows) * 100));
    //             }
    //         }

    //         setShowSuccess(true);
    //         setTimeout(() => {
    //             setShowSuccess(false);
    //             onImportSuccess();
    //             onClose();
    //         }, 700);
    //     } catch (err) {
    //         setError(
    //             'Error importing CSV: Please ensure that you have selected the correct CSV file/s and try again.'
    //         );
    //     } finally {
    //         setIsImporting(false);
    //         setProgress(0);
    //     }
    // };

    // const handleImport = async () => {
    //     if (files.length === 0) {
    //         setError('Please select at least one file to import.');
    //         return;
    //     }

    //     // Validate file extensions
    //     const invalidFiles = files.filter((file) => !file.name.endsWith('.csv'));
    //     if (invalidFiles.length > 0) {
    //         setError('Please select only CSV files.');
    //         return;
    //     }

    //     setIsImporting(true);
    //     setError(null);
    //     setProgress(0);

    //     try {
    //         let totalRows = 0;
    //         let processedRows = 0;

    //         const isValidDate = (dateString: string): boolean => {
    //             const date = new Date(dateString);
    //             return !isNaN(date.getTime());
    //         };

    //         for (const file of files) {
    //             const text = await file.text();
    //             const rows = text.split('\n').map((row) => row.split(','));
    //             const headers = rows[0];
    //             const data = rows.slice(1).filter((row) => row.length === headers.length);

    //             totalRows += data.length;

    //             for (const row of data) {
    //                 const [id, status, productsAllocated, createdDate, updatedDate] = row;

    //                 // Parse the Products Allocated field
    //                 const products = productsAllocated
    //                     .split(';')
    //                     .map((product) => {
    //                         const match = product.match(/\(ID: (.*?), Quantity: (\d+)\)/);
    //                         if (match) {
    //                             return { product_id: match[1].trim(), quantity: parseInt(match[2], 10) };
    //                         }
    //                         return null;
    //                     })
    //                     .filter((p) => p !== null);

    //                 if (!id || !status || products.length === 0) {
    //                     setError(
    //                         `Error in file "${file.name}": Invalid data in row "${row.join(',')}".`
    //                     );
    //                     setIsImporting(false);
    //                     setProgress(0);
    //                     return;
    //                 }

    //                 const formattedCreatedDate = isValidDate(createdDate)
    //                     ? new Date(createdDate).toISOString()
    //                     : new Date().toISOString();

    //                 const formattedUpdatedDate = isValidDate(updatedDate)
    //                     ? new Date(updatedDate).toISOString()
    //                     : new Date().toISOString();

    //                 // Insert container and associated products
    //                 const { error: containerError } = await supabase
    //                     .from('containers')
    //                     .upsert([
    //                         {
    //                             id,
    //                             status: status.toLowerCase(),
    //                             products_allocated: products,
    //                             created_at: formattedCreatedDate,
    //                             updated_at: formattedUpdatedDate,
    //                         },
    //                     ]);

    //                 if (containerError) {
    //                     setError(
    //                         `Error in file "${file.name}": Unable to insert container "${id}".`
    //                     );
    //                     setIsImporting(false);
    //                     setProgress(0);
    //                     return;
    //                 }

    //                 processedRows++;
    //                 setProgress(Math.round((processedRows / totalRows) * 100));
    //             }
    //         }

    //         setShowSuccess(true);
    //         setTimeout(() => {
    //             setShowSuccess(false);
    //             onImportSuccess();
    //             onClose();
    //         }, 700);
    //     } catch (err) {
    //         setError(
    //             'Error importing CSV: Please ensure that you have selected the correct CSV file/s and try again.'
    //         );
    //     } finally {
    //         setIsImporting(false);
    //         setProgress(0);
    //     }
    // };

    const handleImport = async () => {
        if (files.length === 0) {
            setError('Please select at least one file to import.');
            return;
        }

        // Validate file extensions
        const invalidFiles = files.filter(
            (file) => !file.name.endsWith('.csv')
        );
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
                ID: string;
                Status: string;
                'Products Allocated': string;
                'Created Date': string;
                'Last Updated Date': string;
            }

            const isValidDate = (dateString: string): boolean => {
                const date = new Date(dateString);
                return !isNaN(date.getTime());
            };

            for (const file of files) {
                const text = await file.text();

                // Use PapaParse to parse the CSV file
                const { data, errors } = Papa.parse<CSVRow>(text, {
                    header: true,
                    skipEmptyLines: true,
                });

                if (errors.length > 0) {
                    setError(
                        `Error in parsing file "${file.name}": ${errors[0].message}`
                    );
                    setIsImporting(false);
                    setProgress(0);
                    return;
                }

                totalRows += data.length;

                for (const row of data) {
                    const id = row.ID;
                    const status = row.Status;
                    const productsAllocated = row['Products Allocated'];
                    const createdDate = row['Created Date'];
                    const updatedDate = row['Last Updated Date'];

                    if (!id || !status || !productsAllocated) {
                        setError(
                            `Invalid data in file "${file.name}". Missing required fields.`
                        );
                        setIsImporting(false);
                        setProgress(0);
                        return;
                    }

                    // Parse "Products Allocated" field
                    const products = productsAllocated
                        .split(';')
                        .map((product: string) => {
                            const match = product.match(
                                /\(ID: (.*?), Quantity: (\d+)\)/
                            );
                            if (match) {
                                return {
                                    product_id: match[1].trim(),
                                    quantity: parseInt(match[2], 10),
                                };
                            }
                            return null;
                        })
                        .filter(
                            (
                                p: {
                                    product_id: string;
                                    quantity: number;
                                } | null
                            ): p is { product_id: string; quantity: number } =>
                                p !== null
                        );

                    if (products.length === 0) {
                        setError(
                            `Error in file "${file.name}": Invalid "Products Allocated" format in row.`
                        );
                        setIsImporting(false);
                        setProgress(0);
                        return;
                    }

                    const formattedCreatedDate = isValidDate(createdDate)
                        ? new Date(createdDate).toISOString()
                        : new Date().toISOString();

                    const formattedUpdatedDate = isValidDate(updatedDate)
                        ? new Date(updatedDate).toISOString()
                        : new Date().toISOString();

                    // Insert container and associated products
                    const { error: containerError } = await supabase
                        .from('containers')
                        .upsert([
                            {
                                id,
                                status: status.toLowerCase(),
                                products_allocated: products,
                                created_at: formattedCreatedDate,
                                updated_at: formattedUpdatedDate,
                            },
                        ]);

                    if (containerError) {
                        setError(
                            `Error inserting container "${id}" in file "${file.name}".`
                        );
                        setIsImporting(false);
                        setProgress(0);
                        return;
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
        } catch {
            setError(
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
                        variant="secondary"
                        onClick={onClose}
                        className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-gray-100 text-black rounded hover:bg-gray-100 transition whitespace-nowrap min-w-[120px] min-h-[50px]"
                    />
                    <Button
                        label={
                            isImporting
                                ? 'Importing...'
                                : `Import ${files.length} ${files.length === 1 ? 'File' : 'Files'}`
                        }
                        variant="primary"
                        onClick={handleImport}
                        disabled={files.length === 0}
                        className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-green-600 text-white rounded hover:bg-green-500 transition whitespace-nowrap min-w-[120px] min-h-[50px]"
                    />
                </div>
            </div>
        </div>
    );
};

export default ImportCSVModal;
