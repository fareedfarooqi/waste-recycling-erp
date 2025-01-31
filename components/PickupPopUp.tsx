// FINAL CODE
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Pickup {
    id: string;
    customerName: string;
    address: string;
    emptyBinsDelivered: number;
    filledBinsCollected: number;
    productsCollected: number;
    signature: string;
    status: string;
}

interface PickupDetailsPopupProps {
    pickup: Pickup;
    onClose: () => void;
    onUpdate: (updatedPickup: Pickup) => void;
}

export function PickupDetailsPopup({
    pickup,
    onClose,
    onUpdate,
}: PickupDetailsPopupProps) {
    const [updatedPickup, setUpdatedPickup] = useState(pickup);

    const handleChange = (field: keyof Pickup, value: string | number) => {
        setUpdatedPickup((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = () => {
        onUpdate(updatedPickup);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-md shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Pickup Details</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        Customer Name
                    </label>
                    <input
                        type="text"
                        value={updatedPickup.customerName}
                        readOnly
                        className="w-full border border-gray-300 p-2 rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        Empty Bins Delivered
                    </label>
                    <input
                        type="number"
                        value={updatedPickup.emptyBinsDelivered}
                        onChange={(e) =>
                            handleChange(
                                'emptyBinsDelivered',
                                parseInt(e.target.value)
                            )
                        }
                        className="w-full border border-gray-300 p-2 rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        Filled Bins Collected
                    </label>
                    <input
                        type="number"
                        value={updatedPickup.filledBinsCollected}
                        onChange={(e) =>
                            handleChange(
                                'filledBinsCollected',
                                parseInt(e.target.value)
                            )
                        }
                        className="w-full border border-gray-300 p-2 rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        Products Collected (kg)
                    </label>
                    <input
                        type="number"
                        value={updatedPickup.productsCollected}
                        onChange={(e) =>
                            handleChange(
                                'productsCollected',
                                parseInt(e.target.value)
                            )
                        }
                        className="w-full border border-gray-300 p-2 rounded-md"
                    />
                </div>
                <div className="flex justify-end space-x-2">
                    <Button onClick={onClose} className="bg-gray-300">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-blue-500 text-white"
                    >
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
}
