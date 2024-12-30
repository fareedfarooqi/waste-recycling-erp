'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/config/supabaseClient';
import Button from './Button';
import { v4 as uuidv4 } from 'uuid';

const AddProcessingRequest = ({
    isOpen,
    onClose,
    onRequestAdded,
}: {
    isOpen: boolean;
    onClose: () => void;
    onRequestAdded: () => void;
}) => {
    const [productName, setProductName] = useState('');
    const [productId, setProductId] = useState<string | null>(null); // Store selected product ID
    const [quantity, setQuantity] = useState<number | ''>('');
    const [status, setStatus] = useState<'new' | 'in_progress' | 'completed'>(
        'new'
    );
    const [loading, setLoading] = useState(false);
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

    // Format current date for "created_at"
    const getFormattedDate = () => {
        const date = new Date();
        return date.toISOString().replace('T', ' ').slice(0, 26); // Format to "YYYY-MM-DD HH:mm:ss.ssssss"
    };

    const handleProductChange = (selectedProductName: string) => {
        setProductName(selectedProductName);
        const selectedProduct = products.find(
            (product) => product.product_name === selectedProductName
        );
        setProductId(selectedProduct ? selectedProduct.id : null); // Update product ID based on selection
    };

    // Do not render anything if modal is not open
    if (!isOpen) return null;

    const handleAddRequest = async () => {
        if (!productName || !quantity || !productId) {
            alert('Please fill out all fields.');
            return;
        }

        setLoading(true);

        const { data, error } = await supabase
            .from('processing_requests')
            .insert([
                {
                    id: uuidv4(),
                    product_name: productName,
                    product_id: productId, // Add product_id field
                    quantity: Number(quantity),
                    status,
                    created_at: getFormattedDate(), // Add created_at field
                    updated_at: getFormattedDate(),
                },
            ]);

        setLoading(false);

        if (error) {
            console.error('Error adding processing request:', error.message);
            alert('Failed to add processing request.');
        } else {
            alert('Processing request added successfully!');
            setProductName('');
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
                <label className="block mb-1">Product Name</label>
                {productLoading ? (
                    <p>Loading products...</p>
                ) : (
                    <select
                        value={productName}
                        onChange={(e) => handleProductChange(e.target.value)}
                        className="p-2 border rounded-md w-full"
                    >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                            <option
                                key={product.id}
                                value={product.product_name}
                            >
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
