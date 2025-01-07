// import React, { useState, useEffect } from 'react';
// import Select from 'react-select';
// import FormField from '@/components/FormField';
// import Button from '@/components/Button';
// import { createClient } from '@/utils/supabase/client'; // Import your custom Supabase client
// import { useRouter } from 'next/navigation';

// const LoggingForm: React.FC = () => {
//     const router = useRouter();
//     const [formValues, setFormValues] = useState({
//         product: '',
//         provider: '',
//         quantity: '',
//         arrivalDate: '',
//         invoiceRequired: false,
//     });

//     interface Product {
//         id: number;
//         product_name: string;
//     }

//     interface Provider {
//         id: number;
//         company_name: string;
//     }

//     const [products, setProducts] = useState<Product[]>([]);
//     const [providers, setProviders] = useState<Provider[]>([]);

//     const [isClient, setIsClient] = useState(false); // Add this state to track client-side rendering

//     const supabase = createClient(); // Create Supabase client instance

//     useEffect(() => {
//         setIsClient(true); // Set to true when the component is mounted on the client

//         // Fetch products from Supabase
//         const fetchProducts = async () => {
//             const { data, error } = await supabase
//                 .from('products') // Your products table
//                 .select('id, product_name'); // Adjust field names

//             if (error) {
//                 console.error('Error fetching products:', error);
//             } else {
//                 setProducts(data);
//             }
//         };

//         // Fetch providers from Supabase
//         const fetchProviders = async () => {
//             const { data, error } = await supabase
//                 .from('customers') // Your customers table
//                 .select('id, company_name'); // Adjust field names

//             if (error) {
//                 console.error('Error fetching providers:', error);
//             } else {
//                 setProviders(data);
//             }
//         };

//         fetchProducts();
//         fetchProviders();
//     }, [supabase]);

//     const handleInputChange = (field: string, value: string | boolean) => {
//         setFormValues((prev) => ({ ...prev, [field]: value }));
//     };

//     const isFormValid = () =>
//         formValues.product.trim() !== '' &&
//         formValues.provider.trim() !== '' &&
//         formValues.quantity.trim() !== '' &&
//         formValues.arrivalDate.trim() !== '';

//         const handleSubmit = async () => {
//             if (!isFormValid()) return;

//             const { product, provider, quantity, arrivalDate, invoiceRequired } = formValues;

//             const { data, error } = await supabase
//                 .from('inbound_product_logging')
//                 .insert([
//                     {
//                         product_id: product, // Foreign key to the product
//                         provider_id: provider, // Foreign key to the provider (customer)
//                         quantity_received: parseFloat(quantity), // Convert quantity to numeric value
//                         invoice_required: invoiceRequired,
//                         // status: 'logged', // Default status is 'logged'
//                         created_at: arrivalDate, // Set the created_at timestamp to the arrival date
//                         pickup_id: null,
//                     },
//                 ]);

//             if (error) {
//                 console.error('Error inserting log:', error.message);  // Log the error message
//                 console.error('Error details:', error.details);  // Log additional details, if available
//                 console.error('Error code:', error.code);  // Log error code for better diagnostics
//             } else {
//                 // alert('Log saved successfully!');
//                 // console.log('Log saved successfully:', data);
//                 router.push('/inventory-list');
//             }
//         };

//     // Function to handle setting today's date
//     const handleSetTodayDate = () => {
//         const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
//         setFormValues((prev) => ({ ...prev, arrivalDate: today }));
//     };

//     if (!isClient) {
//         return null; // Prevent rendering the component until it's mounted on the client
//     }

//     return (
//         <form>
//             {/* Product Dropdown */}
//             <FormField
//                 label="Select Product"
//                 type="dropdown"
//                 placeholder="Search and select a product"
//                 required
//             >
//                 <Select
//                     options={products.map((product) => ({
//                         value: product.id,
//                         label: product.product_name,
//                     }))}
//                     onChange={(selectedOption) =>
//                         handleInputChange('product', selectedOption?.value || '')
//                     }
//                     placeholder="Search for a product"
//                     isSearchable
//                     required
//                 />
//             </FormField>

