// 'use client';

// import React, { useState, useEffect } from 'react';
// import { createClient } from '@/utils/supabase/client';
// import SidebarSmall from '@/components/Sidebar/SidebarSmall';
// import Sidebar from '@/components/Sidebar/Sidebar';
// import { useSidebar } from '@/components/Sidebar/SidebarContext';
// import FormField from '@/components/FormField';
// import Button from '@/components/Button';
// import { FaPlus, FaTimes } from 'react-icons/fa';

// interface ProductAllocation {
//     productId: string;
//     quantity: number;
//     productName: string; // Add productName to the product allocation type
// }

// interface FormValues {
//     status: string;
//     productsAllocated: ProductAllocation[];
//     photos: File[];
// }

// export default function AddContainerPage() {
//     const { isSidebarOpen } = useSidebar();

//     const [formValues, setFormValues] = useState<FormValues>({
//         status: 'new',
//         productsAllocated: [],
//         photos: [],
//     });

//     // Fetch product name based on entered productId
//     const fetchProductName = async (productId: string) => {
//         if (!productId) return;

//         const supabase = createClient();
//         const { data, error } = await supabase
//             .from('Products')
//             .select('product_name')
//             .eq('id', productId)
//             .single(); // Get a single product based on ID

//         if (error) {
//             console.error('Error fetching product:', error.message);
//             return;
//         }

//         if (data) {
//             // Update the productName in the corresponding product allocation
//             setFormValues((prev) => {
//                 const updatedProducts = [...prev.productsAllocated];
//                 updatedProducts.forEach((product, index) => {
//                     if (product.productId === productId) {
//                         updatedProducts[index] = {
//                             ...product,
//                             productName: data.product_name,
//                         };
//                     }
//                 });
//                 return { ...prev, productsAllocated: updatedProducts };
//             });
//         }
//     };

//     const handleInputChange = (
//         field: string,
//         value: string | boolean | number
//     ) => {
//         setFormValues((prev) => ({ ...prev, [field]: value }));
//     };

//     const handlePhotoUpload = (files: FileList | null) => {
//         if (files) {
//             setFormValues((prev) => ({
//                 ...prev,
//                 photos: [...prev.photos, ...Array.from(files)],
//             }));
//         }
//     };

//     const handleRemovePhoto = (index: number) => {
//         setFormValues((prev) => {
//             const updatedPhotos = [...prev.photos];
//             updatedPhotos.splice(index, 1);
//             return { ...prev, photos: updatedPhotos };
//         });
//     };

//     const handleRemoveAllPhotos = () => {
//         setFormValues((prev) => ({ ...prev, photos: [] }));
//     };

//     const handleAddProduct = () => {
//         setFormValues((prev) => ({
//             ...prev,
//             productsAllocated: [
//                 ...prev.productsAllocated,
//                 { productId: '', quantity: 0, productName: '' },
//             ],
//         }));
//     };

//     const handleProductChange = (
//         index: number,
//         field: 'productId' | 'quantity',
//         value: string | number
//     ) => {
//         setFormValues((prev) => {
//             const updatedProducts = [...prev.productsAllocated];
//             updatedProducts[index] = {
//                 ...updatedProducts[index],
//                 [field]: value,
//             };

//             // If the productId is updated, fetch the product name
//             if (field === 'productId') {
//                 fetchProductName(value.toString());
//             }

//             return { ...prev, productsAllocated: updatedProducts };
//         });
//     };

//     const handleRemoveProduct = (index: number) => {
//         setFormValues((prev) => {
//             const updatedProducts = [...prev.productsAllocated];
//             updatedProducts.splice(index, 1);
//             return { ...prev, productsAllocated: updatedProducts };
//         });
//     };

//     const isFormValid = () => formValues.status.trim() !== '';

//     const handleSubmit = () => {
//         console.log('Container Data:', formValues);
//     };

//     return (
//         <div className="min-h-screen bg-green-50 text-gray-800 flex">
//             {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}

//             <div className="flex-1 flex flex-col">
//                 <div className="flex-grow bg-green-50 p-12">
//                     <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
//                         <div className="mb-8">
//                             <h1 className="text-3xl font-bold text-green-700 flex items-center">
//                                 <FaPlus className="mr-3 text-green-600" />
//                                 Add Container
//                             </h1>
//                             <p className="text-lg font-light text-green-600">
//                                 Create a new container
//                             </p>
//                         </div>

//                         <form>
//                             {/* Status Dropdown */}
//                             <FormField label="Status" type="dropdown" required>
//                                 <select
//                                     value={formValues.status}
//                                     onChange={(e) =>
//                                         handleInputChange(
//                                             'status',
//                                             e.target.value
//                                         )
//                                     }
//                                     className="w-full border border-gray-300 rounded-lg p-2"
//                                 >
//                                     <option value="new">New</option>
//                                     <option value="packing">Packing</option>
//                                     <option value="sent">Sent</option>
//                                     <option value="invoiced">Invoiced</option>
//                                 </select>
//                             </FormField>

