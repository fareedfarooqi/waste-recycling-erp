'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/config/supabaseClient';
import SuccessAnimation from '@/components/SuccessAnimation';
import SidebarSmall from '@/components/Sidebar/SidebarSmall';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useSidebar } from '@/components/Sidebar/SidebarContext';
import FormField from '@/components/FormField';
import { FaPlus } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

// Add Driver type
type Driver = {
    id: string;
    name: string;
    contact_details: string;
};

interface PickupLocation {
    location_name: string;
    address: string;
    initial_empty_bins: number;
    default_product_types: { description: string; product_name: string }[];
}

type PickupItems = {
    id: string;
    customer_id: string;
    pickup_location: PickupLocation;
    pickup_date: string;
    assigned_driver: string;
    empty_bins_delivered: number;
    filled_bins_collected: number;
    products_collected: string;
    driver_id: string;
};

type ProductCollected = {
    quantity: number;
    product_name: string;
};

type AddEditPickupModalProps = {
    isOpen: boolean;
    item: PickupItems | null;
    onClose: () => void;
    onRefresh: () => void;
    add_pickup: boolean;
};

const AddEditPickupModal: React.FC<AddEditPickupModalProps> = ({
    isOpen,
    item,
    onClose,
    onRefresh,
    add_pickup,
}) => {
    const [customers, setCustomers] = useState<
        { id: string; company_name: string }[]
    >([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>(
        []
    );
    const [productTypes, setProductTypes] = useState<
        { product_name: string; product_description: string }[]
    >([]);

    const [formData, setFormData] = useState({
        customer_id: '',
        pickup_location: { address: '', location_name: '' },
        pickup_date: '',
        driver_id: '', // Changed from assigned_driver to driver_id
        empty_bins_delivered: 0,
        filled_bins_collected: 0,
        products_collected: [] as ProductCollected[],
    });

    const stableOnRefresh = useCallback(() => {
        console.log('Calling onRefresh...');
        onRefresh();
        setForceUpdate((prev) => prev + 1); // Force re-render
    }, [onRefresh]);

    useEffect(() => {
        if (isOpen) {
            console.log('Interval started');
            const interval = setInterval(stableOnRefresh, 10000000000);
            return () => clearInterval(interval);
        }
    }, [isOpen, stableOnRefresh]);

    const [forceUpdate, setForceUpdate] = useState(0);

    useEffect(() => {
        if (isOpen) {
            console.log('Interval started');
            const interval = setInterval(() => {
                console.log('Calling onRefresh...');
                onRefresh();
                setForceUpdate((prev) => prev + 1); // Trigger rerender
            }, 10000000000);
            return () => clearInterval(interval);
        }
    }, [isOpen, onRefresh]);

    useEffect(() => {
        if (isOpen) {
            fetchCustomers();
            fetchDrivers();
            fetchProducts();
            if (item) {
                // Parse products_collected if it's a string
                let parsedProducts = [];
                try {
                    if (typeof item.products_collected === 'string') {
                        parsedProducts = JSON.parse(item.products_collected);
                    } else if (Array.isArray(item.products_collected)) {
                        parsedProducts = item.products_collected;
                    }
                } catch (error) {
                    console.error('Error parsing products:', error);
                    parsedProducts = [];
                }

                setFormData({
                    customer_id: item.customer_id || '',
                    pickup_location: item.pickup_location || {
                        address: '',
                        location_name: '',
                    },
                    pickup_date: item.pickup_date || '',
                    driver_id: item.driver_id || '',
                    empty_bins_delivered: item.empty_bins_delivered || 0,
                    filled_bins_collected: item.filled_bins_collected || 0,
                    products_collected: parsedProducts,
                });
                if (item.customer_id) {
                    fetchPickupLocations(item.customer_id);
                }
            } else {
                setFormData({
                    customer_id: '',
                    pickup_location: { address: '', location_name: '' },
                    pickup_date: '',
                    driver_id: '',
                    empty_bins_delivered: 0,
                    filled_bins_collected: 0,
                    products_collected: [],
                });
            }
        }
    }, [isOpen, item]);

    // for disabling
    const isFormValid = () => {
        // Check if customer is selected
        if (!formData.customer_id) return false;

        // Check if pickup location is selected
        if (
            !formData.pickup_location.location_name ||
            !formData.pickup_location.address
        )
            return false;

        // Check if pickup date and time are set
        if (!formData.pickup_date) return false;

        // Check if driver is selected
        if (!formData.driver_id) return false;

        // Check if at least one product is added with valid quantity
        if (formData.products_collected.length === 0) return false;

        // Verify all products have both name and quantity
        const hasInvalidProducts = formData.products_collected.some(
            (product) => !product.product_name || product.quantity <= 0
        );
        if (hasInvalidProducts) return false;

        return true;
    };

    const getUniqueLocationKey = (location: PickupLocation, index: number) => {
        return `${location.address}-${location.location_name}-${index}`;
    };

    const fetchPickupLocations = async (customerId: string) => {
        const { data, error } = await supabase
            .from('customers')
            .select('locations')
            .eq('id', customerId)
            .single();

        if (error) {
            console.error('Error fetching pickup locations:', error);
            return;
        }

        if (data?.locations) {
            // Assuming locations in the customers table has the same structure as PickupLocation
            const locations = Array.isArray(data.locations)
                ? data.locations
                : [data.locations];
            const formattedLocations = locations.map((location) => ({
                location_name: location.location_name,
                address: location.address,
                initial_empty_bins: location.initial_empty_bins,
                default_product_types: location.default_product_types || [],
            }));

            console.log('Formatted locations:', formattedLocations);
            setPickupLocations(formattedLocations);
        } else {
            setPickupLocations([]);
        }
    };

    const formatTimeToAmPm = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12; // Convert to 12-hour format
        return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    // Add function to fetch drivers
    const fetchDrivers = async () => {
        const { data, error } = await supabase
            .from('drivers')
            .select('id, name, contact_details');

        if (error) {
            console.error('Error fetching drivers:', error);
        } else {
            setDrivers(data || []);
        }
    };

    const fetchCustomers = async () => {
        const { data, error } = await supabase
            .from('customers')
            .select('id, company_name, locations');

        if (error) {
            console.error('Error fetching customers:', error);
            return;
        }

        // Map the data to match the expected format (no need to map 'name' to 'company_name' as it's already fetched)
        const formattedData = data?.map((customer) => ({
            id: customer.id,
            company_name: customer.company_name,
            locations: customer.locations, // Directly use 'company_name'
        }));

        console.log('Formatted customers:', formattedData);

        // Update the state with formatted data
        setCustomers(formattedData || []);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        if (name === 'customer_id') {
            setFormData((prev) => ({
                ...prev,
                customer_id: value,
                pickup_location: { address: '', location_name: '' }, // Reset pickup location
            }));
            if (value) {
                fetchPickupLocations(value);
            }
        } else if (name === 'pickup_location') {
            // Find the complete location object from pickupLocations array
            const selectedLocation = pickupLocations.find(
                (loc) =>
                    `${loc.location_name} - ${loc.address}` === value ||
                    loc.address === value
            );

            if (selectedLocation) {
                setFormData((prev) => ({
                    ...prev,
                    pickup_location: selectedLocation,
                }));
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: name.includes('bins')
                    ? parseInt(value, 10) || 0
                    : value,
            }));
        }
    };

    const handleProductChange = (
        index: number,
        field: keyof ProductCollected,
        value: string
    ) => {
        const updatedProducts = [...formData.products_collected];

        // Update the product based on the field and value
        const updatedProduct = {
            ...updatedProducts[index],
            [field]: field === 'quantity' ? Number(value) : value,
        };

        updatedProducts[index] = updatedProduct;

        // Update the form state to reflect changes in the UI
        setFormData((prev) => ({
            ...prev,
            products_collected: updatedProducts,
        }));
    };

    const aggregateProducts = (products: ProductCollected[]) => {
        const productMap: { [key: string]: number } = {};
        products.forEach((product) => {
            if (productMap[product.product_name]) {
                productMap[product.product_name] += product.quantity;
            } else {
                productMap[product.product_name] = product.quantity;
            }
        });
        return Object.entries(productMap).map(([product_name, quantity]) => ({
            product_name,
            quantity,
        }));
    };

    const addProduct = () => {
        setFormData((prev) => {
            const newProduct = { quantity: 0, product_name: '' };
            const updatedProducts = [...prev.products_collected, newProduct];

            // Check if the product already exists, and if so, merge quantities
            const productName = newProduct.product_name;
            const existingProductIndex = updatedProducts.findIndex(
                (product) => product.product_name === productName
            );

            if (existingProductIndex !== -1) {
                updatedProducts[existingProductIndex].quantity +=
                    newProduct.quantity;
            }

            return {
                ...prev,
                products_collected: updatedProducts,
            };
        });
    };
    const removeProduct = (index: number) => {
        const updatedProducts = [...formData.products_collected];
        updatedProducts.splice(index, 1);
        setFormData((prev) => ({
            ...prev,
            products_collected: updatedProducts,
        }));
    };

    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('product_name, product_description');

        if (error) {
            console.error('Error fetching products:', error);
        } else {
            setProductTypes(data || []);
        }
    };

    const handleSubmit = async () => {
        try {
            if (
                !formData.customer_id ||
                !formData.pickup_date ||
                !formData.driver_id
            ) {
                alert('Please fill in all required fields.');
                return;
            }

            const aggregatedProducts = aggregateProducts(
                formData.products_collected
            );

            const cleanProducts = aggregatedProducts.map((product) => ({
                quantity: Number(product.quantity),
                product_name: product.product_name,
            }));

            const submitData = {
                customer_id: formData.customer_id,
                pickup_location: formData.pickup_location,
                pickup_date: formData.pickup_date,
                driver_id: formData.driver_id,
                empty_bins_delivered: formData.empty_bins_delivered,
                filled_bins_collected: formData.filled_bins_collected,
                products_collected: cleanProducts,
            };

            let result;
            if (item) {
                result = await supabase
                    .from('pickups')
                    .update(submitData)
                    .eq('id', item.id)
                    .select();
            } else {
                result = await supabase
                    .from('pickups')
                    .insert([submitData])
                    .select();
            }

            if (result.error) {
                console.error('Error saving pickup:', result.error);
                alert(result.error.message);
            } else {
                setShowSuccess(true);
                onRefresh();
                onClose();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An unexpected error occurred');
        }
    };
    const { isSidebarOpen } = useSidebar();
    const [showSuccess, setShowSuccess] = useState(false); // Success animation state
    const [error, setError] = useState<string | null>(null); // Error state
    const [loading, setLoading] = useState(false);
    const [formValues, setFormValues] = useState({
        name: '',
        quantity: '',
        description: '',
        reservedLocation: '',
    });

    return (
        <div className="min-h-screen bg-green-50 text-gray-800 flex">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}
            {showSuccess && <SuccessAnimation />}

            <div
                className="flex-1 flex flex-col justify-center"
                style={{
                    paddingTop: '4%',
                    paddingBottom: '4%',
                    height: '100vh',
                }}
            >
                <div className="flex-grow bg-green-50 p-12 overflow-y-auto">
                    <div className="max-w-4xl w-full mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-green-700 flex items-center">
                                <FaPlus className="mr-3 text-green-600" />
                                {item ? 'Edit Pickup' : 'Add Pickup'}
                            </h1>
                            <p className="text-lg font-light text-green-600">
                                {item
                                    ? 'Modify pickup details'
                                    : 'Schedule a new pickup'}
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
                            {/* Customer Selection */}
                            <FormField label="Customer" required>
                                <select
                                    name="customer_id"
                                    value={formData.customer_id}
                                    onChange={handleChange}
                                    className="w-full border p-2"
                                    required
                                >
                                    <option value="">Select Customer</option>
                                    {customers.map((customer) => (
                                        <option
                                            key={customer.id}
                                            value={customer.id}
                                        >
                                            {customer.company_name}
                                        </option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField label="Pickup Location" required>
                                <select
                                    name="pickup_location"
                                    value={`${formData.pickup_location?.location_name} - ${formData.pickup_location?.address}`}
                                    onChange={handleChange}
                                    className="w-full border p-2"
                                    required
                                >
                                    <option value="">
                                        Select Pickup Location
                                    </option>
                                    {pickupLocations.map((location, index) => (
                                        <option
                                            key={getUniqueLocationKey(
                                                location,
                                                index
                                            )}
                                            value={`${location.location_name} - ${location.address}`}
                                        >
                                            {location.location_name} -{' '}
                                            {location.address}
                                        </option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField label="Select Date" required>
                                <input
                                    name="pickup_date"
                                    type="date"
                                    value={formData.pickup_date.split('T')[0]} // Extract only the date part
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            pickup_date: `${e.target.value}T${formData.pickup_date.split('T')[1] || '00:00'}`,
                                        }))
                                    }
                                    className="w-full border p-2"
                                    required
                                />
                            </FormField>

                            <FormField label="Select Time" required>
                                <input
                                    name="pickup_time"
                                    type="time"
                                    value={
                                        formData.pickup_date.split('T')[1] ||
                                        '00:00'
                                    } // Extract the time part
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            pickup_date: `${formData.pickup_date.split('T')[0]}T${e.target.value}`,
                                        }))
                                    }
                                    className="w-full border p-2"
                                    required
                                />
                            </FormField>

                            <FormField label="Select Driver" required>
                                <select
                                    name="driver_id"
                                    value={formData.driver_id}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded"
                                    required
                                >
                                    <option value="">Select Driver</option>
                                    {drivers.map((driver) => (
                                        <option
                                            key={driver.id}
                                            value={driver.id}
                                        >
                                            {driver.name}
                                        </option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField label="Number of Empty Bins to Deliver">
                                <input
                                    name="empty_bins_delivered"
                                    type="number"
                                    min="0"
                                    value={formData.empty_bins_delivered}
                                    onChange={handleChange}
                                    placeholder="Empty Bins"
                                    className="w-full border p-2"
                                />
                            </FormField>

                            <FormField label="Expected Products to Collect in units (kg)">
                                {formData.products_collected.map(
                                    (product, index) => (
                                        <div
                                            key={index}
                                            className="flex space-x-2 mb-2"
                                        >
                                            <select
                                                value={product.product_name}
                                                onChange={(e) =>
                                                    handleProductChange(
                                                        index,
                                                        'product_name',
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full border p-2"
                                            >
                                                <option value="">
                                                    Select a product
                                                </option>
                                                {productTypes.map((type) => (
                                                    <option
                                                        key={type.product_name}
                                                        value={
                                                            type.product_name
                                                        }
                                                    >
                                                        {type.product_name}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={product.quantity}
                                                onChange={(e) =>
                                                    handleProductChange(
                                                        index,
                                                        'quantity',
                                                        e.target.value
                                                    )
                                                }
                                                className="border p-2 w-20"
                                                placeholder="Add units in kg"
                                                min="0"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeProduct(index)
                                                }
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <span className="text-red-500 font-bold text-lg">
                                                    x
                                                </span>
                                            </button>
                                        </div>
                                    )
                                )}
                                <button
                                    type="button"
                                    onClick={addProduct}
                                    className="bg-green-700 text-white px-3 py-2 rounded-lg transition hover:bg-green-700"
                                >
                                    Add Product
                                </button>
                            </FormField>
                            <FormField label="Selected Time">
                                <label>
                                    {formatTimeToAmPm(
                                        formData.pickup_date.split('T')[1] ||
                                            '00:00'
                                    )}
                                </label>
                            </FormField>

                            <div className="flex justify-between mt-8">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex items-center justify-center px-4 py-2 text-sm font-bold bg-gray-100 text-black rounded hover:bg-gray-200 transition whitespace-nowrap min-w-[120px] min-h-[50px]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={!isFormValid() || loading}
                                    className={`flex items-center justify-center px-4 py-2 text-sm font-bold bg-green-600 text-white rounded hover:bg-green-500 transition whitespace-nowrap min-w-[120px] min-h-[50px] ${
                                        !isFormValid() || loading
                                            ? 'opacity-50 cursor-not-allowed'
                                            : ''
                                    }`}
                                >
                                    {loading
                                        ? 'Saving...'
                                        : item
                                          ? 'Save Changes'
                                          : 'Add Pickup'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEditPickupModal;
