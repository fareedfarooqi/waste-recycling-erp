// 'use client';

// import React, { useState, useEffect } from 'react';
// import SidebarSmall from '@/components/Sidebar/SidebarSmall';
// import Sidebar from '@/components/Sidebar/Sidebar';
// import { useSidebar } from '@/components/Sidebar/SidebarContext';
// import FormField from '@/components/FormField';
// import Button from '@/components/Button';
// import { FaPencilAlt } from 'react-icons/fa';
// import { createClient } from '@/utils/supabase/client';
// import { useParams, useRouter } from 'next/navigation'; // Import useRouter from next/navigation

// export default function EditProductPage() {
//     const { isSidebarOpen } = useSidebar();
//     const params = useParams(); // Get dynamic route parameters
//     const productId = params.id; // Extract the dynamic product ID

//     const [formValues, setFormValues] = useState({
//         product_name: '',
//         quantity: '',
//         product_description: '',
//         reserved_location: '',
//     });

//     const [initialValues, setInitialValues] = useState({
//         product_name: '',
//         quantity: '',
//         product_description: '',
//         reserved_location: '',
//     });

//     const router = useRouter(); // Initialize router

//     // Fetch product data from Supabase by product id
//     useEffect(() => {
//         const fetchProduct = async () => {
//             const supabase = createClient();
//             const { data, error } = await supabase
//                 .from('products')
//                 .select('*')
//                 .eq('id', productId)
//                 .single(); // Fetch a single record

//             if (data) {
//                 setFormValues({
//                     product_name: data.product_name,
//                     quantity: data.quantity,
//                     product_description: data.product_description,
//                     reserved_location: data.reserved_location,
//                 });
//                 setInitialValues({
//                     product_name: data.product_name,
//                     quantity: data.quantity,
//                     product_description: data.product_description,
//                     reserved_location: data.reserved_location,
//                 });
//             }

//             if (error) {
//                 console.error('Error fetching product:', error);
//             }
//         };

//         if (productId) fetchProduct();
//     }, [productId]);

//     const isFormValid = () =>
//         formValues.product_name.trim() !== '' &&
//         formValues.quantity !== '' &&
//         !isNaN(Number(formValues.quantity));

//     const handleInputChange = (field: string, value: string) => {
//         setFormValues((prev) => ({ ...prev, [field]: value }));
//     };

//     const handleSave = async () => {
//         // Check if the form values have changed compared to initial values
//         if (JSON.stringify(formValues) !== JSON.stringify(initialValues)) {
//             console.log('Saving product:', formValues);
//             const supabase = createClient();
//             const { error } = await supabase
//                 .from('products')
//                 .update({
//                     product_name: formValues.product_name,
//                     quantity: formValues.quantity,
//                     product_description: formValues.product_description,
//                     reserved_location: formValues.reserved_location,
//                 })
//                 .eq('id', productId); // Update the product by ID

//             if (error) {
//                 console.error('Error saving product:', error);
//             } else {
//                 router.push('/inventory-list');
//                 console.log('Product saved successfully');
//             }
//         } else {
//             console.log('No changes made');
//         }
//     };

//     return (
//         <div className="min-h-screen bg-green-50 text-gray-800 flex">
//             {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}

//             {/* Main Content Area */}
//             <div className="flex-1 flex flex-col">
//                 {/* Edit Product Form */}
//                 <div className="flex-grow bg-green-50 p-12">
//                     <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
//                         {/* Header */}
//                         <div className="mb-8">
//                             <h1 className="text-3xl font-bold text-green-700 flex items-center">
//                                 <FaPencilAlt className="mr-3 text-green-600" />
//                                 Edit Product
//                             </h1>
//                             <p className="text-lg font-light text-green-600">
//                                 Edit existing products
//                             </p>
//                         </div>

//                         {/* Form */}
//                         <form>
//                             <FormField
//                                 label="Name"
//                                 type="text"
//                                 placeholder="Enter product name"
//                                 required
//                                 value={formValues.product_name}
//                                 onChange={(e) =>
//                                     handleInputChange(
//                                         'product_name',
//                                         e.target.value
//                                     )
//                                 }
//                             />
//                             {/* <FormField
//                                 label="Quantity (kg)"
//                                 type="number"
//                                 placeholder="Enter quantity"
//                                 required
//                                 value={formValues.quantity}
//                                 onChange={(e) =>
//                                     handleInputChange(
//                                         'quantity',
//                                         e.target.value
//                                     )
//                                 }
//                             /> */}
//                             <FormField
//                                 label="Quantity (kg)"
//                                 type="number"
//                                 placeholder="Enter quantity"
//                                 required
//                                 value={formValues.quantity}
//                                 onChange={(e) => {
//                                     const value = e.target.value;
//                                     // Allow only positive numbers
//                                     if (!value || parseFloat(value) > 0) {
//                                         handleInputChange('quantity', value);
//                                     }
//                                 }}
//                             />
//                             <FormField
//                                 label="Description"
//                                 type="textarea"
//                                 placeholder="Enter product description"
//                                 value={formValues.product_description || ''}
//                                 onChange={(e) =>
//                                     handleInputChange(
//                                         'product_description',
//                                         e.target.value
//                                     )
//                                 }
//                             />

