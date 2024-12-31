'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/config/supabaseClient';
import Button from './Button';

const AddProcessingRequest = ({
    isOpen,
    onClose,
    onRequestAdded,
}: {
    isOpen: boolean;
    onClose: () => void;
    onRequestAdded: () => void;
}) => {
    const [productId, setProductId] = useState<string | null>(null); // Store selected product ID
    const [quantity, setQuantity] = useState<number | ''>(''); // Quantity input
    const [status, setStatus] = useState<'new' | 'in_progress' | 'completed'>(
        'new'
    ); // Status input
    const [loading, setLoading] = useState(false); // Loading state
    const [products, setProducts] = useState<
        { id: string; product_name: string }[]
    >([]); // List of products
    const [productLoading, setProductLoading] = useState(true); // Loading state for products

    // Fetch products from Supabase
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

    // Do not render anything if modal is not open
    if (!isOpen) return null;

    const handleAddRequest = async () => {
        if (!productId || !quantity) {
            alert('Please fill out all fields.');
            return;
        }

        setLoading(true);

        const { data, error } = await supabase
            .from('processing_requests')
            .insert([
                {
                    product_id: productId, // Only insert product_id
                    quantity: Number(quantity),
                    status,
                },
            ]);

        setLoading(false);

        if (error) {
            console.error('Error adding processing request:', error.message);
            alert('Failed to add processing request.');
        } else {
            alert('Processing request added successfully!');
            setProductId(null);
            setQuantity('');
            setStatus('new');
            onRequestAdded(); // Notify parent component to refresh data
            onClose(); // Close the modal
        }
    };

    return (
        <div className="border p-4 rounded-md shadow-md">
            <h2 className="text-lg font-bold mb-4">
                Add New Processing Request
            </h2>
            <div className="mb-4">
                <label className="block mb-1">Product</label>
                {productLoading ? (
                    <p>Loading products...</p>
                ) : (
                    <select
                        value={productId || ''}
                        onChange={(e) => setProductId(e.target.value || null)}
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
                <label className="block mb-1">Quantity</label>
                <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                        setQuantity(
                            e.target.value ? Number(e.target.value) : ''
                        )
                    }
                    className="p-2 border rounded-md w-full"
                    placeholder="Enter quantity"
                />
            </div>
            <div className="mb-4">
                <label className="block mb-1">Status</label>
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
            <Button
                label={loading ? 'Adding...' : 'Add Request'}
                variant="primary"
                onClick={handleAddRequest}
                disabled={loading}
            />
        </div>
    );
};

export default AddProcessingRequest;
