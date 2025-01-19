'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/config/supabaseClient';
import Button from './Button';
import { IoMdClose } from 'react-icons/io';
import SuccessAnimation from './SuccessAnimation';

const AddProcessingRequest = ({
    isOpen,
    onClose,
    onRequestAdded,
}: {
    isOpen: boolean;
    onClose: () => void;
    onRequestAdded: () => void;
}) => {
    const [productId, setProductId] = useState<string | null>(null);
    const [quantity, setQuantity] = useState<number | ''>('');
    const [status, setStatus] = useState<'new' | 'in_progress' | 'completed'>(
        'new'
    );
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<
        { id: string; product_name: string }[]
    >([]);
    const [productLoading, setProductLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            setProductLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('id, product_name');
            if (error) {
                console.error('Error fetching products:', error.message);
            } else {
                setProducts(data || []);
            }
            setProductLoading(false);
        };

        fetchProducts();
    }, []);

    if (!isOpen) return null;

    const handleAddRequest = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from('processing_requests')
            .insert([
                {
                    product_id: productId,
                    quantity: Number(quantity),
                    status,
                },
            ]);

        setLoading(false);

        if (error) {
            console.error('Error adding processing request:', error.message);
            alert('Failed to add processing request.');
        } else {
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setProductId(null);
                setQuantity('');
                setStatus('new');
                onRequestAdded();
                onClose();
            }, 700);
        }
    };

    return (
        <div className="p-4 relative min-h-[400px] flex flex-col bg-white">
            {showSuccess && <SuccessAnimation />}
            <button
                onClick={onClose}
                className="absolute -top-2 -right-2 text-gray-500 hover:text-gray-700"
                aria-label="Close"
            >
                <IoMdClose size={24} />
            </button>
            <h2 className="text-lg font-bold mb-4 mt-4">
                Add New Processing Request
            </h2>
            <div className="flex-grow">
                <div className="mb-4">
                    <label className="block mb-1">
                        Product{' '}
                        <span className="text-red-500 font-bold text-lg">
                            *
                        </span>
                    </label>
                    {productLoading ? (
                        <p>Loading products...</p>
                    ) : (
                        <select
                            value={productId || ''}
                            onChange={(e) =>
                                setProductId(e.target.value || null)
                            }
                            className="p-2 border rounded-md w-full"
                        >
                            <option value="">Select a product</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.product_name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                <div className="mb-4">
                    <label className="block mb-1">
                        Quantity{' '}
                        <span className="text-red-500 font-bold text-lg">
                            *
                        </span>
                    </label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                            const value = Number(e.target.value);
                            setQuantity(value > 0 ? value : '');
                        }}
                        onKeyDown={(e) => {
                            if (['-', 'e', '+', '.'].includes(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        className="p-2 border rounded-md w-full"
                        placeholder="Enter quantity"
                        min="1"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-1">
                        Status{' '}
                        <span className="text-red-500 font-bold text-lg">
                            *
                        </span>
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
                        className="p-2 border rounded-md w-full"
                    >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-center space-x-4 mt-6">
                <Button label="Cancel" variant="secondary" onClick={onClose} />
                <Button
                    label={loading ? 'Adding...' : 'Add Request'}
                    variant="primary"
                    onClick={handleAddRequest}
                    disabled={loading || !productId || !quantity}
                />
            </div>
        </div>
    );
};

export default AddProcessingRequest;
