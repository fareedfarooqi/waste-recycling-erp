'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AddEditPickupModal from '@/components/AddEditPickupModal';
import { useUserRole } from '@/hooks/useUserRole';

const AddPickupPage = () => {
    const { userRole, loading: roleLoading } = useUserRole();
    const canAddpickup = userRole?.permissions.add_pickup || false;
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
                add_pickup={canAddpickup}
                onRefresh={handleRefresh}
            />
        </div>
    );
};

export default AddPickupPage;
