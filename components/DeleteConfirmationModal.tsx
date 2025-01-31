// export default DeleteConfirmationModal;
'use client';
import React from 'react';
import Modal from './Modal';
import { supabase } from '@/config/supabaseClient';

type DeleteConfirmationModalProps = {
    isOpen: boolean;
    itemId: string | null;
    onClose: () => void;
    onRefresh: () => void;
};

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    itemId,
    onClose,
    onRefresh,
}) => {
    const handleDelete = async () => {
        if (!itemId) return;

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
            <h2 className="text-xl font-bold">Confirm Deletion of Pickup</h2>
            <p className="mt-4">
                Are you sure you want to delete this pickup schedule?
            </p>
            <div className="flex justify-end mt-4">
                <button
                    onClick={onClose}
                    className="bg-gray-500 text-white px-4 py-2 mr-2"
                >
                    Cancel
                </button>
                <button
                    onClick={handleDelete}
                    className="bg-red-500 text-white px-4 py-2"
                >
                    Delete
                </button>
            </div>
        </Modal>
    );
};

export default DeleteConfirmationModal;