//             {/* Provider Dropdown */}
//             <FormField
//                 label="Select Provider"
//                 type="dropdown"
//                 placeholder="Search and select a provider"
//                 required
//             >
//                 <Select
//                     options={providers.map((provider) => ({
//                         value: provider.id,
//                         label: provider.company_name,
//                     }))}
//                     onChange={(selectedOption) =>
//                         handleInputChange('provider', selectedOption?.value || '')
//                     }
//                     placeholder="Search for a provider"
//                     isSearchable
//                     required
//                 />
//             </FormField>

//             {/* Quantity Input */}
//             {/* <FormField
//                 label="Quantity Received (kg)"
//                 type="number"
//                 placeholder="Enter quantity"
//                 required
//                 value={formValues.quantity}
//                 onChange={(e) => handleInputChange('quantity', e.target.value)}
//             /> */}

//             <FormField
//                 label="Quantity Received (kg)"
//                 type="number"
//                 placeholder="Enter quantity"
//                 required
//                 value={formValues.quantity}
//                 onChange={(e) => {
//                     const value = e.target.value;
//                     // Allow only positive numbers
//                     if (!value || parseFloat(value) > 0) {
//                         handleInputChange("quantity", value);
//                     }
//                 }}
//             />

//             {/* Date of Arrival and Invoice Required Checkbox */}
//             <div className="flex items-center justify-between space-x-2 mt-2">
//                 <div className="flex items-center space-x-2">
//                     {/* Date of Arrival */}
//                     <FormField
//                         label="Date of Arrival"
//                         type="date"
//                         placeholder="Select date"
//                         required
//                         value={formValues.arrivalDate}
//                         onChange={(e) =>
//                             handleInputChange('arrivalDate', e.target.value)
//                         }
//                     />
//                     <Button
//                         label="Today"
//                         variant="secondary"
//                         onClick={handleSetTodayDate} // Set today's date
//                     />
//                 </div>

//                 {/* Invoice Required Checkbox */}
//                 <div className="flex items-center gap-3 mt-2 ml-0">
//                     <label className="text-lg font-medium text-gray-700">
//                         Invoice Required
//                     </label>
//                     <input
//                         type="checkbox"
//                         checked={formValues.invoiceRequired}
//                         onChange={(e) =>
//                             handleInputChange('invoiceRequired', e.target.checked)
//                         }
//                     />
//                 </div>
//             </div>

//             <div className="flex justify-between mt-8">
//                 {/* <Button
//                     label="Cancel"
//                     variant="secondary"
//                     onClick={() => console.log('Cancel clicked')}
//                 /> */}
//                 <Button
//                     label="Cancel"
//                     variant="secondary"
//                     onClick={() =>
//                         router.push('/inventory-list')
//                     }
//                 />
//                 <Button
//                     label="Save Log"
//                     variant="primary"
//                     onClick={handleSubmit}
//                     disabled={!isFormValid()}
//                 />
//             </div>
//         </form>
//     );
// };

