import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/config/supabaseClient';
import Button from './Button';
import { IoMdClose } from 'react-icons/io';

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

    const handleImport = async () => {
        if (!file) {
            setError('Please select a file to import.');
            return;
        }

        setImporting(true);
        setError(null);

        try {
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

            onImportSuccess();
        } catch (err) {
            setError('Error importing CSV: ' + (err as Error).message);
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
            <div
                ref={modalRef}
                className="bg-white p-6 pb-6 rounded-lg shadow-lg w-96 relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    aria-label="Close"
                >
                    <IoMdClose size={24} />
                </button>
                <h2 className="text-xl font-bold mb-4 pr-8">Import CSV</h2>
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="mb-4"
                />
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="flex justify-center space-x-4 mt-6">
                    <Button
                        label="Cancel"
                        onClick={onClose}
                        variant="secondary"
                    />
                    <Button
                        label={importing ? 'Importing...' : 'Import'}
                        onClick={handleImport}
                        variant="primary"
                        disabled={importing || !file}
                    />
                </div>
            </div>
        </div>
    );
};

export default ImportCSVModal;
