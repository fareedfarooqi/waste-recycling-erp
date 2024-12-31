import React, { useState, useEffect } from 'react';
import { supabase } from '@/config/supabaseClient';
import Button from './Button';

type ProcessingRequestItem = {
    id: string;
    product_id: string;
    quantity: number;
    status: 'new' | 'in_progress' | 'completed';
    created_at: string;
    updated_at: string;
    product_name: string;
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

    const [productName, setProductName] = useState<string>(
        processingRequest.product_name
    );
    const [quantity, setQuantity] = useState<number>(
        processingRequest.quantity
    );
    const [status, setStatus] = useState<'new' | 'in_progress' | 'completed'>(
        processingRequest.status
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [products, setProducts] = useState<ProductItem[]>([]);

    // Fetch products from the `products` table
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

    const handleSaveChanges = async () => {
        setLoading(true);

        // Find the corresponding product_id for the selected product_name
        const selectedProduct = products.find(
            (product) => product.product_name === productName
        );

        if (!selectedProduct) {
            console.error('Selected product not found in the products list.');
            setLoading(false);
            return;
        }

        const { error } = await supabase
            .from('processing_requests')
            .update({
                product_name: selectedProduct.product_name,
                product_id: selectedProduct.id, // Update the product_id
                quantity,
                status,
            })
            .eq('id', processingRequest.id);

        if (error) {
            console.error('Error updating request:', error.message);
        } else {
            onRequestUpdated();
            onClose();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">
                    Edit Processing Request
                </h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Product Name
                    </label>
                    <select
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="w-full p-2 border rounded-md"
                    >
                        {products.map((product) => (
                            <option
                                key={product.id}
                                value={product.product_name}
                            >
                                {product.product_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Quantity (kg)
                    </label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full p-2 border rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Status
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
                <div className="flex justify-end space-x-4">
                    <Button
                        label="Cancel"
                        onClick={onClose}
                        variant="secondary"
                    />
                    <Button
                        label={loading ? 'Saving...' : 'Save Changes'}
                        onClick={handleSaveChanges}
                        variant="primary"
                        disabled={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditProcessingRequestModal;