//                             {/* Products Allocated */}
//                             <div className="mt-6">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Product Allocation
//                                 </label>
//                                 {formValues.productsAllocated.map(
//                                     (product, index) => (
//                                         <div
//                                             key={index}
//                                             className="flex items-center space-x-4 mb-4"
//                                         >
//                                             <FormField
//                                                 label="Product ID"
//                                                 type="text"
//                                                 placeholder="Enter Product ID"
//                                                 required
//                                                 value={product.productId}
//                                                 onChange={(e) =>
//                                                     handleProductChange(
//                                                         index,
//                                                         'productId',
//                                                         e.target.value
//                                                     )
//                                                 }
//                                             />
//                                             <FormField
//                                                 label="Product Name"
//                                                 type="text"
//                                                 value={product.productName}
//                                             />
//                                             <FormField
//                                                 label="Quantity (kg)"
//                                                 type="number"
//                                                 placeholder="Enter Quantity"
//                                                 required
//                                                 value={product.quantity}
//                                                 onChange={(e) =>
//                                                     handleProductChange(
//                                                         index,
//                                                         'quantity',
//                                                         parseInt(
//                                                             e.target.value ||
//                                                                 '0',
//                                                             10
//                                                         )
//                                                     )
//                                                 }
//                                             />
//                                             <Button
//                                                 label="Remove"
//                                                 variant="secondary"
//                                                 onClick={() =>
//                                                     handleRemoveProduct(index)
//                                                 }
//                                             />
//                                         </div>
//                                     )
//                                 )}
//                                 <Button
//                                     label="Add Product"
//                                     variant="secondary"
//                                     onClick={handleAddProduct}
//                                 />
//                             </div>

//                             {/* Photo Upload */}
//                             <div className="mt-6">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Upload Photos
//                                 </label>
//                                 <input
//                                     type="file"
//                                     multiple
//                                     accept="image/*"
//                                     onChange={(e) =>
//                                         handlePhotoUpload(e.target.files)
//                                     }
//                                     className="w-full border border-gray-300 rounded-lg p-2"
//                                 />
//                             </div>

//                             <div className="mt-4">
//                                 {formValues.photos.length > 0 && (
//                                     <div>
//                                         {formValues.photos.map(
//                                             (file, index) => (
//                                                 <div
//                                                     key={index}
//                                                     className="flex items-center space-x-2"
//                                                 >
//                                                     <span>{file.name}</span>
//                                                     <button
//                                                         type="button"
//                                                         onClick={() =>
//                                                             handleRemovePhoto(
//                                                                 index
//                                                             )
//                                                         }
//                                                         className="text-red-500"
//                                                     >
//                                                         <FaTimes />
//                                                     </button>
//                                                 </div>
//                                             )
//                                         )}
//                                     </div>
//                                 )}
//                                 {formValues.photos.length === 0 && (
//                                     <p>No files chosen</p>
//                                 )}
//                             </div>

//                             <div className="mt-4">
//                                 <Button
//                                     label="Delete All Photos"
//                                     variant="secondary"
//                                     onClick={handleRemoveAllPhotos}
//                                     disabled={formValues.photos.length === 0}
//                                 />
//                             </div>

//                             <div className="flex justify-between mt-8">
//                                 <Button
//                                     label="Cancel"
//                                     variant="secondary"
//                                     onClick={() =>
//                                         console.log('Cancel clicked')
//                                     }
//                                 />
//                                 <Button
//                                     label="Save Container"
//                                     variant="primary"
//                                     onClick={handleSubmit}
//                                     disabled={!isFormValid()}
//                                 />
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import SidebarSmall from '@/components/Sidebar/SidebarSmall';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useSidebar } from '@/components/Sidebar/SidebarContext';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import { FaPlus, FaTimes } from 'react-icons/fa';
import Select from 'react-select';
import { useRouter } from 'next/navigation';

