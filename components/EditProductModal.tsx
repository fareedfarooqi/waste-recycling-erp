'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/config/supabaseClient';
import Button from './Button';
import { IoMdClose } from 'react-icons/io';
import SuccessAnimation from './SuccessAnimation';

interface ProductAllocation {
    product_id: string;
    quantity: number;
    productName: string;
}

// type OutboundContainerItem = {
//     id: string;
//     status: 'new' | 'packing' | 'sent' | 'invoiced';
//     products_allocated: ProductAllocation[] | null;
//     container_photo: string;
//     created_at: string;
//     updated_at: string;
// };

type EditProductModalProps = {
    isOpen: boolean;
    onClose: () => void;
    containerID: string;
    productToEditID: string;
    productQuantity: number;
    productName: string;
    onProductUpdated: () => void;
};

const EditProductModal = ({
    isOpen,
    onClose,
    containerID,
    productToEditID,
    productQuantity,
    productName,
    onProductUpdated,
}: EditProductModalProps): JSX.Element | null => {
    if (!isOpen) return null;

    const [product_id] = useState<string>(productToEditID);
    const [showSuccess, setShowSuccess] = useState(false);
    const [quantity, setQuantity] = useState<number | null>(productQuantity);
    const [error, setError] = useState<string>(''); // Initialize error state
    const [loading, setLoading] = useState<boolean>(false);
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const [, setProduct] = useState<{
        quantity: number;
        product_id: string;
    } | null>(null);

    useEffect(() => {
        const fetchProductDetails = async () => {
            const { data, error } = await supabase
                .from('containers')
                .select('products_allocated')
                .eq('id', containerID)
                .single();

            if (error) {
                console.error('Error fetching products:', error.message);
            } else if (data && data.products_allocated) {
                // Find the product with the given productToEditID
                const productDetails = data.products_allocated.find(
                    (product: { product_id: string }) =>
                        product.product_id === productToEditID
                );

                if (productDetails) {
                    setProduct(productDetails); // Assuming setProducts expects an array
                } else {
                    console.warn('Product not found with the given ID');
                }
            }
        };

        fetchProductDetails();
    }, [containerID, productToEditID]); // Add dependencies to re-run when these change

    useEffect(() => {
        // Check if the quantity fields has changed
        setHasChanges(quantity !== productQuantity);
    }, [quantity, productQuantity]);

    const handleSaveChanges = async () => {
        if (quantity === null) {
            setError('Quantity cannot be empty.'); // Set an error message
            return; // Stop execution
        }

        setLoading(true);
        setError(''); // Clear any previous errors

        // Fetch the current container data
        const { data, error: fetchError } = await supabase
            .from('containers')
            .select('products_allocated')
            .eq('id', containerID)
            .single();

        if (fetchError) {
            console.error('Error fetching container data:', fetchError.message);
            setLoading(false);
            return;
        }

        if (data && data.products_allocated) {
            // Create a new array with the updated product quantity
            const updatedProducts = data.products_allocated.map(
                (product: ProductAllocation) => {
                    if (product.product_id === product_id) {
                        return { ...product, quantity }; // Update the quantity of the product
                    }
                    return product; // Leave other products unchanged
                }
            );

            // Update the container with the modified products_allocated
            const { error } = await supabase
                .from('containers')
                .update({ products_allocated: updatedProducts })
                .eq('id', containerID);

            if (error) {
                console.error(
                    'Error updating product quantity:',
                    error.message
                );
            } else {
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    onProductUpdated();
                    onClose();
                    window.location.reload();
                }, 700);
            }
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
                <h2 className="text-xl font-bold mb-4 text-center">
                    {productName}
                </h2>
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-700"
                    aria-label="Close"
                >
                    <IoMdClose size={24} />
                </button>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Quantity (kg){' '}
                        <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                        // type="text"
                        // value={quantity === null ? '' : quantity}
                        // onChange={(e) => {
                        //     const value = e.target.value;

                        //     // Ensure only numeric input
                        //     if (/[^0-9]/.test(value)) {
                        //         return;
                        //     }
                        //     if (value === '' || value === '0') {
                        //         setQuantity(null); // Temporarily set to null for empty input
                        //     }

                        //     // Convert to number and validate against the limit
                        //     const numericValue = Number(value);
                        //     if (numericValue <= 10_000_000) {
                        //         setQuantity(numericValue);
                        //     }
                        // }}
                        // className="w-full p-2 border rounded-md"
                        // placeholder="Enter quantity"
                        // maxLength={8} // Limit the input length to avoid extremely large numbers
                        // type="text"
                        // value={quantity === null || quantity === 0 ? '' : quantity}
                        // onChange={(e) => {
                        //     const value = e.target.value;

                        //     // Ensure only numeric input
                        //     if (/[^0-9]/.test(value)) {
                        //         return;
                        //     }

                        //     // If the input is empty, set quantity to null
                        //     if (value === '') {
                        //         setQuantity(null);
                        //         return;
                        //     }

                        //     // Convert to number and validate against the limit
                        //     const numericValue = Number(value);
                        //     if (numericValue <= 10_000_000) {
                        //         setQuantity(numericValue);
                        //     }
                        // }}
                        // className="w-full p-2 border rounded-md"
                        // placeholder="Enter quantity"
                        // maxLength={8} // Limit the input length to avoid extremely large numbers
                        type="text"
                        value={quantity !== null ? quantity : ''} // Ensure value is always defined
                        onChange={(e) => {
                            const value = e.target.value;

                            // Ensure only numeric input
                            if (/[^0-9]/.test(value)) {
                                return;
                            }

                            // Handle empty input
                            if (value === '') {
                                setQuantity(null);
                                return;
                            }

                            // Convert to number and validate against the limit
                            const numericValue = Number(value);
                            if (numericValue <= 10_000_000) {
                                setQuantity(numericValue);
                            }
                        }}
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter quantity"
                        maxLength={8} // Limit the input length to avoid extremely large numbers
                    />
                    {error && <p className="text-red-500">{error}</p>}
                </div>
                <div className="flex justify-center space-x-4 mt-6">
                    {/* <Button
                        label="Cancel"
                        onClick={onClose}
                        variant="secondary"
                    /> */}
                    <Button
                        label="Cancel"
                        onClick={onClose}
                        variant="secondary"
                        className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-gray-100 text-black rounded hover:bg-gray-100 transition whitespace-nowrap min-w-[120px] min-h-[50px]"
                    />
                    {/* <Button
                        label={loading ? 'Saving...' : 'Save Changes'}
                        onClick={handleSaveChanges}
                        variant="primary"
                        disabled={loading || !hasChanges} // Disable button if loading or no changes
                    /> */}
                    <Button
                        label={loading ? 'Saving...' : 'Save Changes'}
                        variant="primary"
                        onClick={handleSaveChanges}
                        disabled={loading || !hasChanges}
                        className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-green-600 text-white rounded hover:bg-green-500 transition whitespace-nowrap min-w-[120px] min-h-[50px]"
                    />
                </div>
            </div>
        </div>
    );
};

export default EditProductModal;
