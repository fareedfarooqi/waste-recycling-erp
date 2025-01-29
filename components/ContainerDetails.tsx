'use client';

import type React from 'react';
import { useRef } from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '@/config/supabaseClient';
import ImageModal from '@/components/ImageModal';
import DateFormatter from './DateFormatter';
import Button from '@/components/Button';
import { FaPlus, FaEdit, FaTrashAlt, FaClipboard } from 'react-icons/fa';
import AddOutboundContainer from './AddProductToContainer';
import EditProductModal from './EditProductModal';
import SuccessAnimation from './SuccessAnimation';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface ProductAllocation {
    product_id: string;
    quantity: number;
    productName: string;
}

type OutboundContainerItem = {
    id: string;
    status: 'new' | 'packing' | 'sent' | 'invoiced';
    products_allocated: ProductAllocation[] | null;
    container_photo: string;
    created_at: string;
    updated_at: string;
};

interface Props {
    id: string;
}

const ContainerDetails: React.FC<Props> = ({ id }) => {
    const [containerInfo, setContainerInfo] =
        useState<OutboundContainerItem | null>(null);
    const [loadingContainer, setLoadingContainer] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isAddModalOpenContainer, setIsAddModalOpenContainer] =
        useState<boolean>(false);
    const [, setRefresh] = useState<boolean>(false);
    const modalRef = useRef<HTMLDivElement | null>(null);
    const [productToEdit, setProductToEdit] = useState<string | null>(null);
    const [productName, setProductName] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [productQuantity, setProductQuantity] = useState<number | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [productToDeleteID, setProductToDeleteID] = useState<string | null>(
        null
    );
    const [productToDeleteName, setProductToDeleteName] = useState<
        string | null
    >(null);

    const fetchContainer = async (idParam: string) => {
        try {
            setLoadingContainer(true);
            const { data, error } = await supabase
                .from('containers')
                .select('*')
                .eq('id', idParam)
                .single();

            if (error) throw error;

            const containerData = data as OutboundContainerItem;

            // Fetch product names for allocated products
            if (containerData.products_allocated) {
                const product_ids = containerData.products_allocated.map(
                    (product) => product.product_id
                );
                const { data: products, error: productError } = await supabase
                    .from('products')
                    .select('id, product_name')
                    .in('id', product_ids);

                if (productError) throw productError;

                // Map product names to allocated products
                const updatedProducts = containerData.products_allocated.map(
                    (product) => {
                        const productDetails = products?.find(
                            (p) => p.id === product.product_id
                        );
                        return {
                            ...product,
                            productName:
                                productDetails?.product_name ||
                                product.productName, // Fallback to existing productName if not found
                        };
                    }
                );

                // Update container data with product names
                containerData.products_allocated = updatedProducts;
            }

            setContainerInfo(containerData);
            setLoadingContainer(false);
        } catch (err) {
            console.error('Error fetching container:', err);
            setError('Failed to fetch container details.');
            setLoadingContainer(false);
        }
    };

    const handleProductAdded = () => {
        setRefresh((prev) => !prev);
        setIsAddModalOpenContainer(false);
    };

    const handleProductUpdated = () => {
        setRefresh((prev) => !prev);
    };

    const handleDeleteItem = async () => {
        if (productToDeleteID && containerInfo?.products_allocated) {
            try {
                // Step 1: Filter out the product with the matching product_id
                const updatedProducts = containerInfo.products_allocated.filter(
                    (product) => product.product_id !== productToDeleteID
                );

                // Step 2: Update the products_allocated field in the database
                const { error: updateError } = await supabase
                    .from('containers')
                    .update({ products_allocated: updatedProducts })
                    .eq('id', containerInfo.id);

                if (updateError) {
                    console.error(
                        'Error updating products: ',
                        updateError.message
                    );
                } else {
                    setShowSuccess(true);
                    setTimeout(() => {
                        setShowSuccess(false);
                        window.location.reload();
                    }, 700);
                }
            } catch (err) {
                console.error('Unexpected error: ', err);
            }
        }

        setIsDeleteModalOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node)
            ) {
                setIsAddModalOpenContainer(false);
            }
        };

        if (isAddModalOpenContainer) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAddModalOpenContainer]);

    useEffect(() => {
        fetchContainer(id);
    }, [id]);

    if (loadingContainer) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <svg
                    className="animate-spin h-8 w-8 text-green-600 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <p className="text-lg font-medium text-gray-600">
                    Loading container details...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <p className="text-lg font-bold text-red-500">Error: {error}</p>
            </div>
        );
    }

    if (!containerInfo) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <p className="text-lg font-medium text-gray-600">
                    No container found.
                </p>
            </div>
        );
    }

    const statusColors = {
        new: 'bg-[#ffc8ce]',
        packing: 'bg-[#feeb9c]',
        sent: 'bg-[#c6efcd]',
        invoiced: 'bg-[#bbdefb]',
    };

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
            {showSuccess && <SuccessAnimation />}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-3xl font-bold text-green-700 flex items-center mb-3">
                        <FaClipboard className="mr-3 text-green-600" />
                        Container Details
                    </h3>
                    <span
                        className={`${statusColors[containerInfo.status]} text-gray-700 px-3 py-1 rounded-full text-sm font-semibold`}
                    >
                        {containerInfo.status.charAt(0).toUpperCase() +
                            containerInfo.status.slice(1)}
                    </span>
                </div>
                {containerInfo.container_photo && (
                    <div className="px-4 py-5 sm:px-6">
                        <img
                            src={
                                containerInfo.container_photo ||
                                '/placeholder.svg'
                            }
                            alt="Container"
                            className="w-full h-64 object-cover rounded-lg shadow-md cursor-pointer"
                            onClick={() => setIsImageModalOpen(true)}
                        />
                    </div>
                )}
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                ID
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {containerInfo.id}
                            </dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Status
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {containerInfo.status.charAt(0).toUpperCase() +
                                    containerInfo.status.slice(1)}
                            </dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Created At
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {
                                    <DateFormatter
                                        date={containerInfo.created_at}
                                    />
                                }
                            </dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Updated At
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {
                                    <DateFormatter
                                        date={containerInfo.updated_at}
                                    />
                                }
                            </dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:px-6">
                            <details className="w-full" open>
                                <summary className="text-sm font-medium text-gray-500 cursor-pointer focus:outline-none">
                                    Allocated Products
                                </summary>
                                <div className="mt-4">
                                    {Array.isArray(
                                        containerInfo.products_allocated
                                    ) &&
                                    containerInfo.products_allocated.length >
                                        0 ? (
                                        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200 max-h-80 overflow-y-auto">
                                            {containerInfo.products_allocated.map(
                                                (product, index) => (
                                                    <li
                                                        key={index}
                                                        className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                                                    >
                                                        <div className="w-0 flex-1 flex items-center">
                                                            <span className="ml-2 flex-1 w-0 truncate">
                                                                {
                                                                    product.productName
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="ml-4 flex-shrink-0">
                                                            <span className="font-medium">
                                                                Quantity:{' '}
                                                                {
                                                                    product.quantity
                                                                }
                                                                kg
                                                            </span>
                                                        </div>
                                                        <div className="px-6 py-0">
                                                            <FaEdit
                                                                className="text-gray-500 cursor-pointer hover:text-green-500"
                                                                size={18}
                                                                onClick={() => {
                                                                    setProductToEdit(
                                                                        product.product_id
                                                                    );
                                                                    setProductQuantity(
                                                                        product.quantity
                                                                    );
                                                                    setProductName(
                                                                        product.productName
                                                                    );
                                                                    setIsEditModalOpen(
                                                                        true
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <FaTrashAlt
                                                                className="text-gray-500 cursor-pointer hover:text-red-500"
                                                                size={18}
                                                                onClick={() => {
                                                                    setProductToDeleteID(
                                                                        product.product_id
                                                                    );
                                                                    setProductToDeleteName(
                                                                        product.productName
                                                                    );
                                                                    setIsDeleteModalOpen(
                                                                        true
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            No products allocated
                                        </p>
                                    )}
                                </div>
                                <div className="mt-4 scale-90 origin-left">
                                    {/* <Button
                                        label="Product"
                                        icon={<FaPlus />}
                                        onClick={() =>
                                            setIsAddModalOpenContainer(true)
                                        }
                                        variant="primary"
                                    /> */}
                                    <Button
                                        label="Add Product"
                                        variant="primary"
                                        onClick={() =>
                                            setIsAddModalOpenContainer(true)
                                        }
                                        // icon={<FaPlus />}
                                        icon={
                                            <FaPlus
                                                style={{ strokeWidth: 2 }}
                                                size={18}
                                            />
                                        }
                                        className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-green-600 text-white rounded hover:bg-green-500 transition whitespace-nowrap min-w-[120px]"
                                    />
                                </div>
                            </details>
                        </div>
                    </dl>
                </div>
            </div>
            <div className="mt-8 flex justify-center">
                {/* <Button
                    label="Back"
                    onClick={() => window.history.back()}
                    variant="primary"
                /> */}
                <Button
                    label="Back"
                    variant="primary"
                    onClick={() => window.history.back()}
                    className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-green-600 text-white rounded hover:bg-green-500 transition whitespace-nowrap min-w-[120px] min-h-[50px]"
                />
            </div>
            {isImageModalOpen && containerInfo.container_photo && (
                <ImageModal
                    imageUrl={containerInfo.container_photo}
                    alt="Container"
                    onClose={() => setIsImageModalOpen(false)}
                />
            )}
            {isAddModalOpenContainer && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
                    <div
                        ref={modalRef}
                        className="bg-white p-6 rounded-lg shadow-lg"
                    >
                        <AddOutboundContainer
                            isOpen={isAddModalOpenContainer}
                            onProductAdded={handleProductAdded}
                            onClose={() => setIsAddModalOpenContainer(false)}
                            containerId={id}
                        />
                    </div>
                </div>
            )}
            {isEditModalOpen &&
                productToEdit &&
                productQuantity &&
                productName && (
                    <EditProductModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        productToEditID={productToEdit}
                        containerID={containerInfo.id}
                        productQuantity={productQuantity}
                        onProductUpdated={handleProductUpdated}
                        productName={productName}
                    />
                )}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Remove Product"
                content={
                    <p>
                        Are you sure you want to remove{' '}
                        <strong>{productToDeleteName}</strong> from the
                        container?
                    </p>
                }
                buttons={[
                    {
                        label: 'Cancel',
                        onClick: () => setIsDeleteModalOpen(false),
                        variant: 'secondary',
                    },
                    {
                        label: 'Delete',
                        onClick: handleDeleteItem,
                        variant: 'primary',
                    },
                ]}
            />
        </div>
    );
};

export default ContainerDetails;
