'use client';

import React, { useState, useEffect, useRef } from 'react';
import SidebarSmall from '@/components/Sidebar/SidebarSmall';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useSidebar } from '@/components/Sidebar/SidebarContext';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import { FaPencilAlt, FaPlus, FaTimes } from 'react-icons/fa';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Select from 'react-select';
import SuccessAnimation from '@/components/SuccessAnimation';

interface ProductAllocation {
    productId: string;
    quantity: number;
    productName: string;
}

interface FormValues {
    status: string;
    productsAllocated: ProductAllocation[];
    photos: string[]; // Use URLs for existing photos
    newPhotos: File[]; // New photos added during the edit
}

export default function EditContainerPage() {
    const { isSidebarOpen } = useSidebar();
    const params = useParams();
    const containerId = params.id;
    const router = useRouter();
    const supabase = createClient();

    const [formValues, setFormValues] = useState<FormValues>({
        status: '',
        productsAllocated: [],
        photos: [],
        newPhotos: [],
    });

    const [initialValues, setInitialValues] = useState<FormValues>({
        status: '',
        productsAllocated: [],
        photos: [],
        newPhotos: [],
    });

    const [productOptions, setProductOptions] = useState<
        { value: string; label: string }[]
    >([]);
    const [isDragging, setIsDragging] = useState(false);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null); // Enlarged photo state
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const { data: container, error: containerError } = await supabase
                .from('containers')
                .select('*')
                .eq('id', containerId)
                .single();

            if (containerError) {
                console.error(
                    'Error fetching container:',
                    containerError.message
                );
                return;
            }

            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('id, product_name');

            if (productsError) {
                console.error(
                    'Error fetching products:',
                    productsError.message
                );
                return;
            }

            setProductOptions(
                products.map((product) => ({
                    value: product.id,
                    label: product.product_name,
                }))
            );

            // const productsAllocated = container.products_allocated.map(
            //     (product: ProductAllocation) => ({
            //         productId: product.productId,
            //         quantity: product.quantity,
            //         productName:
            //             products.find((p) => p.id === product.productId)
            //                 ?.product_name || '',
            //     })
            // );

            // Use product_id instead of productId to match database schema
            const productsAllocated = container.products_allocated.map(
                (product: { product_id: string; quantity: number }) => ({
                    productId: product.product_id, // Map to product_id
                    quantity: product.quantity,
                    productName:
                        products.find((p) => p.id === product.product_id)
                            ?.product_name || '', // Find product name by product_id
                })
            );

            setFormValues({
                status: container.status,
                productsAllocated,
                photos: container.container_photo
                    ? container.container_photo.split(',')
                    : [],
                newPhotos: [],
            });

            setInitialValues({
                status: container.status,
                productsAllocated,
                photos: container.container_photo
                    ? container.container_photo.split(',')
                    : [],
                newPhotos: [],
            });
        };

        if (containerId) fetchData();
    }, [containerId, supabase]);

    const handleAddProduct = () => {
        setFormValues((prev) => ({
            ...prev,
            productsAllocated: [
                ...prev.productsAllocated,
                { productId: '', quantity: 0, productName: '' },
            ],
        }));
    };

    const handleProductChange = (
        index: number,
        selectedOption: { value: string; label: string }
    ) => {
        setFormValues((prev) => {
            const updatedProducts = [...prev.productsAllocated];
            updatedProducts[index] = {
                productId: selectedOption.value,
                quantity: updatedProducts[index].quantity,
                productName: selectedOption.label,
            };
            return { ...prev, productsAllocated: updatedProducts };
        });
    };

    const handleQuantityChange = (index: number, value: number) => {
        setFormValues((prev) => {
            const updatedProducts = [...prev.productsAllocated];
            updatedProducts[index].quantity = value;
            return { ...prev, productsAllocated: updatedProducts };
        });
    };

    const handleRemoveProduct = (index: number) => {
        setFormValues((prev) => ({
            ...prev,
            productsAllocated: prev.productsAllocated.filter(
                (_, i) => i !== index
            ),
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const validFiles = Array.from(e.target.files).filter((file) =>
                ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)
            );

            if (validFiles.length !== e.target.files.length) {
                setPhotoError('Only JPG, PNG, and JPEG files are allowed.');
            } else {
                setPhotoError(null);
            }

            setFormValues((prev) => ({
                ...prev,
                newPhotos: [...prev.newPhotos, ...validFiles],
            }));
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files) {
            const validFiles = Array.from(e.dataTransfer.files).filter((file) =>
                ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)
            );

            if (validFiles.length !== e.dataTransfer.files.length) {
                setPhotoError('Only JPG, PNG, and JPEG files are allowed.');
            } else {
                setPhotoError(null);
            }

            setFormValues((prev) => ({
                ...prev,
                newPhotos: [...prev.newPhotos, ...validFiles],
            }));
        }
    };

    const handleThumbnailClick = (photoUrl: string) => {
        setEnlargedPhoto(photoUrl);
    };

    const handleCloseEnlargedPhoto = () => {
        setEnlargedPhoto(null);
    };

    const handleRemovePhoto = (index: number, type: 'existing' | 'new') => {
        setFormValues((prev) => {
            if (type === 'existing') {
                return {
                    ...prev,
                    photos: prev.photos.filter((_, i) => i !== index),
                };
            } else {
                return {
                    ...prev,
                    newPhotos: prev.newPhotos.filter((_, i) => i !== index),
                };
            }
        });
    };

    const isFormValid = () => {
        return (
            JSON.stringify(formValues) !== JSON.stringify(initialValues) &&
            formValues.status.trim() !== '' &&
            formValues.productsAllocated.every(
                (product) => product.productId && product.quantity > 0
            )
        );
    };

    const handleSubmit = async () => {
        if (formValues.productsAllocated.length === 0) {
            setIsModalVisible(true);
            return;
        }

        await saveContainer();
    };

    const saveContainer = async () => {
        const { status, productsAllocated, photos, newPhotos } = formValues;

        // Consolidate productsAllocated into the correct format for the database
        const updatedProductsAllocated = productsAllocated.map((product) => ({
            product_id: product.productId,
            quantity: product.quantity,
        }));

        // Handle photo uploads for new photos
        const uploadedPhotoUrls: string[] = [];
        for (const photo of newPhotos) {
            const { error: uploadError } = await supabase.storage
                .from('container_photos')
                .upload(`containers/${photo.name}`, photo, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) {
                // console.error('Error uploading photo:', uploadError.message);
                // return; // Exit early if there's an upload error
                if (
                    uploadError.message.includes('The resource already exists')
                ) {
                    console.error('Error: Photo already exists in the bucket.');
                    alert(
                        `The photo "${photo.name}" already exists in the bucket.`
                    );
                } else {
                    console.error(
                        'Error uploading photo:',
                        uploadError.message
                    );
                    alert(
                        `Error uploading photo "${photo.name}": ${uploadError.message}`
                    );
                }
                return; // Stop the function execution
            }

            // Generate a signed URL for the uploaded photo
            const { data: signedUrlData, error: signedUrlError } =
                await supabase.storage
                    .from('container_photos')
                    .createSignedUrl(
                        `containers/${photo.name}`,
                        365 * 24 * 60 * 60
                    ); // 1-year expiration

            if (signedUrlError) {
                console.error(
                    'Error generating signed URL:',
                    signedUrlError.message
                );
                return; // Exit early if there's an error generating the signed URL
            }

            if (signedUrlData) {
                uploadedPhotoUrls.push(signedUrlData.signedUrl);
            }
        }

        // Combine existing photos and newly uploaded photo URLs
        const allPhotos = [...photos, ...uploadedPhotoUrls];

        // Prepare the updated container data
        const updatedContainer = {
            status,
            products_allocated: updatedProductsAllocated,
            container_photo: allPhotos.join(','), // Save photos as a comma-separated string
            updated_at: new Date().toISOString(),
        };

        // Update the container in the database
        const { error } = await supabase
            .from('containers')
            .update(updatedContainer)
            .eq('id', containerId);

        if (error) {
            console.error('Error updating container:', error.message);
            return; // Exit early if there's a database update error
        }

        // Show success animation and redirect
        setShowSuccessAnimation(true);
        setTimeout(() => {
            setShowSuccessAnimation(false);
            router.push('/outbound-container-management');
        }, 700);
    };

    const confirmEmptyContainer = async () => {
        setIsModalVisible(false);
        await saveContainer();
    };

    return (
        <div className="min-h-screen bg-green-50 text-gray-800 flex">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}
            {showSuccessAnimation && <SuccessAnimation />}

            {isModalVisible && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-96 relative">
                        <button
                            onClick={() => setIsModalVisible(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-red-700"
                        >
                            <FaTimes size={20} />
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-center">
                            Are you sure you want to create an empty container?
                        </h2>
                        <p className="text-gray-600 text-center mb-6">
                            Your container has no products in it.
                        </p>
                        <div className="flex justify-between space-x-4">
                            <Button
                                label="Cancel"
                                variant="secondary"
                                onClick={() => setIsModalVisible(false)}
                                className="px-4 py-2 text-sm font-bold bg-gray-100 text-black rounded"
                            />
                            <Button
                                label="Confirm"
                                variant="primary"
                                onClick={confirmEmptyContainer}
                                className="px-4 py-2 text-sm font-bold bg-green-600 text-white rounded"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col">
                <div className="flex-grow bg-green-50 p-12">
                    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-green-700 flex items-center">
                                <FaPencilAlt className="mr-3 text-green-600" />
                                Edit Container
                            </h1>
                            <p className="text-lg font-light text-green-600">
                                Modify container details
                            </p>
                        </div>

                        <form>
                            {/* Status Dropdown */}
                            <FormField label="Status" type="dropdown" required>
                                <select
                                    value={formValues.status}
                                    onChange={(e) =>
                                        setFormValues((prev) => ({
                                            ...prev,
                                            status: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                >
                                    <option value="new">New</option>
                                    <option value="packing">Packing</option>
                                    <option value="sent">Sent</option>
                                    <option value="invoiced">Invoiced</option>
                                </select>
                            </FormField>

                            {/* Product Allocation */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Allocation
                                </label>
                                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                                    <table className="w-full border-collapse relative">
                                        <thead className="sticky top-0 bg-green-700 z-20">
                                            <tr>
                                                <th className="border border-gray-300 px-4 py-2 text-left text-white">
                                                    Product Name
                                                </th>
                                                <th className="border border-gray-300 px-4 py-2 text-left text-white">
                                                    Product ID
                                                </th>
                                                <th className="border border-gray-300 px-4 py-2 text-left text-white">
                                                    Quantity (kg)
                                                </th>
                                                <th className="border border-gray-300 px-4 py-2 text-center text-white">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formValues.productsAllocated
                                                .length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="text-center text-gray-500 py-4"
                                                    >
                                                        No products added
                                                    </td>
                                                </tr>
                                            ) : (
                                                formValues.productsAllocated.map(
                                                    (product, index) => (
                                                        <tr key={index}>
                                                            <td className="p-2">
                                                                <Select
                                                                    options={
                                                                        productOptions
                                                                    }
                                                                    value={productOptions.find(
                                                                        (
                                                                            option
                                                                        ) =>
                                                                            option.value ===
                                                                            product.productId
                                                                    )}
                                                                    onChange={(
                                                                        selectedOption
                                                                    ) =>
                                                                        handleProductChange(
                                                                            index,
                                                                            selectedOption!
                                                                        )
                                                                    }
                                                                    placeholder="Select Product"
                                                                    className="w-full"
                                                                    menuPortalTarget={
                                                                        document.body
                                                                    }
                                                                    styles={{
                                                                        control:
                                                                            (
                                                                                base
                                                                            ) => ({
                                                                                ...base,
                                                                                borderRadius:
                                                                                    '0px',
                                                                            }),
                                                                        menu: (
                                                                            base
                                                                        ) => ({
                                                                            ...base,
                                                                            zIndex: 9999,
                                                                        }),
                                                                        menuPortal:
                                                                            (
                                                                                base
                                                                            ) => ({
                                                                                ...base,
                                                                                zIndex: 9999,
                                                                            }),
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className="p-2">
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        product.productId
                                                                    }
                                                                    disabled
                                                                    className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100"
                                                                />
                                                            </td>
                                                            <td className="p-2">
                                                                <input
                                                                    type="number"
                                                                    value={
                                                                        product.quantity ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const value =
                                                                            parseInt(
                                                                                e
                                                                                    .target
                                                                                    .value ||
                                                                                    '0',
                                                                                10
                                                                            );
                                                                        if (
                                                                            !isNaN(
                                                                                value
                                                                            ) &&
                                                                            value >=
                                                                                0 &&
                                                                            value <=
                                                                                10_000_000
                                                                        ) {
                                                                            handleQuantityChange(
                                                                                index,
                                                                                value
                                                                            );
                                                                        } else if (
                                                                            value >
                                                                            10_000_000
                                                                        ) {
                                                                            console.log(
                                                                                'Quantity cannot exceed 10,000,000.'
                                                                            );
                                                                        } else if (
                                                                            value <
                                                                            0
                                                                        ) {
                                                                            console.log(
                                                                                'Quantity cannot be negative.'
                                                                            );
                                                                        }
                                                                    }}
                                                                    className="w-full border border-gray-300 rounded-lg p-2"
                                                                    placeholder="Enter quantity"
                                                                />
                                                            </td>
                                                            <td className="p-2 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleRemoveProduct(
                                                                            index
                                                                        )
                                                                    }
                                                                    className="text-red-600 hover:text-red-800"
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex justify-center mt-2">
                                    <button
                                        type="button"
                                        onClick={handleAddProduct}
                                        className="w-10 h-10 rounded-full bg-white border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white flex items-center justify-center transition duration-200"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                            </div>

                            {/* Photos Display */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Photos
                                </label>
                                <div
                                    className={`border-2 border-dashed rounded-lg p-4 ${
                                        isDragging
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300'
                                    }`}
                                    onDragEnter={handleDragEnter}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                        ref={fileInputRef}
                                    />
                                    <div className="text-center text-gray-600">
                                        Drag and Drop JPG, JPEG, or PNG files or
                                        click to choose files
                                    </div>
                                </div>

                                {/* Display uploaded photos in a horizontal line */}
                                <div className="flex overflow-x-auto gap-4 mt-4">
                                    {formValues.photos.map((photo, index) => (
                                        <div
                                            key={index}
                                            className="relative group flex-shrink-0"
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                            }}
                                        >
                                            <img
                                                src={photo}
                                                alt={`Photo ${index + 1}`}
                                                className="w-full h-full object-cover rounded-lg cursor-pointer"
                                                onClick={() =>
                                                    handleThumbnailClick(photo)
                                                }
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemovePhoto(
                                                        index,
                                                        'existing'
                                                    )
                                                }
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 group-hover:opacity-100 opacity-75 transition"
                                            >
                                                <FaTimes size={12} />
                                            </button>
                                        </div>
                                    ))}

                                    {formValues.newPhotos.map((file, index) => (
                                        <div
                                            key={`new-${index}`}
                                            className="relative group flex-shrink-0"
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                            }}
                                        >
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`New Photo ${index + 1}`}
                                                className="w-full h-full object-cover rounded-lg cursor-pointer"
                                                onClick={() =>
                                                    handleThumbnailClick(
                                                        URL.createObjectURL(
                                                            file
                                                        )
                                                    )
                                                }
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemovePhoto(
                                                        index,
                                                        'new'
                                                    )
                                                }
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 group-hover:opacity-100 opacity-75 transition"
                                            >
                                                <FaTimes size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {photoError && (
                                    <div className="text-sm text-red-500 mt-2">
                                        {photoError}
                                    </div>
                                )}
                            </div>

                            {/* Enlarged Photo Modal */}
                            {enlargedPhoto && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                    <div className="relative bg-white rounded-lg p-4 shadow-lg">
                                        <button
                                            onClick={handleCloseEnlargedPhoto}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2"
                                        >
                                            <FaTimes size={20} />
                                        </button>
                                        <img
                                            src={enlargedPhoto}
                                            alt="Enlarged Photo"
                                            className="max-w-full max-h-[90vh] rounded"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between mt-8">
                                <Button
                                    label="Cancel"
                                    variant="secondary"
                                    onClick={() =>
                                        router.push(
                                            '/outbound-container-management'
                                        )
                                    }
                                    className="px-4 py-2 text-sm font-bold bg-gray-100 text-black rounded hover:bg-gray-200"
                                />
                                <Button
                                    label="Save Changes"
                                    variant="primary"
                                    onClick={handleSubmit}
                                    disabled={!isFormValid()}
                                    className="px-4 py-2 text-sm font-bold bg-green-600 text-white rounded hover:bg-green-500"
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
