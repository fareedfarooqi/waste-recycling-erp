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
import { IoMdClose } from 'react-icons/io';
import SuccessAnimation from '@/components/SuccessAnimation';
import Select from 'react-select';

export default function EditLogPage() {
    const { isSidebarOpen } = useSidebar();
    const params = useParams();
    const logId = params.id;

    const [formValues, setFormValues] = useState({
        product: '',
        provider: '',
        quantity: '',
        arrivalDate: '',
        invoiceRequired: false,
    });

    type Product = {
        value: string;
        label: string;
    };

    type Provider = {
        value: string;
        label: string;
    };

    const [productOptions, setProductOptions] = useState<Product[]>([]);
    const [providerOptions, setProviderOptions] = useState<Provider[]>([]);

    const [initialValues, setInitialValues] = useState({
        product: '',
        provider: '',
        quantity: '',
        arrivalDate: '',
        invoiceRequired: false,
    });

    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchLogData = async () => {
            try {
                // Fetch the log data
                const { data: logData, error: logError } = await supabase
                    .from('inbound_product_logging')
                    .select('*')
                    .eq('id', logId)
                    .single();

                if (logError) {
                    console.error('Error fetching log:', logError);
                    return;
                }

                if (logData) {
                    setFormValues({
                        product: logData.product_id,
                        provider: logData.provider_id,
                        quantity: logData.quantity_received.toString(),
                        arrivalDate: new Date(logData.created_at).toLocaleDateString('en-CA'), // Correct date handling
                        invoiceRequired: logData.invoice_required,
                    });
                    setInitialValues({
                        product: logData.product_id,
                        provider: logData.provider_id,
                        quantity: logData.quantity_received.toString(),
                        arrivalDate: new Date(logData.created_at).toLocaleDateString('en-CA'), // Correct date handling
                        invoiceRequired: logData.invoice_required,
                    });
                }

                // Fetch the products list
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .select('id, product_name');

                if (productError) {
                    console.error('Error fetching products:', productError);
                    return;
                }

                if (productData) {
                    setProductOptions(
                        productData.map((product) => ({
                            value: product.id,
                            label: product.product_name,
                        }))
                    );
                }

                // Fetch the providers list
                const { data: providerData, error: providerError } = await supabase
                    .from('customers')
                    .select('id, company_name');

                if (providerError) {
                    console.error('Error fetching providers:', providerError);
                    return;
                }

                if (providerData) {
                    setProviderOptions(
                        providerData.map((provider) => ({
                            value: provider.id,
                            label: provider.company_name,
                        }))
                    );
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        if (logId) {
            fetchLogData();
        }
    }, [logId]);

    const isFormValid = () =>
        formValues.product &&
        formValues.provider &&
        formValues.quantity &&
        !isNaN(Number(formValues.quantity)) &&
        parseFloat(formValues.quantity) > 0 &&
        JSON.stringify(formValues) !== JSON.stringify(initialValues);

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleSetTodayDate = () => {
        const today = new Date().toISOString().split('T')[0];
        setFormValues((prev) => ({ ...prev, arrivalDate: today }));
    };

    const handleSave = async () => {
        if (!isFormValid()) return;

        const updatedLog = {
            product_id: formValues.product,
            provider_id: formValues.provider,
            quantity_received: parseFloat(formValues.quantity),
            created_at: formValues.arrivalDate,
            invoice_required: formValues.invoiceRequired,
        };

        const { error } = await supabase
            .from('inbound_product_logging')
            .update(updatedLog)
            .eq('id', logId);

        if (error) {
            console.error('Error updating log:', error);
        } else {
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                router.push('/inbound-product-logging');
            }, 700);
        }
    };

    return (
        <div className="min-h-screen bg-green-50 text-gray-800 flex">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}
            {showSuccess && <SuccessAnimation />}
            <div className="flex-1 flex flex-col" style={{ paddingTop: '4%' }}>
                <div className="flex-grow bg-green-50 p-12">
                    <div className="max-w-4xl w-full mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-green-700 flex items-center">
                                <FaPencilAlt className="mr-3 text-green-600" />
                                Edit Log
                            </h1>
                            <p className="text-lg font-light text-green-600">
                                Edit existing logs
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
                                label="Select Product"
                                type="dropdown"
                                placeholder="Search and select a product"
                                required
                            >
                                <Select
                                    options={productOptions}
                                    value={productOptions.find(
                                        (product) => product.value === formValues.product
                                    )}
                                    onChange={(selectedOption) =>
                                        handleInputChange('product', selectedOption?.value || '')
                                    }
                                    placeholder="Search for a product"
                                    isSearchable
                                    required
                                />
                            </FormField>
                            <FormField
                                label="Select Provider"
                                type="dropdown"
                                placeholder="Search and select a provider"
                                required
                            >
                                <Select
                                    options={providerOptions}
                                    value={providerOptions.find(
                                        (provider) => provider.value === formValues.provider
                                    )}
                                    onChange={(selectedOption) =>
                                        handleInputChange('provider', selectedOption?.value || '')
                                    }
                                    placeholder="Search for a provider"
                                    isSearchable
                                    required
                                />
                            </FormField>
                            <FormField
                                label="Quantity Received (kg)"
                                type="number"
                                required
                                value={formValues.quantity}
                                onChange={(e) =>
                                    handleInputChange('quantity', e.target.value)
                                }
                            />
                            <div className="flex items-center justify-around space-x-2 mt-2">
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
                                        className="flex items-center justify-center px-2 py-1 text-sm font-bold bg-gray-100 text-black rounded hover:bg-gray-100 min-w-[100px] min-h-[40px]"
                                    />
                                </div>
                                <div className="flex items-center gap-3 mt-1 ml-0">
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
                                    onClick={() =>
                                        router.push('/inbound-product-logging')
                                    }
                                    className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-gray-100 text-black rounded hover:bg-gray-100 transition whitespace-nowrap min-w-[120px] min-h-[50px]"
                                />
                                <Button
                                    label="Save Log"
                                    variant="primary"
                                    onClick={handleSave}
                                    disabled={!isFormValid()}
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
