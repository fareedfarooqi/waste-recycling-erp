'use client';
import React from 'react';
import Modal from './Modal';
import { supabase } from '@/config/supabaseClient';

type DeleteConfirmationModalProps = {
    isOpen: boolean;
    itemId: string | null;
    onClose: () => void;
    onRefresh: () => void;
    delete_pickup: boolean;
};

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    itemId,
    onClose,
    onRefresh,
    delete_pickup,
}) => {
    const handleDelete = async () => {
        // if (!itemId) return;
        if (!itemId || !delete_pickup) return;

        try {
            // Step 1: Delete dependent rows in `inbound_product_logging`
            const { error: inboundLoggingError } = await supabase
                .from('inbound_product_logging')
                .delete()
                .eq('pickup_id', itemId);

            if (inboundLoggingError) {
                console.error(
                    'Error deleting dependent inbound product logging records:',
                    inboundLoggingError.message
                );
                return;
            }

            // Step 2: Delete dependent rows in `bin_tracking`
            const { error: binTrackingError } = await supabase
                .from('bin_tracking')
                .delete()
                .eq('pickup_id', itemId);

            if (binTrackingError) {
                console.error(
                    'Error deleting dependent bin tracking records:',
                    binTrackingError.message
                );
                return;
            }

            // Step 3: Delete the row in `pickups`
            const { data, error: pickupError } = await supabase
                .from('pickups')
                .delete()
                .eq('id', itemId);

            if (pickupError) {
                console.error(
                    'Error deleting pickup schedule:',
                    pickupError.message,
                    pickupError.details
                );
            } else {
                console.log('Pickup schedule deleted successfully:', data);
                onRefresh();
                onClose();
            }
        } catch (error) {
            console.error(
                'Unexpected error while deleting pickup schedule:',
                error
            );
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-3xl font-bold text-center mb-6">
                Confirm Deletion of Pickup
            </h2>
            <p className="mb-6 text-center">
                {delete_pickup
                    ? 'Are you sure you want to delete this pickup schedule?'
                    : "You don't have permission to delete pickup schedules. Please contact an admin."}
            </p>
            <div className="flex justify-between space-x-4">
                <button
                    onClick={onClose}
                    className="p-4 rounded-lg text-center w-36 transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-300 text-gray-800 px-8 py-3 rounded-lg text-base font-bold hover:bg-gray-400 focus:ring-gray-300"
                >
                    Cancel
                </button>
                <button
                    onClick={handleDelete}
                    disabled={!delete_pickup} // Disable button when canDelete is false
                    className={`p-4 rounded-lg text-center w-36 transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 text-white px-8 py-3 text-base font-bold ${
                        delete_pickup
                            ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300'
                            : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                    Delete
                </button>
            </div>
        </Modal>
    );
};

export default DeleteConfirmationModal;
