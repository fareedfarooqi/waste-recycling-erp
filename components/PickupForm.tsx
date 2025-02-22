'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/config/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import SignaturePad from 'react-signature-canvas';
import { Pickup } from './PickupList';
import { useUserRole } from '@/hooks/useUserRole';

interface PickupFormProps {
    pickup: Pickup;
    onComplete: () => Promise<void>;
    viewOnly?: boolean;
}

interface ProductCollection {
    quantity: number;
    product_name: string;
}

export default function PickupForm({
    pickup,
    onComplete,
    viewOnly = false,
}: PickupFormProps) {
    const [formData, setFormData] = useState({
        products_collected: Array.isArray(pickup.products_collected)
            ? pickup.products_collected[0] || {
                  quantity: 0,
                  product_name: 'Organic Waste',
              }
            : { quantity: 0, product_name: 'Organic Waste' },
        empty_bins_delivered: pickup.empty_bins_delivered || 0,
        filled_bins_collected: pickup.filled_bins_collected || 0,
    });

    const [signaturePad, setSignaturePad] = useState<SignaturePad | null>(null);
    const [isLoading, setLoading] = useState(false);
    const { userRole, loading: userRoleLoading } = useUserRole();
    const [signatureUrl, setSignatureUrl] = useState<string | null>(
        pickup.signature
    );

    useEffect(() => {
        const fetchProductName = async () => {
            try {
                const { data, error } = await supabase
                    .from('pickups')
                    .select('products_collected')
                    .eq('id', pickup.id)
                    .single();

                if (data && data.products_collected) {
                    const productName =
                        data.products_collected.product_name || 'Organic Waste';
                    setFormData((prev) => ({
                        ...prev,
                        products_collected: {
                            ...prev.products_collected,
                            product_name: productName,
                        },
                    }));
                }
            } catch (err) {
                console.error('Error fetching product name:', err); // More useful error logging
            }
        };

        fetchProductName();
    }, [pickup.id]);

    // if (userRoleLoading) {
    //     return <div>Loading user role...</div>;
    // }

    // View-only mode for admin/manager or completed pickups
    if (viewOnly || pickup.status === 'completed') {
        return (
            <div className="space-y-4 bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">
                    {pickup.customers?.company_name || 'Unknown Customer'}
                </h2>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Product Name</Label>
                        <div className="p-2 border rounded bg-gray-50">
                            {formData.products_collected.product_name}
                        </div>
                    </div>

                    <div>
                        <Label>Quantity (kg)</Label>
                        <div className="p-2 border rounded bg-gray-50">
                            {formData.products_collected.quantity}
                        </div>
                    </div>

                    <div>
                        <Label>Empty Bins Delivered</Label>
                        <div className="p-2 border rounded bg-gray-50">
                            {formData.empty_bins_delivered}
                        </div>
                    </div>

                    <div>
                        <Label>Filled Bins Collected</Label>
                        <div className="p-2 border rounded bg-gray-50">
                            {formData.filled_bins_collected}
                        </div>
                    </div>
                </div>

                {signatureUrl && (
                    <div>
                        <Label>Customer Signature</Label>
                        <div className="border rounded p-2">
                            <img
                                src={signatureUrl}
                                alt="Customer Signature"
                                className="max-w-full h-auto"
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Check if user has permission to edit
    // Restrict form submission to drivers only
    if (userRole?.role !== 'driver') {
        return <div>You do not have permission to complete this pickup.</div>;
    }

    // Function to upload signature to Supabase Storage
    // const uploadSignatureToBucket = async (signatureBlob: Blob) => {
    const uploadSignatureToBucket = async (signatureBlob: Blob) => {
        try {
            const timestamp = new Date().getTime();
            const fileName = `signature-${timestamp}.png`; // Fix the variable naming for template literal

            const { data, error } = await supabase.storage
                .from('signatures')
                .upload(fileName, signatureBlob, {
                    contentType: 'image/png',
                    cacheControl: '3600',
                    upsert: true,
                });

            if (error) {
                console.error('Error uploading signature:', error.message);
                throw new Error(`Failed to upload signature: ${error.message}`);
            }

            // Fetch public URL
            const { data: publicUrlData } = supabase.storage
                .from('signatures')
                .getPublicUrl(fileName);

            if (!publicUrlData?.publicUrl) {
                throw new Error(
                    'Failed to get public URL for uploaded signature'
                );
            }

            return publicUrlData.publicUrl;
        } catch (error) {
            console.error('Error during signature upload:', error);
            throw new Error(
                error instanceof Error
                    ? error.message
                    : 'Failed to upload signature'
            );
        }
    };
    useEffect(() => {
        const fetchProductName = async () => {
            try {
                const { data, error } = await supabase
                    .from('pickups')
                    .select('products_collected')
                    .eq('id', pickup.id)
                    .single();

                if (error) throw error;

                if (data && data.products_collected) {
                    setFormData((prev) => ({
                        ...prev,
                        products_collected: {
                            ...prev.products_collected,
                            product_name:
                                data.products_collected[0]?.product_name ||
                                'Unknown',
                        },
                    }));
                }
            } catch (err) {
                console.error('Error fetching product name:', err);
            }
        };

        fetchProductName();
    }, [pickup.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!signaturePad || signaturePad.isEmpty()) {
            alert('Please provide a signature.');
            return;
        }

        setLoading(true);

        try {
            // Get signature blob
            const signatureDataUrl = signaturePad.toDataURL('image/png');
            const response = await fetch(signatureDataUrl);
            const signatureBlob = await response.blob();

            // Upload signature and get URL
            const signatureUrl = await uploadSignatureToBucket(signatureBlob);

            const productsCollectedArray = [
                {
                    quantity: formData.products_collected.quantity,
                    product_name: formData.products_collected.product_name,
                },
            ];

            // Update the pickup record
            const { error: updateError } = await supabase
                .from('pickups')
                .update({
                    products_collected: productsCollectedArray,
                    empty_bins_delivered: formData.empty_bins_delivered,
                    filled_bins_collected: formData.filled_bins_collected,
                    signature: signatureUrl,
                    status: 'completed',
                })
                .eq('id', pickup.id);

            if (updateError) {
                throw new Error(
                    `Failed to update pickup: ${updateError.message}`
                );
            }

            alert('Pickup successfully completed!');
            await onComplete();
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Unknown error occurred';
            console.error('Error submitting pickup:', errorMessage);
            alert(`Failed to submit pickup: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-white p-4 rounded-lg shadow"
        >
            <h2 className="text-xl font-semibold mb-4">
                {pickup.customers?.company_name || 'Unknown Customer'}
            </h2>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="product_name">Product Name</Label>
                    <Input
                        id="product_name"
                        type="text"
                        value={formData.products_collected.product_name}
                        onChange={(e) => {
                            setFormData((prev) => ({
                                ...prev,
                                products_collected: {
                                    ...prev.products_collected,
                                    product_name: e.target.value,
                                },
                            }));
                        }}
                        readOnly={true}
                    />
                </div>

                <div>
                    <Label htmlFor="quantity">Quantity (kg)</Label>
                    <Input
                        id="quantity"
                        type="number"
                        step="0.1"
                        value={formData.products_collected.quantity}
                        onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (value >= 0 || isNaN(value)) {
                                setFormData((prev) => ({
                                    ...prev,
                                    products_collected: {
                                        ...prev.products_collected,
                                        quantity: value || 0,
                                    },
                                }));
                            }
                        }}
                        required
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="emptyBins">
                    Number of Empty Bins Delivered
                </Label>
                <Input
                    id="emptyBins"
                    type="number"
                    value={formData.empty_bins_delivered.toString()}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            empty_bins_delivered:
                                parseInt(e.target.value, 10) || 0,
                        }))
                    }
                    required
                />
            </div>

            <div>
                <Label htmlFor="filledBins">Filled Bins Collected</Label>
                <Input
                    id="filledBins"
                    type="number"
                    value={formData.filled_bins_collected.toString()}
                    onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (value >= 0 || isNaN(value)) {
                            setFormData((prev) => ({
                                ...prev,
                                filled_bins_collected: value || 0,
                            }));
                        }
                    }}
                    required
                />
            </div>

            <div>
                <Label>Customer Signature</Label>
                <div className="border rounded-lg p-2">
                    <SignaturePad
                        ref={(ref) => setSignaturePad(ref)}
                        canvasProps={{ className: 'w-full h-40' }}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => signaturePad?.clear()}
                        className="mt-2"
                    >
                        Clear Signature
                    </Button>
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Save and Submit'}
            </Button>
        </form>
    );
}