//                             <FormField
//                                 label="Reserved Location"
//                                 type="text"
//                                 placeholder="Enter reserved location"
//                                 value={formValues.reserved_location || ''}
//                                 onChange={(e) =>
//                                     handleInputChange(
//                                         'reserved_location',
//                                         e.target.value
//                                     )
//                                 }
//                             />
//                             <div className="flex justify-between mt-8">
//                                 <Button
//                                     label="Cancel"
//                                     variant="secondary"
//                                     onClick={() =>
//                                         router.push('/inventory-list')
//                                     }
//                                 />
//                                 <Button
//                                     label="Save Product"
//                                     variant="primary"
//                                     onClick={handleSave}
//                                     disabled={
//                                         !isFormValid() ||
//                                         JSON.stringify(formValues) ===
//                                             JSON.stringify(initialValues)
//                                     }
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
import SidebarSmall from '@/components/Sidebar/SidebarSmall';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useSidebar } from '@/components/Sidebar/SidebarContext';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import { FaPencilAlt } from 'react-icons/fa';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { IoMdClose } from 'react-icons/io'; // For the dismiss button
import SuccessAnimation from '@/components/SuccessAnimation'; // Import the animation

export default function EditProductPage() {
    const { isSidebarOpen } = useSidebar();
    const params = useParams();
    const productId = params.id;

    const [formValues, setFormValues] = useState({
        product_name: '',
        quantity: '',
        product_description: '',
        reserved_location: '',
    });

    const [initialValues, setInitialValues] = useState({
        product_name: '',
        quantity: '',
        product_description: '',
        reserved_location: '',
    });

    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false); // Success animation state
    const router = useRouter();

    useEffect(() => {
        const fetchProduct = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (data) {
                setFormValues({
                    product_name: data.product_name,
                    quantity: data.quantity.toString(),
                    product_description: data.product_description || '',
                    reserved_location: data.reserved_location || '',
                });
                setInitialValues({
                    product_name: data.product_name,
                    quantity: data.quantity.toString(),
                    product_description: data.product_description || '',
                    reserved_location: data.reserved_location || '',
                });
            }

            if (error) {
                console.error('Error fetching product:', error);
            }
        };

        if (productId) fetchProduct();
    }, [productId]);

    const isFormValid = () =>
        formValues.product_name.trim() !== '' &&
        formValues.quantity !== '' &&
        !isNaN(Number(formValues.quantity)) &&
        parseFloat(formValues.quantity) > 0;

    const handleInputChange = (field: string, value: string) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        const updatedQuantity = parseFloat(formValues.quantity);

        if (updatedQuantity > 10000000) {
            setError(
                `Cannot edit product. Total quantity (${updatedQuantity.toLocaleString()}) exceeds the limit.`
            );
            return;
        }

        if (JSON.stringify(formValues) !== JSON.stringify(initialValues)) {
            console.log('Saving product:', formValues);
            const supabase = createClient();
            const { error } = await supabase
                .from('products')
                .update({
                    product_name: formValues.product_name,
                    quantity: updatedQuantity,
                    product_description: formValues.product_description,
                    reserved_location: formValues.reserved_location,
                })
                .eq('id', productId);

            if (error) {
                console.error('Error saving product:', error);
            } else {
                // router.push('/inventory-list');
                // console.log('Product saved successfully');
                setShowSuccess(true); // Show success animation
                setTimeout(() => {
                    setShowSuccess(false);
                    router.push('/inventory-list'); // Navigate back
                }, 700);
            }
        } else {
            console.log('No changes made');
        }
    };

    return (
        <div className="min-h-screen bg-green-50 text-gray-800 flex">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}
            {showSuccess && <SuccessAnimation />}{' '}
            {/* Render success animation */}
            <div
                className="flex-1 flex flex-col justify-center"
                style={{ paddingTop: '4%' }}
            >
                <div className="flex-grow bg-green-50 p-12">
                    <div className="max-w-4xl w-full mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-green-700 flex items-center">
                                <FaPencilAlt className="mr-3 text-green-600" />
                                Edit Product
                            </h1>
                            <p className="text-lg font-light text-green-600">
                                Edit existing products
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-2 bg-red-100 border border-red-400 rounded flex justify-between items-center">
                                <p className="text-red-700 text-sm">{error}</p>
                                <button
                                    onClick={() => setError(null)}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    <IoMdClose size={16} />
                                </button>
                            </div>
                        )}

                        <form>
                            <FormField
                                label="Name"
                                type="text"
                                placeholder="Enter product name"
                                required
                                value={formValues.product_name}
                                onChange={(e) =>
                                    handleInputChange(
                                        'product_name',
                                        e.target.value
                                    )
                                }
                            />
                            <FormField
                                label="Quantity (kg)"
                                type="number"
                                placeholder="Enter quantity"
                                required
                                value={formValues.quantity}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (!value || parseFloat(value) > 0) {
                                        handleInputChange('quantity', value);
                                    }
                                }}
                            />
                            <FormField
                                label="Description"
                                type="textarea"
                                placeholder="Enter product description"
                                value={formValues.product_description}
                                onChange={(e) =>
                                    handleInputChange(
                                        'product_description',
                                        e.target.value
                                    )
                                }
                            />
                            <FormField
                                label="Reserved Location"
                                type="text"
                                placeholder="Enter reserved location"
                                value={formValues.reserved_location}
                                onChange={(e) =>
                                    handleInputChange(
                                        'reserved_location',
                                        e.target.value
                                    )
                                }
                            />
                            <div className="flex justify-between mt-8">
                                <Button
                                    label="Cancel"
                                    variant="secondary"
                                    onClick={() =>
                                        router.push('/inventory-list')
                                    }
                                    className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-gray-100 text-black rounded hover:bg-gray-100 transition whitespace-nowrap min-w-[120px] min-h-[50px]"
                                />
                                <Button
                                    label="Save Product"
                                    variant="primary"
                                    onClick={handleSave}
                                    disabled={
                                        !isFormValid() ||
                                        JSON.stringify(formValues) ===
                                            JSON.stringify(initialValues)
                                    }
                                    className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-green-600 text-white rounded hover:bg-green-500 transition whitespace-nowrap min-w-[120px] min-h-[50px]"
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
