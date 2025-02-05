'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AddEditPickupModal from '@/components/AddEditPickupModal';

const AddPickupPage = () => {
    const router = useRouter();

    const handleClose = () => {
        router.push('/pickup');
    };

    const handleRefresh = () => {
        router.push('/pickup');
    };

    return (
        <div className="min-h-screen">
            <AddEditPickupModal
                isOpen={true}
                item={null}
                onClose={handleClose}
                onRefresh={handleRefresh}
            />
        </div>
    );
};

export default AddPickupPage;
