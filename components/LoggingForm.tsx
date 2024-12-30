import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import { createClient } from '@/utils/supabase/client'; // Import your custom Supabase client

const LoggingForm: React.FC = () => {
    const [formValues, setFormValues] = useState({
        product: '',
        provider: '',
        quantity: '',
        arrivalDate: '',
        invoiceRequired: false,
    });

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

    // const [products, setProducts] = useState<any[]>([]);
    // const [providers, setProviders] = useState<any[]>([]);
    const [isClient, setIsClient] = useState(false); // Add this state to track client-side rendering

    const supabase = createClient(); // Create Supabase client instance

    useEffect(() => {
        setIsClient(true); // Set to true when the component is mounted on the client

        // Fetch products from Supabase
        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from('products') // Your products table
                .select('id, product_name'); // Adjust field names

            if (error) {
                console.error('Error fetching products:', error);
            } else {
                setProducts(data);
            }
        };

        // Fetch providers from Supabase
        const fetchProviders = async () => {
            const { data, error } = await supabase
                .from('customers') // Your customers table
                .select('id, company_name'); // Adjust field names

            if (error) {
                console.error('Error fetching providers:', error);
            } else {
                setProviders(data);
            }
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
        formValues.arrivalDate.trim() !== '';

    const handleSubmit = () => {
        // Submit form to Supabase
        console.log('Form Submitted:', formValues);
    };

    // Function to handle setting today's date
    const handleSetTodayDate = () => {
        const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
        setFormValues((prev) => ({ ...prev, arrivalDate: today }));
    };

    if (!isClient) {
        return null; // Prevent rendering the component until it's mounted on the client
    }

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
                onChange={(e) => handleInputChange('quantity', e.target.value)}
            />

            {/* Date of Arrival and Invoice Required Checkbox */}
            <div className="flex items-center justify-between space-x-2 mt-2">
                <div className="flex items-center space-x-2">
                    {/* Date of Arrival */}
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
                        onClick={handleSetTodayDate} // Set today's date
                    />
                </div>

                {/* Invoice Required Checkbox */}
                <div className="flex items-center gap-3 mt-2 ml-0">
                    <label className="text-lg font-medium text-gray-700">
                        Invoice Required
                    </label>
                    <input
                        type="checkbox"
                        // className="mt-2"
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
                    onClick={() => console.log('Cancel clicked')}
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
