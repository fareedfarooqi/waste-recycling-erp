// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { supabase } from '@/config/supabaseClient';
// import Button from './Button';
// import { IoMdClose } from 'react-icons/io';
// import SuccessAnimation from './SuccessAnimation';

// interface ImportCSVModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     onImportSuccess: () => void;
// }

// const ImportCSVModal: React.FC<ImportCSVModalProps> = ({
//     isOpen,
//     onClose,
//     onImportSuccess,
// }) => {
//     const [files, setFiles] = useState<File[]>([]);
//     const [importing, setImporting] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [isDragging, setIsDragging] = useState(false);
//     const [showSuccess, setShowSuccess] = useState(false);

//     const modalRef = useRef<HTMLDivElement>(null);
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files) {
//             setFiles((prevFiles) => [
//                 ...prevFiles,
//                 ...Array.from(e.target.files || []),
//             ]);
//             setError(null);
//         }
//     };

//     const handleDragEnter = useCallback(
//         (e: React.DragEvent<HTMLDivElement>) => {
//             e.preventDefault();
//             e.stopPropagation();
//             setIsDragging(true);
//         },
//         []
//     );

//     const handleDragLeave = useCallback(
//         (e: React.DragEvent<HTMLDivElement>) => {
//             e.preventDefault();
//             e.stopPropagation();
//             setIsDragging(false);
//         },
//         []
//     );

//     const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
//         e.preventDefault();
//         e.stopPropagation();
//     }, []);

//     const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
//         e.preventDefault();
//         e.stopPropagation();
//         setIsDragging(false);
//         if (e.dataTransfer.files) {
//             setFiles((prevFiles) => [
//                 ...prevFiles,
//                 ...Array.from(e.dataTransfer.files),
//             ]);
//             setError(null);
//         }
//     }, []);

//     const handleRemoveFile = (index: number) => {
//         setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
//     };

//     const handleRemoveAllFiles = () => {
//         setFiles([]);
//         if (fileInputRef.current) {
//             fileInputRef.current.value = ''; // Reset the file input
//         }
//     };

//     const handleImport = async () => {
//         if (files.length === 0) {
//             setError('Please select at least one file to import.');
//             return;
//         }

//         setImporting(true);
//         setError(null);

//         try {
//             for (const file of files) {
//                 const text = await file.text();
//                 const rows = text.split('\n').map((row) => row.split(','));
//                 const headers = rows[0];
//                 const data = rows.slice(1);

//                 for (const row of data) {
//                     if (row.length === headers.length) {
//                         const item = {
//                             product_id: row[1],
//                             quantity: parseInt(row[3]),
//                             status: row[4].toLowerCase().replace(' ', '_'),
//                             created_at: row[5],
//                             updated_at: row[6],
//                         };

//                         const { error } = await supabase
//                             .from('processing_requests')
//                             .insert(item);
//                         if (error) throw error;
//                     }
//                 }
//             }
//             setShowSuccess(true);
//             setTimeout(() => {
//                 setShowSuccess(false);
//                 onImportSuccess();
//                 onClose();
//             }, 700);
//         } catch (err) {
//             setError(
//                 'Error importing CSV: Please ensure that you have selected the correct CSV file/s and try again.'
//             );
//         } finally {
//             setImporting(false);
//         }
//     };

//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (
//                 modalRef.current &&
//                 !modalRef.current.contains(event.target as Node)
//             ) {
//                 onClose();
//             }
//         };

//         if (isOpen) {
//             document.addEventListener('mousedown', handleClickOutside);
//         } else {
//             setError(null);
//             setFiles([]);
//         }

//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [isOpen, onClose]);

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
//             {showSuccess && <SuccessAnimation />}
//             <div
//                 ref={modalRef}
//                 className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative border border-gray-300"
//             >
//                 <button
//                     onClick={onClose}
//                     className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//                     aria-label="Close"
//                 >
//                     <IoMdClose size={24} />
//                 </button>
//                 <h2 className="text-2xl font-bold mb-6">Import CSV Files</h2>
//                 <div
//                     className={`mb-4 border-2 border-dashed p-4 rounded-lg ${
//                         isDragging
//                             ? 'border-blue-500 bg-blue-50'
//                             : 'border-gray-300'
//                     }`}
//                     onDragEnter={handleDragEnter}
//                     onDragOver={handleDragOver}
//                     onDragLeave={handleDragLeave}
//                     onDrop={handleDrop}
//                 >
//                     <input
//                         type="file"
//                         accept=".csv"
//                         onChange={handleFileChange}
//                         className="hidden"
//                         ref={fileInputRef}
//                         multiple
//                     />
//                     <div className="text-center">
//                         <p className="mb-2">Drag and drop CSV files here, or</p>
//                         <div className="flex justify-center">
//                             <Button
//                                 label="Choose Files"
//                                 onClick={() => fileInputRef.current?.click()}
//                                 variant="secondary"
//                             />
//                         </div>
//                     </div>
//                     {files.length > 0 && (
//                         <div className="mt-4">
//                             <div className="flex justify-between items-center mb-2">
//                                 <p className="font-semibold">Selected files:</p>
//                                 <button
//                                     onClick={handleRemoveAllFiles}
//                                     className="text-red-500 hover:text-red-700 text-sm"
//                                 >
//                                     Remove All
//                                 </button>
//                             </div>
//                             <ul className="list-disc pl-5">
//                                 {files.map((file, index) => (
//                                     <li
//                                         key={index}
//                                         className="flex justify-between items-center mb-1"
//                                     >
//                                         <span className="text-sm text-gray-600">
//                                             {file.name}
//                                         </span>
//                                         <button
//                                             onClick={() =>
//                                                 handleRemoveFile(index)
//                                             }
//                                             className="text-red-500 hover:text-red-700 text-sm"
//                                         >
//                                             Remove
//                                         </button>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     )}
//                 </div>
//                 {error && (
//                     <div className="mb-4 p-2 bg-red-100 border border-red-400 rounded">
//                         <p className="text-red-700 text-sm">
//                             {error}
//                             <button
//                                 onClick={() => setError(null)}
//                                 className="ml-2 text-blue-500 hover:text-blue-700"
//                             >
//                                 Dismiss
//                             </button>
//                         </p>
//                     </div>
//                 )}
//                 <div className="flex justify-center space-x-4 mt-6">
//                     <Button
//                         label="Cancel"
//                         onClick={onClose}
//                         variant="secondary"
//                     />
//                     <Button
//                         label={
//                             importing
//                                 ? 'Importing...'
//                                 : `Import ${files.length} ${files.length === 1 ? 'File' : 'Files'}`
//                         }
//                         onClick={handleImport}
//                         variant="primary"
//                         disabled={importing || files.length === 0}
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ImportCSVModal;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/config/supabaseClient';
import Button from './Button';
import { IoMdClose } from 'react-icons/io';
import SuccessAnimation from './SuccessAnimation';

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
    const [isDragging, setIsDragging] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

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

        setImporting(true);
        setError(null);

        try {
            for (const file of files) {
                const text = await file.text();
                const rows = text.split('\n').map((row) => row.split(','));
                const headers = rows[0];
                const data = rows.slice(1);

                for (const row of data) {
                    if (row.length === headers.length) {
                        const item = {
                            product_id: row[1],
                            quantity: parseInt(row[3]),
                            status: row[4].toLowerCase().replace(' ', '_'),
                            created_at: row[5],
                            updated_at: row[6],
                        };

                        const { error } = await supabase
                            .from('processing_requests')
                            .insert(item);
                        if (error) throw error;
                    }
                }
            }
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                onImportSuccess();
                onClose();
            }, 700);
        } catch (err) {
            setError(
                'Error importing CSV: Please ensure that you have selected the correct CSV file/s and try again.'
            );
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
            {showSuccess && <SuccessAnimation />}
            <div
                ref={modalRef}
                className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative border border-gray-300"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
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
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
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
                        <p className="mb-2">Drag and drop CSV files here, or</p>
                        <div className="flex justify-center">
                            <Button
                                label="Choose Files"
                                onClick={() => fileInputRef.current?.click()}
                                variant="secondary"
                            />
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
                            <ul className="list-disc pl-5">
                                {files.map((file, index) => (
                                    <li
                                        key={index}
                                        className="flex justify-between items-center mb-1"
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
                    )}
                </div>
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
                            importing
                                ? 'Importing...'
                                : `Import ${files.length} ${files.length === 1 ? 'File' : 'Files'}`
                        }
                        onClick={handleImport}
                        variant="primary"
                        disabled={importing || files.length === 0}
                    />
                </div>
            </div>
        </div>
    );
};

export default ImportCSVModal;
