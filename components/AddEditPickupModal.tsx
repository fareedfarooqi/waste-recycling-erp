'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/config/supabaseClient';
import Modal from './Modal';

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
};

const AddEditPickupModal: React.FC<AddEditPickupModalProps> = ({
    isOpen,
    item,
    onClose,
    onRefresh,
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
                onRefresh();
                onClose();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An unexpected error occurred');
        }
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-xl font-bold mb-4">
                {item ? 'Edit Pickup' : 'Add New Pickup'}
            </h2>
            <div className="space-y-4">
                <select
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleChange}
                    className="w-full border p-2"
                    required
                >
                    <option value="">Select Customer</option>
                    {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                            {customer.company_name}
                        </option>
                    ))}
                </select>

                <select
                    name="pickup_location"
                    value={`${formData.pickup_location?.location_name} - ${formData.pickup_location?.address}`}
                    onChange={handleChange}
                    className="w-full border p-2"
                    required
                >
                    <option value="">Select Pickup Location</option>
                    {pickupLocations.map((location, index) => (
                        <option
                            key={getUniqueLocationKey(location, index)}
                            value={`${location.location_name} - ${location.address}`}
                        >
                            {location.location_name} - {location.address}
                        </option>
                    ))}
                </select>

                {/* Number of Empty Bins to Deliver */}
                <div className="mb-4">
                    <label
                        htmlFor="pickup_date"
                        className="block text-sm font-semibold"
                    >
                        Select Date
                    </label>
                    <input
                        name="pickup_date"
                        type="date"
                        value={formData.pickup_date.split('T')[0]} // Extract the date part
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                pickup_date: `${e.target.value}T${formData.pickup_date.split('T')[1] || '00:00'}`,
                            }))
                        }
                        className="w-full border p-2"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label
                        htmlFor="pickup_time"
                        className="block text-sm font-semibold"
                    >
                        Select Time
                    </label>
                    <input
                        name="pickup_time"
                        type="time"
                        value={formData.pickup_date.split('T')[1] || '00:00'} // Extract the time part
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                pickup_date: `${formData.pickup_date.split('T')[0]}T${e.target.value}`,
                            }))
                        }
                        className="w-full border p-2"
                        required
                    />
                </div>

                <select
                    name="driver_id" // Changed from assigned_driver to driver_id
                    value={formData.driver_id}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                >
                    <option value="">Select Driver</option>
                    {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                            {driver.name}
                        </option>
                    ))}
                </select>

                <div className="grid grid-cols-2 gap-4">
                    <h3 className="text-lg font-medium">
                        {' '}
                        Number of Empty Bins to Deliver
                    </h3>
                    <input
                        name="empty_bins_delivered"
                        type="number"
                        min="0"
                        value={formData.empty_bins_delivered}
                        onChange={handleChange}
                        placeholder="Empty Bins"
                        className="w-full border p-2"
                    />
                </div>
                <div>
                    <h3 className="text-lg font-medium">
                        Expected Products to Collect in units (kg)
                    </h3>
                    {formData.products_collected.map((product, index) => (
                        <div key={index} className="flex space-x-2 mb-2">
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
                                <option value="">Select a product</option>
                                {productTypes.map((type) => (
                                    <option
                                        key={type.product_name}
                                        value={type.product_name}
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
                                onClick={() => removeProduct(index)}
                                className="text-red-500 hover:text-red-700"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addProduct}
                        className="bg-green-600  text-white p-2 rounded"
                    >
                        Add Product
                    </button>
                </div>
                <div>
                    <label>
                        Selected Time:{' '}
                        {formatTimeToAmPm(
                            formData.pickup_date.split('T')[1] || '00:00'
                        )}
                    </label>
                </div>
            </div>

            <div className="flex justify-end mt-6 space-x-2">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!isFormValid()}
                    className={`px-4 py-2 text-white rounded ${
                        isFormValid()
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-green-600 cursor-not-allowed'
                    }`}
                >
                    {item ? 'Save Changes' : 'Add Pickup'}
                </button>
            </div>
        </Modal>
    );
};

export default AddEditPickupModal;
