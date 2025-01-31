'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import SidebarSmall from '@/components/Sidebar/SidebarSmall';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useSidebar } from '@/components/Sidebar/SidebarContext';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import { FaPlus, FaTimes } from 'react-icons/fa';
import Select from 'react-select';
import { useRouter } from 'next/navigation';
import SuccessAnimation from '@/components/SuccessAnimation';

interface ProductAllocation {
    productId: string;
    quantity: number;
    productName: string;
}

interface FormValues {
    status: string;
    productsAllocated: ProductAllocation[];
    photos: File[];
}

export default function AddContainerPage() {
    const { isSidebarOpen } = useSidebar();
    const supabase = createClient();
    const router = useRouter();

    const [formValues, setFormValues] = useState<FormValues>({
        status: 'new',
        productsAllocated: [],
        photos: [],
    });
    const [productOptions, setProductOptions] = useState<
        { value: string; label: string }[]
    >([]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

    // Fetch products on component mount
    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('id, product_name');

            if (error) {
                console.error('Error fetching products:', error.message);
                return;
            }

            if (data) {
                setProductOptions(
                    data.map((product) => ({
                        value: product.id,
                        label: product.product_name,
                    }))
                );
            }
        };

        fetchProducts();
    }, [supabase]);

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
        setFormValues((prev) => {
            // Create a new array without the removed product
            const updatedProducts = prev.productsAllocated.filter(
                (_, productIndex) => productIndex !== index
            );
            // Return the updated state
            return { ...prev, productsAllocated: updatedProducts };
        });
    };

    // const handlePhotoUpload = (files: FileList | null) => {
    //     if (files) {
    //         setFormValues((prev) => ({
    //             ...prev,
    //             photos: [...prev.photos, ...Array.from(files)],
    //         }));
    //     }
    // };

    const [isDragging, setIsDragging] = useState(false);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                photos: [...prev.photos, ...validFiles],
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
                photos: [...prev.photos, ...validFiles],
            }));
        }
    };

    const handleRemovePhoto = (index: number) => {
        setFormValues((prev) => {
            const updatedPhotos = [...prev.photos];
            updatedPhotos.splice(index, 1);
            return { ...prev, photos: updatedPhotos };
        });
    };

    const handleRemoveAllPhotos = () => {
        setFormValues((prev) => ({ ...prev, photos: [] }));
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset the file input
        }
    };

    const isFormValid = () =>
        formValues.status.trim() !== '' &&
        formValues.productsAllocated.every(
            (product) => product.productId && product.quantity > 0
        );

    const handleSubmit = async () => {
        if (formValues.productsAllocated.length === 0) {
            setIsModalVisible(true);
            return;
        }

        await saveContainer();
    };

    // WORKS FOR CONTAINER_PHOTO BEING A TEXT FIELD
    // const saveContainer = async () => {
    //     const supabase = createClient();
    //     const { status, productsAllocated, photos } = formValues;

    //     const photoUrls: string[] = [];
    //     for (const photo of photos) {
    //         const { error: uploadError } = await supabase.storage
    //             .from('container_photos')
    //             .upload(photo.name, photo, { upsert: false }); // Prevent overwriting existing files

    //         if (uploadError) {
    //             // Check if the error is due to the photo already existing
    //             if (
    //                 uploadError.message.includes('The resource already exists')
    //             ) {
    //                 // console.error('Error: Photo already exists in the bucket.');
    //                 alert(
    //                     `The photo "${photo.name}" has already been uploaded.`
    //                 );
    //             } else {
    //                 // console.error('Error uploading photo:', uploadError.message);
    //                 alert(
    //                     `Error uploading photo "${photo.name}": ${uploadError.message}`
    //                 );
    //             }
    //             return; // Stop the function execution
    //         }

    //         const { data: signedUrlData, error: signedUrlError } =
    //             await supabase.storage
    //                 .from('container_photos')
    //                 .createSignedUrl(photo.name, 365 * 24 * 60 * 60);

    //         if (signedUrlError) {
    //             console.error(
    //                 'Error creating signed URL:',
    //                 signedUrlError.message
    //             );
    //             alert(
    //                 `Error creating signed URL for "${photo.name}": ${signedUrlError.message}`
    //             );
    //             return; // Stop the function execution
    //         }

    //         if (signedUrlData) {
    //             photoUrls.push(signedUrlData.signedUrl);
    //         }
    //     }

    //     const newContainer = {
    //         status,
    //         products_allocated: productsAllocated.map((product) => ({
    //             product_id: product.productId,
    //             quantity: product.quantity,
    //         })),
    //         container_photo: photoUrls.join(','),
    //         created_at: new Date().toISOString(),
    //         updated_at: new Date().toISOString(),
    //     };

    //     const { error: insertError } = await supabase
    //         .from('containers')
    //         .insert(newContainer);

    //     if (insertError) {
    //         console.error('Error saving container:', insertError.message);
    //         alert(`Error saving container: ${insertError.message}`);
    //     } else {
    //         setShowSuccessAnimation(true);
    //         setTimeout(() => {
    //             setShowSuccessAnimation(false);
    //             router.push('/outbound-container-management');
    //         }, 700);
    //     }
    // };

    const saveContainer = async () => {
        const { status, productsAllocated, photos } = formValues;

        const photoUrls: string[] = [];
        for (const photo of photos) {
            const { error: uploadError } = await supabase.storage
                .from('container_photos')
                .upload(`containers/${photo.name}`, photo, { upsert: false });

            if (uploadError) {
                if (
                    uploadError.message.includes('The resource already exists')
                ) {
                    alert(
                        `The photo "${photo.name}" has already been uploaded.`
                    );
                } else {
                    alert(
                        `Error uploading photo "${photo.name}": ${uploadError.message}`
                    );
                }
                return;
            }

            const { data: signedUrlData, error: signedUrlError } =
                await supabase.storage
                    .from('container_photos')
                    .createSignedUrl(
                        `containers/${photo.name}`,
                        365 * 24 * 60 * 60
                    );

            if (signedUrlError) {
                alert(
                    `Error creating signed URL for "${photo.name}": ${signedUrlError.message}`
                );
                return;
            }

            if (signedUrlData) {
                photoUrls.push(signedUrlData.signedUrl);
            }
        }

        const newContainer = {
            status,
            products_allocated: productsAllocated.map((product) => ({
                product_id: product.productId,
                quantity: product.quantity,
            })),
            container_photo: photoUrls, // Save as a JSON array
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
            .from('containers')
            .insert(newContainer);

        if (insertError) {
            alert(`Error saving container: ${insertError.message}`);
        } else {
            setShowSuccessAnimation(true);
            setTimeout(() => {
                setShowSuccessAnimation(false);
                router.push('/outbound-container-management');
            }, 700);
        }
    };

    const confirmEmptyContainer = async () => {
        setIsModalVisible(false);
        await saveContainer();
    };

    return (
        <div className="min-h-screen bg-green-50 text-gray-800 flex">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}

            <div className="flex-1 flex flex-col">
                <div className="flex-grow bg-green-50 p-12">
                    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-green-700 flex items-center">
                                <FaPlus className="mr-3 text-green-600" />
                                Add Container
                            </h1>
                            <p className="text-lg font-light text-green-600">
                                Create a new container
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
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between items-center">
                                    Product Allocation
                                    {formValues.productsAllocated.length >
                                        0 && (
                                        <button
                                            onClick={() =>
                                                setFormValues((prev) => ({
                                                    ...prev,
                                                    productsAllocated: [],
                                                }))
                                            }
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            Remove All
                                        </button>
                                    )}
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
                                                                    title="Remove"
                                                                >
                                                                    <FaTimes
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
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
                                        aria-label="Add Product"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                            </div>

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

                                {formValues.photos.length > 0 && (
                                    <div className="mt-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="font-semibold">
                                                Selected Files:
                                            </p>
                                            <button
                                                onClick={handleRemoveAllPhotos}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Remove All
                                            </button>
                                        </div>
                                        <div className="max-h-40 overflow-y-auto">
                                            <ul className="list-none">
                                                {formValues.photos.map(
                                                    (file, index) => (
                                                        <li
                                                            key={index}
                                                            className="flex justify-between items-center mb-1"
                                                        >
                                                            <span className="text-sm text-gray-600">
                                                                {file.name}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRemovePhoto(
                                                                        index
                                                                    )
                                                                }
                                                                className="text-red-500 hover:text-red-700 text-sm"
                                                            >
                                                                Remove
                                                            </button>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {photoError && (
                                    <div className="mt-2 text-sm text-red-500">
                                        {photoError}{' '}
                                        <button
                                            onClick={() => setPhotoError(null)}
                                            className="text-blue-500 hover:underline"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between mt-8">
                                <Button
                                    label="Cancel"
                                    variant="secondary"
                                    onClick={() =>
                                        router.push(
                                            '/outbound-container-management'
                                        )
                                    }
                                    className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-gray-100 text-black rounded hover:bg-gray-100 transition whitespace-nowrap min-w-[120px] min-h-[50px]"
                                />
                                <Button
                                    label="Save Container"
                                    variant="primary"
                                    onClick={handleSubmit}
                                    disabled={!isFormValid()}
                                    className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-green-600 text-white rounded hover:bg-green-500 transition whitespace-nowrap min-w-[120px] min-h-[50px]"
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>

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
                                className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-gray-100 text-black rounded hover:bg-gray-100 transition whitespace-nowrap min-w-[120px] min-h-[50px]"
                            />
                            <Button
                                label="Confirm"
                                variant="primary"
                                onClick={confirmEmptyContainer}
                                className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-green-600 text-white rounded hover:bg-green-500 transition whitespace-nowrap min-w-[120px] min-h-[50px]"
                            />
                        </div>
                    </div>
                </div>
            )}
            {showSuccessAnimation && <SuccessAnimation />}
        </div>
    );
}
