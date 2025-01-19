'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/config/supabaseClient';
import Button from './Button';
import { IoMdClose } from 'react-icons/io';
import SuccessAnimation from './SuccessAnimation';

type ProcessingRequestItem = {
    id: string;
    product_id: string;
    quantity: number;
    status: 'new' | 'in_progress' | 'completed';
    created_at: string;
    updated_at: string;
};

type ProductItem = {
    id: string;
    product_name: string;
};

type EditProcessingRequestModalProps = {
    isOpen: boolean;
    onClose: () => void;
    processingRequest: ProcessingRequestItem;
    onRequestUpdated: () => void;
};

const EditProcessingRequestModal = ({
    isOpen,
    onClose,
    processingRequest,
    onRequestUpdated,
}: EditProcessingRequestModalProps): JSX.Element | null => {
    if (!isOpen) return null;

    const [productId, setProductId] = useState<string>(
        processingRequest.product_id
    );
    const [showSuccess, setShowSuccess] = useState(false);
    const [quantity, setQuantity] = useState<number | null>(
        processingRequest.quantity
    );
    const [status, setStatus] = useState<'new' | 'in_progress' | 'completed'>(
        processingRequest.status
    );
    const [error, setError] = useState<string>(''); // Initialize error state
    const [loading, setLoading] = useState<boolean>(false);
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [hasChanges, setHasChanges] = useState<boolean>(false);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('id, product_name');
            if (error) {
                console.error('Error fetching products:', error.message);
            } else {
                setProducts(data as ProductItem[]);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        // Check if any of the fields have changed
        setHasChanges(
            productId !== processingRequest.product_id ||
                quantity !== processingRequest.quantity ||
                status !== processingRequest.status
        );
    }, [productId, quantity, status, processingRequest]);

    const handleSaveChanges = async () => {
        if (quantity === null) {
            setError('Quantity cannot be empty.'); // Set an error message
            return; // Stop execution
        }

        setLoading(true);
        setError(''); // Clear any previous errors

        const { error } = await supabase
            .from('processing_requests')
            .update({
                product_id: productId,
                quantity,
                status,
            })
            .eq('id', processingRequest.id);

        if (error) {
            console.error('Error updating request:', error.message);
        } else {
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                onRequestUpdated();
                onClose();
            }, 700);
        }
        setLoading(false);
    };

    const handleOverlayClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        },
        [onClose]
    );

    return (
        <div
            className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50"
            onClick={handleOverlayClick}
        >
            {showSuccess && <SuccessAnimation />}
            <div
                className="bg-white p-6 pb-4 rounded-lg shadow-lg w-96 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    aria-label="Close"
                >
                    <IoMdClose size={24} />
                </button>
                <h2 className="text-xl font-bold mb-4 pr-8 text-center">
                    Edit Processing Request
                </h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Product{' '}
                        <span className="text-red-500 font-bold">*</span>
                    </label>
                    <select
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        className="w-full p-2 border rounded-md"
                    >
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.product_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Quantity (kg){' '}
                        <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                        type="text" // Change to text to handle the input validation manually
                        value={quantity === null ? '' : quantity}
                        onChange={(e) => {
                            const value = e.target.value;
                            // Use a regular expression to block unwanted characters
                            if (/[^0-9]/.test(value)) {
                                // If the value contains anything other than digits, don't update the state
                                return;
                            }
                            if (value === '') {
                                setQuantity(null); // Temporarily set to null for empty input
                            } else {
                                const numericValue = Math.max(0, Number(value));
                                setQuantity(numericValue);
                            }
                        }}
                        className="w-full p-2 border rounded-md"
                        min="0"
                    />
                    {error && <p className="text-red-500">{error}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Status <span className="text-red-500 font-bold">*</span>
                    </label>
                    <select
                        value={status}
                        onChange={(e) =>
                            setStatus(
                                e.target.value as
                                    | 'new'
                                    | 'in_progress'
                                    | 'completed'
                            )
                        }
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <div className="flex justify-center space-x-4 mt-6">
                    <Button
                        label="Cancel"
                        onClick={onClose}
                        variant="secondary"
                    />
                    <Button
                        label={loading ? 'Saving...' : 'Save Changes'}
                        onClick={handleSaveChanges}
                        variant="primary"
                        disabled={loading || !hasChanges} // Disable button if loading or no changes
                    />
                </div>
            </div>
        </div>
    );
};

export default EditProcessingRequestModal;
