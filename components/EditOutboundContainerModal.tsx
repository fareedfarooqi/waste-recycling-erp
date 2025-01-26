'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/config/supabaseClient';
import Button from './Button';
import { IoMdClose } from 'react-icons/io';
import SuccessAnimation from './SuccessAnimation';

interface ProductAllocation {
    productId: string;
    quantity: number;
    productName: string; // Add productName to the product allocation type
}

type OutboundContainerItem = {
    id: string;
    status: 'new' | 'packing' | 'sent' | 'invoiced';
    products_allocated: ProductAllocation[];
    container_photo: string;
    created_at: string;
    updated_at: string;
};

type ProcessingRequestItem = {
    id: string;
    product_id: string;
    quantity: number;
    status: 'new' | 'in_progress' | 'completed';
    created_at: string;
    updated_at: string;
};

type ProductItem = {
    id: string;
    product_name: string;
};

type EditProcessingRequestModalProps = {
    isOpen: boolean;
    onClose: () => void;
    processingRequest?: ProcessingRequestItem;
    outboundContainer: OutboundContainerItem;
    onRequestUpdated: () => void;
};

const EditOutboundContainerstModal = ({
    isOpen,
    onClose,
    processingRequest,
    onRequestUpdated,
}: EditProcessingRequestModalProps): JSX.Element | null => {
    if (!isOpen) return null;

    const [error, setError] = useState<string>(''); // Initialize error state
    const [loading, setLoading] = useState<boolean>(false);
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    return <h1>You clicked edit outbound container</h1>;
};

export default EditOutboundContainerstModal;
