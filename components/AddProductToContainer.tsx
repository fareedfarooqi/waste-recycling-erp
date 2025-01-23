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
    const [productId, setProductId] = useState<string | null>(null);
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
            productId: string;
            quantity: number;
        };

        let productsAllocated: ProductAllocated[] =
            containerData.products_allocated || [];

        // Check if the productId already exists
        const productIndex = productsAllocated.findIndex(
            (item: ProductAllocated) => item.productId === productId
        );

        if (productIndex !== -1) {
            // Update the quantity for the existing product
            productsAllocated[productIndex].quantity += Number(quantity);
        } else {
            // Add the new product to the array
            productsAllocated.push({
                productId: productId as string,
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
            setProductId(null);
            setQuantity('');
            onProductAdded();
            onClose();
            window.location.reload();
        }, 700);
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
            </div>
            <div className="flex justify-center space-x-4 mt-6">
                <Button label="Cancel" variant="secondary" onClick={onClose} />
                <Button
                    label={loading ? 'Adding...' : 'Add Product'}
                    variant="primary"
                    onClick={handleAddRequest}
                    disabled={loading || !productId || !quantity}
                />
            </div>
        </div>
    );
};

export default AddOutboundContainer;
