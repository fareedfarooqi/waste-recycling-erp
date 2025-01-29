'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/config/supabaseClient';
import Button from './Button';
import { IoMdClose } from 'react-icons/io';
import SuccessAnimation from './SuccessAnimation';

const AddOutboundContainer = ({
    isOpen,
    onClose,
    onProductAdded,
    containerId, // Accept containerId as a prop
}: {
    isOpen: boolean;
    onClose: () => void;
    onProductAdded: () => void;
    containerId: string; // Ensure containerId is a string
}) => {
    const [product_id, setproduct_id] = useState<string | null>(null);
    const [quantity, setQuantity] = useState<number | ''>('');
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

        // Fetch the current products_allocated for the specified container
        const { data: containerData, error: fetchError } = await supabase
            .from('containers')
            .select('products_allocated')
            .eq('id', containerId)
            .single();

        if (fetchError) {
            console.error('Error fetching container data:', fetchError);
            setLoading(false);
            return;
        }

        type ProductAllocated = {
            product_id: string;
            quantity: number;
        };

        let productsAllocated: ProductAllocated[] =
            containerData.products_allocated || [];

        // Check if the product_id already exists
        const productIndex = productsAllocated.findIndex(
            (item: ProductAllocated) => item.product_id === product_id
        );

        if (productIndex !== -1) {
            // Update the quantity for the existing product
            productsAllocated[productIndex].quantity += Number(quantity);
        } else {
            // Add the new product to the array
            productsAllocated.push({
                product_id: product_id as string,
                quantity: Number(quantity),
            });
        }

        // Update the container with the new products_allocated array
        const { error: updateError } = await supabase
            .from('containers')
            .update({ products_allocated: productsAllocated })
            .eq('id', containerId);

        if (updateError) {
            console.error('Error updating products_allocated:', updateError);
            setLoading(false);
            return;
        }

        // Show success animation and reset state
        setLoading(false);
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            setproduct_id(null);
            setQuantity('');
            onProductAdded();
            onClose();
            window.location.reload();
        }, 700);
    };

    return (
        <div className="p-4 relative min-h-[200px] flex flex-col bg-white">
            {showSuccess && <SuccessAnimation />}
            <button
                onClick={onClose}
                className="absolute -top-2 -right-2 text-gray-500 hover:text-red-700"
                aria-label="Close"
            >
                <IoMdClose size={24} />
            </button>
            <h2 className="text-lg font-bold mb-4 mt-4">
                Add New Product to Container
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
                            value={product_id || ''}
                            onChange={(e) =>
                                setproduct_id(e.target.value || null)
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
            </div>
            <div className="flex justify-center space-x-4 mt-6">
                {/* <Button label="Cancel" variant="secondary" onClick={onClose} /> */}
                <Button
                    label="Cancel"
                    variant="secondary"
                    onClick={() => onClose}
                    className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-gray-100 text-black rounded hover:bg-gray-100 transition whitespace-nowrap min-w-[120px] min-h-[50px]"
                />
                {/* <Button
                    label={loading ? 'Adding...' : 'Add Product'}
                    variant="primary"
                    onClick={handleAddRequest}
                    disabled={loading || !product_id || !quantity}
                /> */}
                <Button
                    label={loading ? 'Adding...' : 'Add Product'}
                    variant="primary"
                    onClick={handleAddRequest}
                    disabled={loading || !product_id || !quantity}
                    className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-green-600 text-white rounded hover:bg-green-500 transition whitespace-nowrap min-w-[120px] min-h-[50px]"
                />
            </div>
        </div>
    );
};

export default AddOutboundContainer;