// interface Product {
//     id: string;
//     product_name: string;
// }

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
    // const router = useRouter()

    const [formValues, setFormValues] = useState<FormValues>({
        status: 'new',
        productsAllocated: [],
        photos: [],
    });
    const [productOptions, setProductOptions] = useState<
        { value: string; label: string }[]
    >([]);

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
            const updatedProducts = [...prev.productsAllocated];
            updatedProducts.splice(index, 1);
            return { ...prev, productsAllocated: updatedProducts };
        });
    };

    const handlePhotoUpload = (files: FileList | null) => {
        if (files) {
            setFormValues((prev) => ({
                ...prev,
                photos: [...prev.photos, ...Array.from(files)],
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
    };

    const isFormValid = () =>
        formValues.status.trim() !== '' &&
        formValues.productsAllocated.every(
            (product) => product.productId && product.quantity > 0
        );

    // const handleSubmit = async () => {
    //     const { status, productsAllocated } = formValues;

    //     const newContainer = {
    //         status,
    //         products_allocated: productsAllocated.map((product) => ({
    //             product_id: product.productId,
    //             quantity: product.quantity,
    //         })),
    //         created_at: new Date().toISOString(),
    //         updated_at: new Date().toISOString(),
    //     };

    //     const { error } = await supabase
    //         .from('containers')
    //         .insert(newContainer);

    //     if (error) {
    //         console.error('Error saving container:', error.message);
    //     } else {
    //         console.log('Container saved successfully:', newContainer);
    //     }
    // };

    const handleSubmit = async () => {
        const supabase = createClient(); // Create Supabase client
        const { status, productsAllocated, photos } = formValues;

        // // Ensure the user is authenticated
        // const {
        //     data: { session },
        //     error: sessionError,
        // } = await supabase.auth.getSession();

        // if (sessionError || !session) {
        //     console.error('User is not authenticated or session is missing!');
        //     return;
        // }

        // Upload photos to the Supabase bucket
        const photoUrls: string[] = [];
        for (const photo of photos) {
            // const { data: uploadData, error: uploadError } =
            //     await supabase.storage
            //         .from('container_photos')
            //         .upload(`containers/${photo.name}`, photo);

            const { data: uploadData, error: uploadError } =
                await supabase.storage
                    .from('container_photos')
                    .upload(`${photo.name}`, photo);

            if (uploadError) {
                console.error('Error uploading photo:', uploadError.message);
                return;
            }

            console.log('Uploaded file:', uploadData);

            // // Get the public URL of the uploaded photo
            // const { data: publicUrlData } = supabase.storage
            //     .from('container_photos')
            //     .getPublicUrl(`${photo.name}`);
            // if (publicUrlData) {
            //     photoUrls.push(publicUrlData.publicUrl);
            // }

            // Generate a signed URL with a 1-year expiration
            const { data: signedUrlData, error } = await supabase.storage
                .from('container_photos')
                .createSignedUrl(photo.name, 365 * 24 * 60 * 60); // 1 year in seconds

            if (error) {
                console.error('Error generating signed URL:', error);
            } else if (signedUrlData) {
                photoUrls.push(signedUrlData.signedUrl);
            }
        }

        // Prepare the container data
        const newContainer = {
            status,
            products_allocated: productsAllocated.map((product) => ({
                product_id: product.productId,
                quantity: product.quantity,
            })),
            container_photo: photoUrls.join(','), // Save photo URLs as a comma-separated string
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        // Insert the new container into the database
        const { error: insertError } = await supabase
            .from('containers')
            .insert(newContainer);

        if (insertError) {
            console.error('Error saving container:', insertError.message);
        } else {
            console.log('Container saved successfully:', newContainer);
        }
    };

    // const [isLoading, setIsLoading] = useState(false);

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

                            {/* Products Allocated */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Allocation
                                </label>
                                {formValues.productsAllocated.map(
                                    (product, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-4 mb-4"
                                        >
                                            <FormField label="Product Name">
                                                <Select
                                                    options={productOptions}
                                                    value={productOptions.find(
                                                        (option) =>
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
                                                />
                                            </FormField>
                                            <FormField label="Product ID">
                                                <input
                                                    type="text"
                                                    value={product.productId}
                                                    disabled
                                                    className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100"
                                                />
                                            </FormField>
                                            <FormField
                                                label="Quantity (kg)"
                                                type="number"
                                                value={product.quantity}
                                                onChange={(e) =>
                                                    handleQuantityChange(
                                                        index,
                                                        parseInt(
                                                            e.target.value ||
                                                                '0'
                                                        )
                                                    )
                                                }
                                            />
                                            <Button
                                                label="Remove"
                                                variant="secondary"
                                                onClick={() =>
                                                    handleRemoveProduct(index)
                                                }
                                            />
                                        </div>
                                    )
                                )}
                                <Button
                                    label="Add Product"
                                    variant="secondary"
                                    onClick={handleAddProduct}
                                />
                            </div>

                            {/* Photo Upload */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Photos
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) =>
                                        handlePhotoUpload(e.target.files)
                                    }
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                />
                            </div>

                            <div className="mt-4">
                                {formValues.photos.length > 0 && (
                                    <div>
                                        {formValues.photos.map(
                                            (file, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <span>{file.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemovePhoto(
                                                                index
                                                            )
                                                        }
                                                        className="text-red-500"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                                {formValues.photos.length === 0 && (
                                    <p>No files chosen</p>
                                )}
                            </div>

                            <div className="mt-4">
                                <Button
                                    label="Delete All Photos"
                                    variant="secondary"
                                    onClick={handleRemoveAllPhotos}
                                    disabled={formValues.photos.length === 0}
                                />
                            </div>

                            <div className="flex justify-between mt-8">
                                <Button
                                    label="Cancel"
                                    variant="secondary"
                                    onClick={() =>
                                        console.log('Cancel clicked')
                                    }
                                />
                                <Button
                                    label="Save Container"
                                    variant="primary"
                                    onClick={handleSubmit}
                                    disabled={!isFormValid()}
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