// export default LoggingForm;

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const LoggingForm: React.FC = () => {
    const router = useRouter();
    const [formValues, setFormValues] = useState({
        product: '',
        provider: '',
        quantity: '',
        arrivalDate: '',
        invoiceRequired: false,
    });
    const [quantityError, setQuantityError] = useState(''); // Track quantity error message

    interface Product {
        id: number;
        product_name: string;
    }

    interface Provider {
        id: number;
        company_name: string;
    }

    const [products, setProducts] = useState<Product[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [isClient, setIsClient] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        setIsClient(true);
        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('id, product_name');
            if (error) console.error('Error fetching products:', error);
            else setProducts(data);
        };
        const fetchProviders = async () => {
            const { data, error } = await supabase
                .from('customers')
                .select('id, company_name');
            if (error) console.error('Error fetching providers:', error);
            else setProviders(data);
        };
        fetchProducts();
        fetchProviders();
    }, [supabase]);

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    const isFormValid = () =>
        formValues.product.trim() !== '' &&
        formValues.provider.trim() !== '' &&
        formValues.quantity.trim() !== '' &&
        formValues.arrivalDate.trim() !== '' &&
        !quantityError; // Ensure no quantity error exists

    const handleQuantityChange = (value: string) => {
        const numericValue = parseFloat(value);
        if (!value || (numericValue > 0 && numericValue <= 9999999)) {
            setQuantityError('');
            handleInputChange('quantity', value);
        } else {
            setQuantityError('Only values between 1 and 9999999 are allowed.');
        }
    };

    const handleSubmit = async () => {
        if (!isFormValid()) return;
        const { product, provider, quantity, arrivalDate, invoiceRequired } =
            formValues;

        const { data, error } = await supabase
            .from('inbound_product_logging')
            .insert([
                {
                    product_id: product,
                    provider_id: provider,
                    quantity_received: parseFloat(quantity),
                    invoice_required: invoiceRequired,
                    created_at: arrivalDate,
                    pickup_id: null,
                },
            ]);

        if (error) {
            console.error('Error inserting log:', error.message);
        } else {
            router.push('/inventory-list');
        }
    };

    const handleSetTodayDate = () => {
        const today = new Date().toISOString().split('T')[0];
        setFormValues((prev) => ({ ...prev, arrivalDate: today }));
    };

    if (!isClient) return null;

    return (
        <form>
            {/* Product Dropdown */}
            <FormField
                label="Select Product"
                type="dropdown"
                placeholder="Search and select a product"
                required
            >
                <Select
                    options={products.map((product) => ({
                        value: product.id,
                        label: product.product_name,
                    }))}
                    onChange={(selectedOption) =>
                        handleInputChange(
                            'product',
                            selectedOption?.value || ''
                        )
                    }
                    placeholder="Search for a product"
                    isSearchable
                    required
                />
            </FormField>

            {/* Provider Dropdown */}
            <FormField
                label="Select Provider"
                type="dropdown"
                placeholder="Search and select a provider"
                required
            >
                <Select
                    options={providers.map((provider) => ({
                        value: provider.id,
                        label: provider.company_name,
                    }))}
                    onChange={(selectedOption) =>
                        handleInputChange(
                            'provider',
                            selectedOption?.value || ''
                        )
                    }
                    placeholder="Search for a provider"
                    isSearchable
                    required
                />
            </FormField>

            {/* Quantity Input */}
            <FormField
                label="Quantity Received (kg)"
                type="number"
                placeholder="Enter quantity"
                required
                value={formValues.quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
            />
            {quantityError && (
                <p className="text-red-500 text-sm mt-1">{quantityError}</p>
            )}

            {/* Date of Arrival and Invoice Required Checkbox */}
            <div className="flex items-center justify-between space-x-2 mt-2">
                <div className="flex items-center space-x-2">
                    <FormField
                        label="Date of Arrival"
                        type="date"
                        placeholder="Select date"
                        required
                        value={formValues.arrivalDate}
                        onChange={(e) =>
                            handleInputChange('arrivalDate', e.target.value)
                        }
                    />
                    <Button
                        label="Today"
                        variant="secondary"
                        onClick={handleSetTodayDate}
                    />
                </div>
                <div className="flex items-center gap-3 mt-2 ml-0">
                    <label className="text-lg font-medium text-gray-700">
                        Invoice Required
                    </label>
                    <input
                        type="checkbox"
                        checked={formValues.invoiceRequired}
                        onChange={(e) =>
                            handleInputChange(
                                'invoiceRequired',
                                e.target.checked
                            )
                        }
                    />
                </div>
            </div>

            <div className="flex justify-between mt-8">
                <Button
                    label="Cancel"
                    variant="secondary"
                    onClick={() => router.push('/inventory-list')}
                />
                <Button
                    label="Save Log"
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={!isFormValid()}
                />
            </div>
        </form>
    );
};

export default LoggingForm;
